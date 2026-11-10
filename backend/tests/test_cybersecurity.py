import pytest
import json
import sqlite3
from fastapi.testclient import TestClient
from app.main import app, game_store
from app.security_engine import (
    DatabaseSecurity,
    HMACIntegrityShield,
    AntiCheatValidator,
    WAFEngine,
    RateLimiter,
    InputSanitizer,
    SecurityAuditLogger,
    DB_PATH
)

client = TestClient(app)

def test_waf_sql_injection_defense():
    """WAF must block SQL injection queries with HTTP 403 and log intrusion."""
    # Test SQLi in query string
    res = client.get("/api/v1/game/zones?filter=1' UNION SELECT username,password FROM users--")
    assert res.status_code == 403
    data = res.json()
    assert data["error"] == "ACCESS_DENIED_BY_SECURITY_SHIELD"
    assert "SQL_INJECTION" in data["reason"]

    # Verify log was created in SecurityAuditLogger
    recent_logs = SecurityAuditLogger.get_recent_logs(limit=5)
    assert any("SQL_INJECTION" in log["event_type"] for log in recent_logs)

def test_waf_xss_cross_site_scripting_defense():
    """WAF must block XSS payloads (<script>, onerror) with HTTP 403."""
    res = client.get('/api/v1/game/catalog/items?tag=<script>alert("hacked")</script>')
    assert res.status_code == 403
    data = res.json()
    assert "XSS_ATTACK" in data["reason"]

def test_waf_path_traversal_defense():
    """WAF must block directory traversal attempts."""
    res = client.get('/api/v1/game/catalog/items?file=../../../../windows/system32/cmd.exe')
    assert res.status_code == 403
    data = res.json()
    assert "PATH_TRAVERSAL" in data["reason"]

def test_security_response_headers():
    """All API responses must include enterprise defensive security headers."""
    res = client.get("/api/v1/game/save/1")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"
    assert res.headers.get("X-Anti-Hack-Engine") == "Evergreen-Guardian-v7.0"
    assert "Content-Security-Policy" in res.headers

def test_anti_cheat_gold_overflow_and_negative():
    """Anti-cheat engine must reject negative gold or impossible stat overflows."""
    save = game_store.get_save(1)
    save_data = save.dict()

    # Attempt to inject negative gold exploit
    save_data["player"]["gold"] = -99999
    res = client.post("/api/v1/game/save/1", json=save_data)
    assert res.status_code == 400
    assert "Anti-Cheat" in res.json()["message"]

    # Attempt to inject integer overflow gold
    save_data["player"]["gold"] = 999999999999999
    res = client.post("/api/v1/game/save/1", json=save_data)
    assert res.status_code == 400
    assert "Anti-Cheat" in res.json()["message"]

def test_anti_cheat_inventory_duplication_prevention():
    """Anti-cheat engine must reject negative item counts used in dupe glitches."""
    save = game_store.get_save(1)
    save_data = save.dict()
    save_data["player"]["inventory"] = [{"id": "tool_hoe", "count": -50}]

    res = client.post("/api/v1/game/save/1", json=save_data)
    assert res.status_code == 400
    assert "Anti-Cheat" in res.json()["message"]

def test_hmac_cryptographic_signature_tamper_detection():
    """Tampering with player stats must invalidate HMAC signature and be flagged."""
    save = game_store.get_save(1)
    save_data = save.dict()

    # Valid signature
    valid_sig = HMACIntegrityShield.compute_signature(save_data)
    assert HMACIntegrityShield.verify_signature(save_data, valid_sig) is True

    # Tampered state (attacker edited gold locally)
    tampered_data = dict(save_data)
    tampered_data["player"] = dict(save_data["player"])
    tampered_data["player"]["gold"] += 50000

    # Verification must fail with previous signature
    assert HMACIntegrityShield.verify_signature(tampered_data, valid_sig) is False

def test_database_vault_encrypted_at_rest():
    """Database saves stored on disk must be encrypted in SQLite (ciphertext, not raw JSON)."""
    save = game_store.get_save(1)
    save_data = save.dict()
    save_data["player"]["gold"] = 12345
    
    # Save to vault
    success, sig = DatabaseSecurity.save_to_vault(99, save_data)
    assert success is True
    assert sig is not None

    # Inspect SQLite database directly on disk
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT ciphertext, hmac_signature FROM encrypted_vault_saves WHERE slot_id = 99")
        row = cursor.fetchone()
        assert row is not None
        raw_blob, stored_sig = row
        # Ensure ciphertext is NOT plain JSON containing player name or gold
        assert b"Petualangan Fahmi" not in raw_blob
        assert b"12345" not in raw_blob

    # Decrypt through authorized security engine
    loaded_data, err = DatabaseSecurity.load_from_vault(99)
    assert err is None
    assert loaded_data["player"]["gold"] == 12345

def test_input_sanitizer_removes_dangerous_tags():
    """Input sanitizer must strip HTML tags and null bytes."""
    malicious = "<script>stealCookies()</script><b>Rowan's Farm</b>\x00"
    clean = InputSanitizer.clean_text(malicious)
    assert "<script>" not in clean
    assert "\x00" not in clean
    assert "Rowan's Farm" in clean

def test_security_overview_endpoint():
    """GET /api/v1/security/overview must return shield status and defense telemetry."""
    res = client.get("/api/v1/security/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["firewall_status"] == "ACTIVE_PROTECTION"
    assert "threat_level" in data
    assert len(data["defense_modules"]) >= 5

def test_quarantined_ip_auto_ban():
    """Violating security policy multiple times must ban the IP address."""
    test_ip = "198.51.100.77"
    for i in range(3):
        RateLimiter.record_violation(test_ip, "REPEATED_EXPLOIT_ATTEMPTS")

    is_allowed, reason = RateLimiter.is_ip_allowed(test_ip)
    assert is_allowed is False
    assert "IP_QUARANTINED" in reason

    # Unban IP
    unbanned = RateLimiter.unban_ip(test_ip)
    assert unbanned is True
    is_allowed_after, _ = RateLimiter.is_ip_allowed(test_ip)
    assert is_allowed_after is True
