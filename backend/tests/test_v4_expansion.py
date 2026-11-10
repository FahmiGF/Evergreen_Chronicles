# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - V4 Ultimate Expansion Automated Test Suite
Tests for:
1. 12 Skills Progression & Trees, Milestones, and Prestige
2. 10 Tool Tiers, Durability, Repairs, Upgrades, and Enchantments
3. Mounts, Stable Tiers, Bonding, and Riding Controls
4. Mining 60 Floors, Ore Veins, and Machinery
5. Ocean Fishing, 5 Boat Tiers, and Aquarium records
6. Pets and Companion Traits, Animal Ranch harvest
7. 13 Buildings & Automated Factory queues
8. 8 Timed Portals, Dimensional rewards, and Halloween Madness event
9. Collection Journal, 25+ Achievements, and 7 Guilds
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.game_store import game_store

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_save_state():
    """Ensure clean game state before test execution."""
    game_store._init_default_save()

# --- 1. PROGRESSION & SKILLS ---
def test_v4_player_skills_overview():
    res = client.get("/api/v1/game/skills")
    assert res.status_code == 200
    data = res.json()
    assert "skills" in data
    assert "global_level" in data
    assert len(data["skills"]) >= 12
    assert "farming" in data["skills"]
    assert "mining" in data["skills"]
    assert len(data["catalog"]) >= 12

def test_v4_add_skill_xp_and_level_up():
    res = client.post("/api/v1/game/skills/xp", json={"skill_id": "farming", "amount": 800})
    assert res.status_code == 200
    data = res.json()
    assert data["skill_id"] == "farming"
    assert data["level"] >= 2
    assert data["perk_points"] >= 1

def test_v4_unlock_skill_perk():
    # Grant XP to reach Level 5
    client.post("/api/v1/game/skills/xp", json={"skill_id": "farming", "amount": 1500})
    
    perk_res = client.post("/api/v1/game/skills/perk", json={"skill_id": "farming", "perk_id": "farm_swift_sprout"})
    assert perk_res.status_code == 200
    pdata = perk_res.json()
    assert pdata["success"] is True
    assert "farm_swift_sprout" in pdata["unlocked_perks"]

def test_v4_skill_prestige_activation():
    # Set farming level high for prestige test
    save = game_store.get_save(1)
    save.player["skills"]["farming"]["xp"] = 150000
    save.player["skills"]["farming"]["level"] = 55
    
    res = client.post("/api/v1/game/skills/prestige", json={"skill_id": "farming"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["prestige_level"] == 1
    assert "Grandmaster" in data["prestige_title"]

# --- 2. TOOLS & EQUIPMENT ---
def test_v4_equipment_catalog_and_tools():
    res = client.get("/api/v1/game/equipment")
    assert res.status_code == 200
    data = res.json()
    assert "equipment" in data
    assert len(data["tool_tiers"]) == 10
    assert "pickaxe" in data["equipment"]["tools"]

def test_v4_tool_repair_and_upgrade():
    save = game_store.get_save(1)
    pickaxe = save.player["equipment"]["tools"]["pickaxe"]
    pickaxe["durability"] = 50
    
    # Repair
    rep_res = client.post("/api/v1/game/equipment/repair", json={"tool_type": "pickaxe"})
    assert rep_res.status_code == 200
    assert rep_res.json()["tool"]["durability"] == pickaxe["max_durability"]
    
    # Upgrade tier
    save.player["gold"] = 10000
    upg_res = client.post("/api/v1/game/equipment/upgrade", json={"tool_type": "pickaxe"})
    assert upg_res.status_code == 200
    assert upg_res.json()["success"] is True
    assert upg_res.json()["upgraded_tool"]["tier"] > 1

def test_v4_tool_enchantment():
    save = game_store.get_save(1)
    save.player["aether_shards"] = 50
    ench_res = client.post("/api/v1/game/equipment/enchant", json={"tool_type": "pickaxe", "enchantment_id": "fortune"})
    assert ench_res.status_code == 200
    assert ench_res.json()["success"] is True
    assert ench_res.json()["rank"] == 1

# --- 3. MOUNTS & RIDING ---
def test_v4_mounts_and_riding():
    res = client.get("/api/v1/game/mounts")
    assert res.status_code == 200
    data = res.json()
    assert len(data["catalog"]) == 10
    assert len(data["stables"]) == 6
    
    # Toggle riding
    tog_res = client.post("/api/v1/game/mounts/toggle", json={"mount_id": "horse"})
    assert tog_res.status_code == 200
    assert tog_res.json()["is_mounted"] is True
    assert tog_res.json()["speed_mult"] > 1.0

def test_v4_mount_bonding_interaction():
    res = client.post("/api/v1/game/mounts/interact", json={"mount_id": "horse", "action": "feed"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["mount"]["happiness"] >= 95

def test_v4_stable_renovation():
    save = game_store.get_save(1)
    save.player["gold"] = 5000
    res = client.post("/api/v1/game/mounts/upgrade-stable")
    assert res.status_code == 200
    assert res.json()["stable_tier"] == 2

# --- 4. UNDERGROUND MINING & MACHINERY ---
def test_v4_mining_zones_and_excavation():
    res = client.get("/api/v1/game/mining")
    assert res.status_code == 200
    assert len(res.json()["zones"]) == 10
    assert len(res.json()["minerals_catalog"]) == 13
    
    exc_res = client.post("/api/v1/game/mining/excavate", json={"floor": 1})
    assert exc_res.status_code == 200
    assert exc_res.json()["success"] is True
    assert "mat_stone" in exc_res.json()["drops"]

def test_v4_machinery_smelting():
    save = game_store.get_save(1)
    save.player["mining_data"]["minerals_vault"]["mat_copper_ore"] = 20
    save.player["mining_data"]["minerals_vault"]["mat_coal"] = 10
    
    smelt_res = client.post("/api/v1/game/mining/machine", json={"recipe_name": "Peleburan Bijih Tembaga"})
    assert smelt_res.status_code == 200
    assert smelt_res.json()["success"] is True
    assert smelt_res.json()["produced"]["id"] == "ingot_copper"

# --- 5. OCEAN FISHING & BOATS ---
def test_v4_ocean_fishing_and_cast():
    res = client.get("/api/v1/game/ocean-fishing")
    assert res.status_code == 200
    assert len(res.json()["water_zones"]) == 7
    assert len(res.json()["boats_catalog"]) == 5
    
    cast_res = client.post("/api/v1/game/ocean-fishing/cast", json={"zone_id": "zone_lake"})
    assert cast_res.status_code == 200
    assert cast_res.json()["success"] is True
    assert "caught_fish" in cast_res.json()

def test_v4_purchase_exploration_boat():
    save = game_store.get_save(1)
    save.player["gold"] = 2000
    boat_res = client.post("/api/v1/game/ocean-fishing/boat", json={"boat_id": "boat_dinghy"})
    assert boat_res.status_code == 200
    assert boat_res.json()["success"] is True
    assert boat_res.json()["active_boat_id"] == "boat_dinghy"

# --- 6. PETS & RANCH ---
def test_v4_pets_and_ranch():
    res = client.get("/api/v1/game/pets-ranch")
    assert res.status_code == 200
    assert len(res.json()["pets_catalog"]) == 10
    
    pet_res = client.post("/api/v1/game/pets-ranch/action", json={"pet_id": "pet_dog", "action": "play"})
    assert pet_res.status_code == 200
    assert pet_res.json()["success"] is True
    
    harv_res = client.post("/api/v1/game/pets-ranch/harvest")
    assert harv_res.status_code == 200
    assert harv_res.json()["success"] is True

# --- 7. AUTOMATION & FACTORY ---
def test_v4_automation_and_buildings():
    res = client.get("/api/v1/game/automation")
    assert res.status_code == 200
    assert len(res.json()["buildings_catalog"]) == 13
    
    # Construct building
    save = game_store.get_save(1)
    save.player["gold"] = 5000
    bld_res = client.post("/api/v1/game/automation/build", json={"building_id": "dairy"})
    assert bld_res.status_code == 200
    assert bld_res.json()["success"] is True

# --- 8. TIMED PORTALS & HALLOWEEN MADNESS ---
def test_v4_portals_and_events():
    res = client.get("/api/v1/game/portals-events")
    assert res.status_code == 200
    data = res.json()
    assert len(data["portal_catalog"]) == 8
    assert len(data["halloween_shop"]) == 5
    
    # Enter portal
    save = game_store.get_save(1)
    save.player["global_level"] = 10
    portal_res = client.post("/api/v1/game/portals-events/enter", json={"portal_id": "portal_forest"})
    assert portal_res.status_code == 200
    assert portal_res.json()["success"] is True
    assert "resources_collected" in portal_res.json()
    
    # Trick or Treat with NPC
    tot_res = client.post("/api/v1/game/portals-events/trick-or-treat", json={"npc_name": "Mira"})
    assert tot_res.status_code == 200
    assert tot_res.json()["success"] is True
    assert tot_res.json()["candies_gained"] > 0

# --- 9. COLLECTIONS & GUILDS ---
def test_v4_collections_and_guilds():
    col_res = client.get("/api/v1/game/collections")
    assert col_res.status_code == 200
    assert "summary" in col_res.json()
    assert col_res.json()["summary"]["total_items"] >= 30
    
    # Claim achievement
    ach_res = client.post("/api/v1/game/achievements/claim", json={"achievement_id": "ach_ocean_voyager"})
    assert ach_res.status_code == 200
    assert ach_res.json()["success"] is True
    
    # Guilds
    g_res = client.get("/api/v1/game/guilds")
    assert g_res.status_code == 200
    assert len(g_res.json()["catalog"]) == 7
    
    join_res = client.post("/api/v1/game/guilds/join", json={"guild_id": "guild_miner"})
    assert join_res.status_code == 200
    assert join_res.json()["success"] is True
