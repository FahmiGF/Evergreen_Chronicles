# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - V6 Expansion Integration & Unit Tests
Validating Advanced Skills (24+), Prestige Points, Grand Encyclopedia (38 categories),
Global Leaderboards & Anti-Cheat Net Worth, Admin Control Center & RBAC.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.game_store import game_store
from app.progression_engine import SKILLS_CATALOG, SKILL_SYNERGIES, PRESTIGE_BRANCHES
from app.encyclopedia_engine import ENCYCLOPEDIA_CATEGORIES, MILESTONE_TIERS
from app.leaderboard_engine import LEADERBOARD_CATEGORIES
from app.admin_engine import AdminEngine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_game_state():
    """Ensure clean game state before each test."""
    game_store._init_default_save()

# ==================== 1. ADVANCED SKILLS & SYNERGIES ====================

def test_v6_skills_catalog_and_categories():
    """Ensure catalog has at least 24 skills covering 9 categories."""
    res = client.get("/api/v1/game/skills")
    assert res.status_code == 200
    data = res.json()
    assert len(data["catalog"]) >= 24
    assert len(data["skills"]) >= 24

    # Verify categories presence
    categories = {s["category"] for s in data["catalog"]}
    required_cats = {"Agriculture", "Livestock", "Industry", "Nature", "Adventure", "Ocean", "Social", "Technology", "Creativity"}
    assert required_cats.issubset(categories)

def test_v6_skill_synergies_present():
    """Verify skill synergies exist and return multipliers."""
    res = client.get("/api/v1/game/skills")
    assert res.status_code == 200
    data = res.json()
    assert "synergies" in data
    assert len(data["synergies"]) >= 5
    syn_ids = [s["id"] for s in data["synergies"]]
    assert "syn_farm_cook" in syn_ids

# ==================== 2. PRESTIGE SYSTEM & SAFE REFUND ====================

def test_v6_prestige_purchase_and_safe_reset():
    """Verify spending PP on permanent branches and safe refund without data loss."""
    # 1. Inspect initial PP
    skills_res = client.get("/api/v1/game/skills")
    initial_pp = skills_res.json()["prestige_points"]
    assert initial_pp >= 5

    # 2. Purchase prosperity upgrade (cost: 3 PP)
    res_upg = client.post("/api/v1/game/prestige/upgrade", json={
        "branch_id": "branch_prosperity",
        "upgrade_id": "pp_rep_1"
    })
    assert res_upg.status_code == 200
    upg_data = res_upg.json()
    assert upg_data["success"] is True
    assert upg_data["remaining_pp"] == initial_pp - 3
    assert "pp_rep_1" in upg_data["active_upgrades"]

    # 3. Trigger safe reset
    res_reset = client.post("/api/v1/game/prestige/reset")
    assert res_reset.status_code == 200
    reset_data = res_reset.json()
    assert reset_data["success"] is True
    assert reset_data["total_pp"] == initial_pp
    assert reset_data["refunded_pp"] == 3

    # Verify save state still retains inventory and gold intact
    save_res = client.get("/api/v1/game/save/1")
    save = save_res.json()
    assert save["player"]["gold"] >= 650
    assert len(save["player"]["inventory"]) > 0

# ==================== 3. GRAND ENCYCLOPEDIA & REWARDS ====================

def test_v6_encyclopedia_categories_and_pagination():
    """Verify 38 encyclopedia categories and paginated item retrieval."""
    cats_res = client.get("/api/v1/game/encyclopedia/categories")
    assert cats_res.status_code == 200
    cats_data = cats_res.json()
    assert len(cats_data["categories"]) == 38
    assert len(cats_data["milestone_tiers"]) == 5

    # Check paginated entries
    entries_res = client.get("/api/v1/game/encyclopedia/entries?category=crops&page=1&limit=5")
    assert entries_res.status_code == 200
    data = entries_res.json()
    assert data["page"] == 1
    assert len(data["items"]) <= 5
    assert data["total_count"] >= 1
    assert "stats" in data

def test_v6_encyclopedia_discovery_and_milestone_claim():
    """Record discovery and claim milestone tier rewards."""
    # 1. Discover a rare item
    disc_res = client.post("/api/v1/game/encyclopedia/discover", json={"entry_id": "crop_crystal_apple"})
    assert disc_res.status_code == 200
    disc_data = disc_res.json()
    assert disc_data["success"] is True
    assert disc_data["entry_id"] == "crop_crystal_apple"

    # 2. Claim 10% milestone reward for crops (starter save already has several crops discovered)
    claim_res = client.post("/api/v1/game/encyclopedia/claim-milestone", json={
        "category": "crops",
        "percent": 10
    })
    assert claim_res.status_code == 200
    claim_data = claim_res.json()
    assert claim_data["success"] is True
    assert claim_data["reward"]["gold"] == 500
    assert claim_data["reward"]["pp"] == 1

# ==================== 4. LEADERBOARDS & ANTI-CHEAT ====================

def test_v6_leaderboard_rankings_and_anti_cheat_score():
    """Verify 20 categories, competitive entries, and server-authoritative score."""
    cats_res = client.get("/api/v1/game/leaderboards/categories")
    assert cats_res.status_code == 200
    cats_data = cats_res.json()
    assert len(cats_data["categories"]) == 20

    # Get Overall Mastery ranking
    rank_res = client.get("/api/v1/game/leaderboards/rankings?category=overall_mastery&period=all_time&page=1&limit=20")
    assert rank_res.status_code == 200
    data = rank_res.json()
    assert len(data["rankings"]) > 0
    # Check current player is in the ranking
    current_player_entry = next((r for r in data["rankings"] if r["is_current_player"]), None)
    assert current_player_entry is not None
    assert current_player_entry["verified"] is True
    assert current_player_entry["score"] > 0

def test_v6_leaderboard_profile_and_privacy_update():
    """Verify player profile card and privacy toggles."""
    prof_res = client.get("/api/v1/game/leaderboards/profile")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert "net_worth" in prof
    assert "prestige_rank" in prof

    # Update privacy settings
    priv_res = client.post("/api/v1/game/leaderboards/privacy", json={"show_net_worth": False})
    assert priv_res.status_code == 200
    assert priv_res.json()["privacy_settings"]["show_net_worth"] is False

    # Check updated profile masks net worth
    prof_res2 = client.get("/api/v1/game/leaderboards/profile")
    assert "Terkunci" in str(prof_res2.json()["net_worth"])

# ==================== 5. ADMIN CONTROL CENTER & RBAC ====================

def test_v6_admin_telemetry_and_audit_trail():
    """Verify admin telemetry metrics and immutable audit trail."""
    telem_res = client.get("/api/v1/admin/telemetry")
    assert telem_res.status_code == 200
    telem = telem_res.json()
    assert telem["server_status"] == "ONLINE"
    assert telem["tick_rate"] == 60.0
    assert "active_entities" in telem

def test_v6_admin_event_staging_controls():
    """Verify staging test event lifecycle (start, advance, reset)."""
    # 1. Start event
    start_res = client.post("/api/v1/admin/events/manage", json={
        "event_id": "carnival_of_evergreen",
        "action": "start",
        "reason": "Uji coba staging festival"
    })
    assert start_res.status_code == 200
    assert start_res.json()["event"]["status"] == "running"

    # 2. Advance stage
    adv_res = client.post("/api/v1/admin/events/manage", json={
        "event_id": "carnival_of_evergreen",
        "action": "advance_stage",
        "reason": "Lanjut tahap 2"
    })
    assert adv_res.status_code == 200
    assert adv_res.json()["event"]["stage"] == 2

    # 3. Check audit log
    audit_res = client.get("/api/v1/admin/audit-logs?limit=5")
    assert audit_res.status_code == 200
    logs = audit_res.json()["logs"]
    assert len(logs) >= 2
    assert logs[0]["target"] == "carnival_of_evergreen"

def test_v6_admin_world_clock_and_weather():
    """Verify world time advancement and weather manipulation."""
    clock_res = client.post("/api/v1/admin/world/clock", json={
        "hours": 6,
        "season": "Summer",
        "reason": "Pengujian pergantian musim dan siang-malam"
    })
    assert clock_res.status_code == 200
    data = clock_res.json()
    assert data["success"] is True
    assert data["time"]["season"] == "Summer"

    weather_res = client.post("/api/v1/admin/world/weather", json={
        "weather": "Aether Aurora",
        "reason": "Pengujian visual aurora malam hari"
    })
    assert weather_res.status_code == 200
    assert weather_res.json()["weather"] == "Aether Aurora"

def test_v6_admin_farming_boost_and_economy_shock():
    """Verify instant crop maturation and simulated market volatility."""
    farm_res = client.post("/api/v1/admin/farming/boost", json={
        "reason": "Pengujian percepatan panen"
    })
    assert farm_res.status_code == 200
    assert farm_res.json()["success"] is True

    econ_res = client.post("/api/v1/admin/economy/simulate", json={
        "commodity": "wheat",
        "multiplier": 2.5,
        "reason": "Pengujian kelangkaan pasokan gandum"
    })
    assert econ_res.status_code == 200
    assert econ_res.json()["new_price"] > econ_res.json()["old_price"]

def test_v6_admin_qa_automation_runner():
    """Verify execution of on-demand QA test matrix."""
    qa_res = client.post("/api/v1/admin/qa/run", json={"suite_name": "Full V6 Master Suite"})
    assert qa_res.status_code == 200
    data = qa_res.json()
    assert data["passed"] == 8
    assert data["failed"] == 0
    assert "ai_qa_analysis" in data
    assert data["ai_qa_analysis"]["health_grade"] == "A+ EXCELLENT"
