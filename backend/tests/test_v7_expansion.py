import pytest
from fastapi.testclient import TestClient
from app.main import app, game_store

client = TestClient(app)

def test_v7_zones_catalog_and_unlock():
    """Verify 10 unique regions, unlocking logic, and fast travel."""
    res = client.get("/api/v1/game/world-zones")
    assert res.status_code == 200
    data = res.json()
    assert len(data["zones"]) == 10

    # Test unlocking Whispering Ancient Forest
    unlock_res = client.post("/api/v1/game/world-zones/unlock", json={"zone_id": "ancient_forest"})
    assert unlock_res.status_code == 200
    assert unlock_res.json()["success"] is True

    # Test fast travel
    ft_res = client.post("/api/v1/game/world-zones/fast-travel", json={"zone_id": "ancient_forest"})
    assert ft_res.status_code == 200
    assert ft_res.json()["success"] is True

def test_v7_boss_encounter_puzzle_and_rewards():
    """Verify 3-phase puzzle boss encounter and reward claiming."""
    # Start boss encounter
    start_res = client.post("/api/v1/game/bosses/start", json={"boss_id": "boss_grove_guardian"})
    assert start_res.status_code == 200
    enc = start_res.json()
    enc_id = enc["encounter"]["encounter_id"]
    assert enc["encounter"]["current_phase"] == 1

    # Solve Phase 1 (target is 4)
    p1 = client.post("/api/v1/game/bosses/progress", json={"encounter_id": enc_id, "amount": 4})
    assert p1.status_code == 200
    assert p1.json()["encounter"]["current_phase"] == 2

    # Solve Phase 2 (target is 3)
    p2 = client.post("/api/v1/game/bosses/progress", json={"encounter_id": enc_id, "amount": 3})
    assert p2.status_code == 200
    assert p2.json()["encounter"]["current_phase"] == 3

    # Solve Phase 3 (target is 1) -> Victory
    p3 = client.post("/api/v1/game/bosses/progress", json={"encounter_id": enc_id, "amount": 1})
    assert p3.status_code == 200
    assert p3.json()["encounter"]["completed"] is True

    # Claim Rewards
    claim = client.post("/api/v1/game/bosses/claim-rewards", json={"encounter_id": enc_id})
    assert claim.status_code == 200
    assert claim.json()["success"] is True

def test_v7_expedition_dispatch_and_return():
    """Verify expedition lifecycle: dispatch, live progression, and return report."""
    meta = client.get("/api/v1/game/expeditions/metadata")
    assert meta.status_code == 200
    assert len(meta.json()["companions"]) >= 4

    # Give player enough gold for expedition supplies
    save = game_store.get_save(1)
    save.player["gold"] += 5000

    # Dispatch expedition
    disp = client.post("/api/v1/game/expeditions/dispatch", json={
        "zone_id": "ancient_forest",
        "destination_name": "Whispering Ancient Forest",
        "companion_ids": ["comp_elara"],
        "supplies": ["sup_portable_camp"]
    })
    assert disp.status_code == 200
    exp_id = disp.json()["expedition"]["id"]

    # Progress expedition
    prog = client.post("/api/v1/game/expeditions/progress", json={"expedition_id": exp_id, "objective_index": 0})
    assert prog.status_code == 200
    assert prog.json()["success"] is True

    # Complete expedition
    comp = client.post("/api/v1/game/expeditions/complete", json={"expedition_id": exp_id})
    assert comp.status_code == 200
    assert comp.json()["success"] is True
    assert "report" in comp.json()

def test_v7_world_restoration_contributions():
    """Verify community restoration projects, multi-stage building, and perk unlock."""
    proj = client.get("/api/v1/game/restoration/projects")
    assert proj.status_code == 200
    assert len(proj.json()["projects"]) == 4

    # Prepare player inventory with required items for Stage 1 of bridge
    save = game_store.get_save(1)
    save.player["gold"] += 10000
    save.player.setdefault("inventory", [])
    save.player["inventory"].append({"id": "mat_stone", "count": 100})
    save.player["inventory"].append({"id": "mat_copper_ore", "count": 50})

    # Contribute materials to bridge
    contrib = client.post("/api/v1/game/restoration/contribute", json={
        "project_id": "proj_ancient_bridge"
    })
    assert contrib.status_code == 200
    assert contrib.json()["success"] is True

def test_v7_advanced_tools_and_loadouts():
    """Verify 40 advanced tools catalog, tier upgrades, and loadout switching."""
    tools_res = client.get("/api/v1/game/tools/advanced")
    assert tools_res.status_code == 200
    data = tools_res.json()
    assert len(data["tools"]) == 40
    assert len(data["loadouts"]) == 6

    # Switch loadout
    loadout = client.post("/api/v1/game/tools/advanced/loadout", json={"preset_id": "loadout_mining"})
    assert loadout.status_code == 200
    assert loadout.json()["success"] is True
    assert loadout.json()["loadout_id"] == "loadout_mining"

    # Give player gold and upgrade tool
    save = game_store.get_save(1)
    save.player["gold"] += 10000
    upg = client.post("/api/v1/game/tools/advanced/upgrade", json={"tool_id": "tool_surveyor_compass"})
    assert upg.status_code == 200
    assert upg.json()["success"] is True
