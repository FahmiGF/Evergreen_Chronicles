import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.game_store import game_store
from app.npc_engine import a_star_search, npc_manager

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Evergreen Chronicles" in data["service"]

def test_get_all_items():
    response = client.get("/api/v1/game/items")
    assert response.status_code == 200
    items = response.json()
    assert "tool_hoe" in items
    assert "seed_parsnip" in items
    assert "crop_parsnip" in items
    assert "mat_aether_crystal" in items

def test_get_crafting_and_cooking():
    res_craft = client.get("/api/v1/game/crafting-recipes")
    assert res_craft.status_code == 200
    assert len(res_craft.json()) >= 3

    res_cook = client.get("/api/v1/game/cooking-recipes")
    assert res_cook.status_code == 200
    assert len(res_cook.json()) >= 3
    recipe_ids = [r["id"] for r in res_cook.json()]
    assert "recipe_parsnip_soup" in recipe_ids

def test_save_and_load_game():
    res_load = client.get("/api/v1/game/save/1")
    assert res_load.status_code == 200
    save_data = res_load.json()
    assert save_data["player"]["name"] == "Fahmi"

    save_data["player"]["gold"] = 2400
    res_save = client.post("/api/v1/game/save/1", json=save_data)
    assert res_save.status_code == 200

    res_verify = client.get("/api/v1/game/save/1")
    assert res_verify.json()["player"]["gold"] == 2400

def test_sleep_and_advance_day():
    save = game_store.get_save(1)
    save.shipping_bin = [{"item_id": "crop_parsnip", "count": 2, "sell_price": 45}]
    
    res = client.post("/api/v1/game/sleep/1")
    assert res.status_code == 200
    data = res.json()
    summary = data["summary"]
    assert summary["total_gold_earned"] == 90
    assert data["updated_state"]["player"]["stamina"] == data["updated_state"]["player"]["max_stamina"]

def test_unlock_tech_progression():
    save = game_store.get_save(1)
    save.player["gold"] = 5000
    save.player["aether_shards"] = 100

    res = client.post("/api/v1/game/unlock-tech/1", json={"tech_id": "tech_sprinkler_1"})
    assert res.status_code == 200
    result = res.json()
    assert result["success"] is True
    assert result["era_level"] >= 2

def test_dungeon_clear_rewards():
    res = client.post("/api/v1/game/dungeon-clear/1", json={
        "slimes_defeated": 5,
        "floors_cleared": 3,
        "ores_looted": {"mat_copper_ore": 4, "mat_aether_crystal": 1},
        "aether_earned": 15,
        "gold_earned": 120
    })
    assert res.status_code == 200
    data = res.json()
    assert data["gold_earned"] == 120
    assert data["aether_earned"] == 15

def test_npc_a_star_pathfinding():
    # Test A* algorithm finding valid path avoiding obstacles
    blocked = {(7, 7), (7, 8), (7, 9)} # Wall
    start = (6, 8)
    goal = (8, 8)
    path = a_star_search(start, goal, blocked, grid_w=16, grid_h=16)
    
    assert len(path) > 0
    assert path[0] == start
    assert path[-1] == goal
    # Ensure none of the blocked tiles are in the path
    for p in path:
        assert p not in blocked

def test_pet_animals():
    res = client.post("/api/v1/game/animals/pet/1", json={"animal_type": "sheep"})
    assert res.status_code == 200
    data = res.json()
    assert data["gold_earned"] == 80
    assert "Domba Aether" in data["message"]

def test_metrics_endpoint():
    res = client.get("/api/v1/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "online_players" in data
    assert "messages_received" in data

def test_npc_voice_ai_dialogue():
    res = client.post("/api/v1/game/npc-dialogue-ai", json={"npc_id": "npc_elara", "topic": "work"})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Elara"
    assert "spoken_text" in data
    assert len(data["spoken_text"]) > 10

    # Rowan deep blacksmith test
    res_rowan = client.post("/api/v1/game/npc-dialogue-ai", json={"npc_id": "npc_rowan", "topic": "greeting"})
    assert res_rowan.status_code == 200
    assert res_rowan.json()["name"] == "Rowan"

def test_zones_and_travel():
    res_zones = client.get("/api/v1/game/zones")
    assert res_zones.status_code == 200
    zones = res_zones.json()
    assert len(zones) == 8
    zone_ids = [z["id"] for z in zones]
    assert "zone_farm" in zone_ids
    assert "zone_village" in zone_ids
    assert "zone_woods" in zone_ids
    assert "zone_lab" in zone_ids
    assert "zone_lake" in zone_ids
    assert "zone_summit" in zone_ids

    # Travel to village
    res_travel = client.post("/api/v1/game/zones/travel/1", json={"zone_id": "zone_village"})
    assert res_travel.status_code == 200
    data = res_travel.json()
    assert data["success"] is True
    assert "Greenvale Village" in data["current_location"]

def test_tutorial_progression():
    res_tut = client.get("/api/v1/game/tutorial/1")
    assert res_tut.status_code == 200
    quests = res_tut.json()
    assert len(quests) == 7
    assert quests[0]["step"] == 1

    # Claim step 1 reward
    initial_gold = client.get("/api/v1/game/save/1").json()["player"]["gold"]
    res_claim = client.post("/api/v1/game/tutorial/claim/1", json={"step": 1})
    assert res_claim.status_code == 200
    data = res_claim.json()
    assert data["gold_earned"] == 60
    assert data["current_gold"] == initial_gold + 60

def test_npc_quests_and_turn_in_beetroots():
    # 1. Fetch quests list
    res_q = client.get("/api/v1/game/npc-quests/1")
    assert res_q.status_code == 200
    quests = res_q.json()
    assert len(quests) >= 16

    # Verify beetroot quest exists
    beetroot_quest = next((q for q in quests if q["id"] == "quest_rowan_beetroots"), None)
    assert beetroot_quest is not None
    assert beetroot_quest["target_count"] == 5
    assert beetroot_quest["target_item"] == "crop_beetroot"

    # Give player 5 beetroots in inventory
    save_data = client.get("/api/v1/game/save/1").json()
    save_data["player"]["inventory"][0] = {"item_id": "crop_beetroot", "count": 6}
    client.post("/api/v1/game/save/1", json=save_data)

    # Turn in 5 beetroots quest
    res_turnin = client.post("/api/v1/game/npc-quests/turn-in/1", json={"quest_id": "quest_rowan_beetroots"})
    assert res_turnin.status_code == 200
    data = res_turnin.json()
    assert data["success"] is True
    assert data["reward_gold"] == 320
    assert "quest_rowan_beetroots" in data["completed_npc_quests"]

def test_quest_having_friends_with_us():
    # Ensure one NPC has level 5 or above
    save_data = client.get("/api/v1/game/save/1").json()
    for n in save_data["npcs"]:
        if n["id"] == "npc_mira":
            n["affection_level"] = 5
            n["friendship_points"] = 500
    client.post("/api/v1/game/save/1", json=save_data)

    # Turn in "Having Friends with Us!"
    res = client.post("/api/v1/game/npc-quests/turn-in/1", json={"quest_id": "quest_mira_friendship"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["reward_gold"] == 800
    assert data["reward_item"] == "item_fellowship_medal"
    assert len(data["affection_results"]) == 4  # Boosts all 4 NPCs!

def test_storyline_chapters_and_trailer():
    res = client.get("/api/v1/game/storyline/1")
    assert res.status_code == 200
    chapters = res.json()
    assert len(chapters) >= 7

    # Prologue trailer must be unlocked
    prologue = next(c for c in chapters if c["id"] == "chap_prologue")
    assert prologue["unlocked"] is True
    assert len(prologue["scenes"]) >= 3

    # Chapter 3 ("Having Friends with Us!") should now be unlocked since we satisfied it
    chap3 = next(c for c in chapters if c["id"] == "chap_03")
    assert chap3["unlocked"] is True

def test_npc_gift_affection_level_up():
    save_data = client.get("/api/v1/game/save/1").json()
    save_data["player"]["inventory"][0] = {"item_id": "crop_strawberry", "count": 2}
    client.post("/api/v1/game/save/1", json=save_data)

    # Elara loves strawberries
    res = client.post("/api/v1/game/npc/gift/1", json={"npc_id": "npc_elara", "item_id": "crop_strawberry"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["is_favorite"] is True
    assert "affection_result" in data
    assert data["affection_result"]["new_level"] <= 10

def test_playable_races_and_options():
    res = client.get("/api/v1/game/races")
    assert res.status_code == 200
    races = res.json()
    assert len(races) == 10
    race_ids = [r["id"] for r in races]
    assert "race_human" in race_ids
    assert "race_high_elf" in race_ids
    assert "race_dragonkin" in race_ids
    assert "race_shadowborn" in race_ids

    # Check Customization options
    opt_res = client.get("/api/v1/game/character/options")
    assert opt_res.status_code == 200
    opts = opt_res.json()
    assert "skin_tones" in opts
    assert len(opts["skin_tones"]) >= 7
    assert "hair_styles" in opts
    assert len(opts["hair_styles"]) >= 8

def test_character_customization_persistence():
    payload = {
        "profile": {
            "race_id": "race_high_elf",
            "personality_id": "pers_curious",
            "background_id": "bg_scholar",
            "skin_tone": "tone_pale",
            "hair_style": "elven_twin",
            "hair_color": "#e2e8f0",
            "eye_color": "#059669",
            "ears": "ears_elven_long"
        },
        "wardrobe": {
            "headwear": "crown_laurel",
            "top": "tunic_emerald_druid",
            "bottom": "skirt_pleated_green"
        }
    }
    res = client.post("/api/v1/game/character/customize/1", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["character_profile"]["race_id"] == "race_high_elf"
    assert data["character_profile"]["ears"] == "ears_elven_long"
    assert data["wardrobe"]["top"] == "tunic_emerald_druid"

    # Verify persistence via GET /save/1
    save_res = client.get("/api/v1/game/save/1")
    assert save_res.status_code == 200
    saved = save_res.json()
    assert saved["player"]["character_profile"]["race_id"] == "race_high_elf"
    assert saved["player"]["wardrobe"]["headwear"] == "crown_laurel"

def test_landscape_painter_and_brushes():
    res = client.get("/api/v1/game/landscape/brushes")
    assert res.status_code == 200
    brushes = res.json()
    assert len(brushes) >= 8

    # Paint tile (5, 5) with sand
    paint_res = client.post("/api/v1/game/landscape/paint/1", json={"x": 5, "y": 5, "brush_type": "sand"})
    assert paint_res.status_code == 200
    data = paint_res.json()
    assert data["success"] is True
    assert data["tile"]["tile_type"] == "sand"

def test_civilization_status_and_layers():
    res = client.get("/api/v1/game/civilization/status/1")
    assert res.status_code == 200
    data = res.json()
    assert "civilization" in data
    assert "current_era" in data
    assert "all_eras" in data
    assert len(data["all_eras"]) == 4
    civ = data["civilization"]
    assert "layers" in civ
    layers = civ["layers"]
    assert "population" in layers
    assert "economy" in layers
    assert "infrastructure" in layers
    assert "social" in layers
    assert "governance" in layers
    assert "environment" in layers
    assert "culture" in layers

def test_dynamic_market_and_trading():
    res = client.get("/api/v1/game/economy/market/1")
    assert res.status_code == 200
    data = res.json()
    assert "commodities" in data
    assert "wood" in data["commodities"]
    assert "wheat" in data["commodities"]
    assert data["commodities"]["wheat"]["current_price"] >= data["commodities"]["wheat"]["min_price"]

    # Test Buying Commodity
    buy_res = client.post("/api/v1/game/economy/trade/1", json={"action": "buy", "commodity_id": "wood", "amount": 2})
    assert buy_res.status_code == 200
    buy_data = buy_res.json()
    assert buy_data["success"] is True

    # Test Selling Commodity
    sell_res = client.post("/api/v1/game/economy/trade/1", json={"action": "sell", "commodity_id": "wheat", "amount": 1})
    assert sell_res.status_code == 200
    sell_data = sell_res.json()
    assert sell_data["success"] is True

def test_living_npcs_and_interaction():
    res = client.get("/api/v1/game/npcs/living/1")
    assert res.status_code == 200
    data = res.json()
    assert "npcs" in data
    assert len(data["npcs"]) >= 4
    elara = next((n for n in data["npcs"] if n["id"] == "npc_elara"), None)
    assert elara is not None
    assert "current_schedule" in elara
    assert "relationships" in elara
    assert "trust" in elara["relationships"]
    assert "friendship" in elara["relationships"]

    # Test Interaction
    interact_res = client.post("/api/v1/game/npcs/npc_elara/interact/1", json={"interaction_type": "chat"})
    assert interact_res.status_code == 200
    interact_data = interact_res.json()
    assert interact_data["success"] is True
    assert len(interact_data["speech"]) > 0

def test_dynamic_civilization_quests():
    res = client.get("/api/v1/game/civilization/quests/1")
    assert res.status_code == 200
    data = res.json()
    assert "quests" in data
    assert len(data["quests"]) > 0

def test_save_checksum_and_integrity():
    save_res = client.get("/api/v1/game/save/1")
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert "version" in save_data
    assert save_data["version"] == "2.0.0"

    # Save mutated state and check checksum returned
    post_res = client.post("/api/v1/game/save/1", json=save_data)
    assert post_res.status_code == 200
    saved = post_res.json()
    assert saved.get("checksum") is not None




