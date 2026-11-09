import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.game_store import game_store

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
    assert items["tool_hoe"]["category"] == "tool"

def test_get_crafting_recipes():
    response = client.get("/api/v1/game/crafting-recipes")
    assert response.status_code == 200
    recipes = response.json()
    assert len(recipes) >= 3
    recipe_ids = [r["result_item_id"] for r in recipes]
    assert "tech_sprinkler_basic" in recipe_ids

def test_save_and_load_game():
    # Load slot 1
    res_load = client.get("/api/v1/game/save/1")
    assert res_load.status_code == 200
    save_data = res_load.json()
    assert save_data["player"]["name"] == "Fahmi"
    assert save_data["world"]["season"] == "Spring"

    # Modify player gold and save
    save_data["player"]["gold"] = 1500
    res_save = client.post("/api/v1/game/save/1", json=save_data)
    assert res_save.status_code == 200

    # Verify loaded state reflects saved gold
    res_verify = client.get("/api/v1/game/save/1")
    assert res_verify.json()["player"]["gold"] == 1500

def test_sleep_and_advance_day():
    # Add an item to shipping bin
    save = game_store.get_save(1)
    save.shipping_bin = [{"item_id": "crop_parsnip", "count": 2, "sell_price": 45}]
    initial_gold = save.player["gold"]

    # Sleep
    res = client.post("/api/v1/game/sleep/1")
    assert res.status_code == 200
    data = res.json()
    summary = data["summary"]
    
    assert summary["total_gold_earned"] == 90
    assert summary["day"] >= 6
    # Stamina should be full
    assert data["updated_state"]["player"]["stamina"] == data["updated_state"]["player"]["max_stamina"]

def test_unlock_tech_progression():
    save = game_store.get_save(1)
    save.player["gold"] = 5000
    save.player["aether_shards"] = 100

    # Attempt to unlock Crystal Sprinkler Mk.I (era 2 tech)
    res = client.post("/api/v1/game/unlock-tech/1", json={"tech_id": "tech_sprinkler_1"})
    assert res.status_code == 200
    result = res.json()
    assert result["success"] is True
    assert result["era_level"] >= 2
    assert "Era 2" in result["era_name"]

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

    # Check inventory has the looted copper
    save = game_store.get_save(1)
    has_copper = any(s and s.get("item_id") == "mat_copper_ore" for s in save.player["inventory"])
    assert has_copper
