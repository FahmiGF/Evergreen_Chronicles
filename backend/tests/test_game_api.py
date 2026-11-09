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

