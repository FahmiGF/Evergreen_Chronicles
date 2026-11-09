import os
import uuid
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.game_store import game_store, ITEMS_DATABASE, CRAFTING_RECIPES, ZONES_CATALOG, TUTORIAL_QUESTS
from app.npc_engine import npc_manager
from app.websocket_manager import world_hub

app = FastAPI(
    title="Evergreen Chronicles Online Engine & Multiplayer Hub",
    description="Full-scale backend server with real-time WebSockets, A* NPC pathfinding, farming, fishing, and cooking.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Background NPC Simulation Loop
async def npc_simulation_loop():
    """Background task updating NPC A* movement and broadcasting sync every 300ms."""
    while True:
        try:
            await asyncio.sleep(0.3)
            save = game_store.get_save(1)
            farm_grid = save.farm_grid if save else []
            updated_npcs = npc_manager.update_all(0.3, farm_grid)

            if world_hub.active_connections:
                await world_hub.broadcast({
                    "type": "npc_sync",
                    "npcs": updated_npcs
                })
        except asyncio.CancelledError:
            break
        except Exception as e:
            await asyncio.sleep(1.0)

@app.on_event("startup")
async def on_startup():
    asyncio.create_task(npc_simulation_loop())

# Request Models
class UnlockTechRequest(BaseModel):
    tech_id: str

class DungeonClearRequest(BaseModel):
    slimes_defeated: int
    floors_cleared: int
    ores_looted: Dict[str, int]
    aether_earned: int
    gold_earned: int

class CookRecipeRequest(BaseModel):
    recipe_id: str

class PetAnimalRequest(BaseModel):
    animal_type: str  # "sheep" or "chicken"

class NpcAiDialogueRequest(BaseModel):
    npc_id: str
    topic: str  # "greeting", "work", "advice", "aether_lore", "era_opinion"

NPC_VOICE_AI_DATABASE = {
    "npc_elara": {
        "name": "Elara",
        "title": "Tabib Desa & Ahli Herbal",
        "tone": "Lembut & Menenangkan",
        "dialogues": {
            "greeting": "Selamat pagi, sahabatku. Udara segar Aetherwyn hari ini membawa aroma harum kuncup bunga liar. Apakah badanmu terasa bugar?",
            "work": "Aku sedang meracik salep pemulih dari daun mint dan sari buah liar. Di lembah sebelah timur, pucuk tanaman herbal mulai bersemi kembali.",
            "advice": "Jika energimu terkuras setelah seharian mencangkul ladang, rebuslah beberapa parsnip di dapur rumahmu. Sup hangat adalah obat terbaik untuk keletihan.",
            "aether_lore": "Kristal Aether tidak hanya menggerakkan mesin penemu Nessa, kristal itu juga menumbuhkan tanaman ajaib seperti Moonberry yang hanya bersinar di malam hari.",
            "era_opinion": "Meskipun teknologi desa kita berkembang pesat, kita tidak boleh melupakan keharmonisan dengan tanah subur dan pepohonan hutan leluhur."
        }
    },
    "npc_rowan": {
        "name": "Rowan",
        "title": "Pandai Besi Kerajaan",
        "tone": "Berat, Berwibawa & Kuat",
        "dialogues": {
            "greeting": "Hmph. Api tungku tempa sedang berkobar panas. Jangan berdiri terlalu dekat jika kau belum terbiasa dengan percikan bara besi.",
            "work": "Aku baru saja menempa mata cangkul baja dan bilah pedang ksatria. Ketajaman logam bergantung pada kesabaran palu dan tingginya panas bara.",
            "advice": "Jika kau turun ke Gua Terlupakan, bawalah beliung yang kokoh. Monster slime di lantai bawah takut pada tebasan pedang berkecepatan tinggi.",
            "aether_lore": "Kristal Aether memiliki titik lebur yang unik. Jika ditempa bersama bijih besi berkualitas, logam itu tidak akan pernah berkarat seumur hidup.",
            "era_opinion": "Dulu kita menempa semuanya dengan tangan dan peluh keringat. Kini mesin uap dan lori tambang Nessa mempermudah suplai bijih besi ke bengkelku."
        }
    },
    "npc_nessa": {
        "name": "Nessa",
        "title": "Insinyur Mesin & Penemu",
        "tone": "Cerdas, Bersemangat & Cepat",
        "dialogues": {
            "greeting": "Hei! Lihat ini! Getaran frekuensi kristal ini baru saja menyalakan lampu tanpa setetes pun minyak tanah! Bukankah ini penemuan yang luar biasa?!",
            "work": "Aku sedang menyempurnakan prototipe Smart Sprinkler Mk.II. Dengan sedikit rangkaian tembaga dan kristal Aether, ladangmu bisa tersiram otomatis 8 petak sekeliling!",
            "advice": "Jangan ragu menginvestasikan koin emasmu pada Pohon Riset Teknologi di bengkel riset. Semakin maju era peradaban kita, semakin banyak otomatisasi yang bisa kau bangun!",
            "aether_lore": "Sebelum peristiwa The Great Sundering, peradaban kuno Aetherwyn memiliki jaringan transportasi energi kristal tanpa kabel! Kita sedang menghidupkan kembali kejayaan itu.",
            "era_opinion": "Masa depan peradaban kita sangat cerah! Dengan kemajuan era teknologi ini, sebentar lagi kita bisa merakit Automaton Robot pemanen mandiri!"
        }
    },
    "npc_mira": {
        "name": "Mira",
        "title": "Pedagang Umum Pasar",
        "tone": "Ramah, Hangat & Lihai Berdagang",
        "dialogues": {
            "greeting": "Selamat datang di Toserba Greenvale! Senang sekali melihat wajah ramahmu hari ini. Sayuran segar dari ladangmu selalu jadi incaran para warga desa!",
            "work": "Aku sedang mencatat pembukuan penjualan mingguan dan memeriksa muatan kotak pengiriman desa. Pasar kita sedang sangat ramai pembeli dari luar wilayah!",
            "advice": "Tanaman bernilai tinggi seperti stroberi ranum dan moonberry kristal menghasilkan keuntungan emas berlipat ganda. Selalu isi kotak pengirimanmu sebelum tidur!",
            "aether_lore": "Para saudagar dari kerajaan seberang rela menempuh perjalanan ratusan mil demi membeli sebongkah Kristal Aether murni dari desa kita. Lahan ini adalah berkah besar.",
            "era_opinion": "Perkembangan desa dari pemukiman kayu kecil menjadi pusat perdagangan modern telah melipatgandakan omzet pasar kita berlipat ganda!"
        }
    }
}

@app.post("/api/v1/game/npc-dialogue-ai")
def get_npc_ai_dialogue(req: NpcAiDialogueRequest):
    """Retrieve personality-driven voice AI dialogue text tailored to the selected NPC and topic."""
    npc_data = NPC_VOICE_AI_DATABASE.get(req.npc_id)
    if not npc_data:
        raise HTTPException(status_code=404, detail=f"NPC with ID '{req.npc_id}' not found")

    topic_dialogues = npc_data["dialogues"]
    spoken_text = topic_dialogues.get(req.topic, topic_dialogues.get("greeting"))

    return {
        "npc_id": req.npc_id,
        "name": npc_data["name"],
        "title": npc_data["title"],
        "tone": npc_data["tone"],
        "topic": req.topic,
        "spoken_text": spoken_text
    }

# ==================== COOKING & FISHING DATA ====================
COOKING_RECIPES = [
    {
        "id": "recipe_parsnip_soup",
        "name": "Sup Hangat Parsnip",
        "ingredients": [{"item_id": "crop_parsnip", "count": 2}],
        "result_name": "Sup Parsnip Segar",
        "stamina_restore": 50,
        "hp_restore": 30,
        "description": "Sup gurih dari umbi musim semi yang memulihkan tenaga lelah."
    },
    {
        "id": "recipe_baked_potato",
        "name": "Kentang Panggang Mentega",
        "ingredients": [{"item_id": "crop_potato", "count": 2}],
        "result_name": "Kentang Panggang",
        "stamina_restore": 65,
        "hp_restore": 45,
        "description": "Kentang empuk beraroma sedap dipanggang di tungku perapian."
    },
    {
        "id": "recipe_strawberry_tart",
        "name": "Kue Pai Stroberi Manis",
        "ingredients": [{"item_id": "crop_strawberry", "count": 3}],
        "result_name": "Pai Stroberi Aetherwyn",
        "stamina_restore": 90,
        "hp_restore": 60,
        "description": "Kue manis favorit warga Greenvale untuk festival musim semi."
    },
    {
        "id": "recipe_moonberry_elixir",
        "name": "Elixir Bintang Moonberry",
        "ingredients": [{"item_id": "crop_moonberry", "count": 1}, {"item_id": "mat_aether_crystal", "count": 1}],
        "result_name": "Elixir Bintang",
        "stamina_restore": 120,
        "hp_restore": 100,
        "description": "Ramuan ajaib bercahaya ungu yang langsung memulihkan 100% vitalitas."
    }
]

FISH_CATALOG = [
    {"id": "fish_sunfish", "name": "Ikan Mas Mentari (Sunfish)", "sell_price": 65, "difficulty": 1, "icon": "🐠"},
    {"id": "fish_aether_carp", "name": "Gurame Kristal Aether", "sell_price": 110, "difficulty": 2, "icon": "🐟"},
    {"id": "fish_moon_trout", "name": "Ikan Forel Rembulan (Moon Trout)", "sell_price": 180, "difficulty": 3, "icon": "✨"}
]

# ==================== REST API ENDPOINTS ====================

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Evergreen Chronicles Engine",
        "version": "2.0.0",
        "online_players": len(world_hub.connected_players),
        "grid_size": f"{game_store.grid_width}x{game_store.grid_height}"
    }

@app.get("/api/v1/metrics")
def get_metrics():
    """Return performance and stress test statistics."""
    return world_hub.get_metrics()

@app.get("/api/v1/game/items")
def get_all_items():
    return {k: v.model_dump() for k, v in ITEMS_DATABASE.items()}

@app.get("/api/v1/game/crafting-recipes")
def get_crafting_recipes():
    return CRAFTING_RECIPES

@app.get("/api/v1/game/cooking-recipes")
def get_cooking_recipes():
    return COOKING_RECIPES

@app.get("/api/v1/game/fish-catalog")
def get_fish_catalog():
    return FISH_CATALOG

@app.get("/api/v1/game/zones")
def get_world_zones():
    """Return all 8 playable world zones and kingdoms in Aetherwyn."""
    return ZONES_CATALOG

@app.post("/api/v1/game/zones/travel/{slot_id}")
def travel_to_zone(slot_id: int, zone_id: str = Body(..., embed=True)):
    """Fast-travel player to a selected world zone."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    zone = next((z for z in ZONES_CATALOG if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")

    save.world["current_location"] = zone["name"]
    return {
        "success": True,
        "zone": zone,
        "current_location": zone["name"]
    }

@app.get("/api/v1/game/tutorial/{slot_id}")
def get_tutorial_progress(slot_id: int):
    """Retrieve newcomer interactive tutorial progression and rewards."""
    return TUTORIAL_QUESTS

@app.post("/api/v1/game/tutorial/claim/{slot_id}")
def claim_tutorial_reward(slot_id: int, step: int = Body(..., embed=True)):
    """Claim reward for a completed tutorial step."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    target_quest = next((q for q in TUTORIAL_QUESTS if q["step"] == step), None)
    if not target_quest:
        raise HTTPException(status_code=404, detail=f"Tutorial step {step} not found")

    player = save.player
    player["gold"] += target_quest["reward_gold"]

    # Give reward items
    inventory = player.get("inventory", [])
    for itm in target_quest.get("reward_items", []):
        for slot in inventory:
            if slot and slot.get("item_id") == itm["item_id"]:
                slot["count"] += itm["count"]
                break
        else:
            for i, slot in enumerate(inventory):
                if slot is None:
                    inventory[i] = {"item_id": itm["item_id"], "count": itm["count"]}
                    break

    target_quest["completed"] = True
    return {
        "success": True,
        "message": f"Hadiah Tutorial Langkah {step} Diklaim! (+{target_quest['reward_gold']} G)",
        "gold_earned": target_quest["reward_gold"],
        "current_gold": player["gold"],
        "next_step": step + 1
    }

@app.get("/api/v1/game/save/{slot_id}")
def load_game(slot_id: int):
    save = game_store.get_save(slot_id)
    if not save:
        if slot_id == 1:
            game_store._init_default_save()
            save = game_store.get_save(1)
        else:
            raise HTTPException(status_code=404, detail=f"Save slot {slot_id} is empty.")
    return save.model_dump()

@app.post("/api/v1/game/save/{slot_id}")
def save_game(slot_id: int, payload: Dict[str, Any] = Body(...)):
    saved_obj = game_store.save_game(slot_id, payload)
    return {"message": f"Game successfully saved to Slot {slot_id}", "saved_at": saved_obj.saved_at}

@app.post("/api/v1/game/sleep/{slot_id}")
def sleep_advance_day(slot_id: int):
    summary = game_store.advance_day(slot_id)
    updated_save = game_store.get_save(slot_id)
    return {
        "summary": summary,
        "updated_state": updated_save.model_dump() if updated_save else None
    }

@app.post("/api/v1/game/unlock-tech/{slot_id}")
def unlock_tech(slot_id: int, req: UnlockTechRequest):
    res = game_store.unlock_tech(slot_id, req.tech_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to unlock tech"))
    return res

@app.post("/api/v1/game/dungeon-clear/{slot_id}")
def dungeon_clear(slot_id: int, req: DungeonClearRequest):
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail=f"Save slot {slot_id} not found")

    player = save.player
    player["gold"] += req.gold_earned
    player["aether_shards"] += req.aether_earned

    inventory = player.get("inventory", [])
    for ore_id, count in req.ores_looted.items():
        if count <= 0:
            continue
        stacked = False
        for slot in inventory:
            if slot and slot.get("item_id") == ore_id:
                slot["count"] += count
                stacked = True
                break
        if not stacked:
            for i, slot in enumerate(inventory):
                if slot is None:
                    inventory[i] = {"item_id": ore_id, "count": count}
                    stacked = True
                    break

    return {
        "message": "Dungeon rewards claimed!",
        "gold_earned": req.gold_earned,
        "aether_earned": req.aether_earned,
        "current_gold": player["gold"],
        "current_aether": player["aether_shards"]
    }

@app.post("/api/v1/game/cook/{slot_id}")
def cook_recipe(slot_id: int, req: CookRecipeRequest):
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    recipe = next((r for r in COOKING_RECIPES if r["id"] == req.recipe_id), None)
    if not recipe:
        raise HTTPException(status_code=404, detail="Resep tidak ditemukan")

    player = save.player
    inventory = player.get("inventory", [])

    # Check ingredients
    for ing in recipe["ingredients"]:
        total_owned = sum(s.get("count", 0) for s in inventory if s and s.get("item_id") == ing["item_id"])
        if total_owned < ing["count"]:
            raise HTTPException(status_code=400, detail=f"Bahan tidak cukup untuk {recipe['name']}")

    # Deduct
    for ing in recipe["ingredients"]:
        needed = ing["count"]
        for s in inventory:
            if s and s.get("item_id") == ing["item_id"]:
                if s["count"] > needed:
                    s["count"] -= needed
                    needed = 0
                    break
                else:
                    needed -= s["count"]
                    s.clear()
                    if needed <= 0:
                        break

    # Restore Stamina and HP
    player["stamina"] = min(player["max_stamina"], player["stamina"] + recipe["stamina_restore"])
    player["hp"] = min(player["max_hp"], player["hp"] + recipe["hp_restore"])

    return {
        "success": True,
        "message": f"Berhasil memasak {recipe['result_name']}! Stamina +{recipe['stamina_restore']}, HP +{recipe['hp_restore']}",
        "current_stamina": player["stamina"],
        "current_hp": player["hp"],
        "inventory": inventory
    }

@app.post("/api/v1/game/catch-fish/{slot_id}")
def catch_fish(slot_id: int, fish_id: str = Body(..., embed=True)):
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    fish_info = next((f for f in FISH_CATALOG if f["id"] == fish_id), None)
    if not fish_info:
        raise HTTPException(status_code=404, detail="Jenis ikan tidak dikenal")

    player = save.player
    player["gold"] += fish_info["sell_price"]

    return {
        "success": True,
        "fish_name": fish_info["name"],
        "gold_earned": fish_info["sell_price"],
        "current_gold": player["gold"]
    }

@app.post("/api/v1/game/animals/pet/{slot_id}")
def pet_animal(slot_id: int, req: PetAnimalRequest):
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    player = save.player
    if req.animal_type == "sheep":
        earned_gold = 80
        msg = "Domba Aether senang dibelai! Kamu memanen Wol Lembut (+80G) 🐑"
    else:
        earned_gold = 50
        msg = "Ayam Berbulu Emas berkokok riang! Kamu mengumpulkan Telur Emas (+50G) 🐔"

    player["gold"] += earned_gold
    return {
        "success": True,
        "message": msg,
        "gold_earned": earned_gold,
        "current_gold": player["gold"]
    }

# ==================== REAL-TIME MULTIPLAYER WEBSOCKET ====================

@app.websocket("/ws/world/{world_id}")
async def websocket_world_endpoint(
    websocket: WebSocket,
    world_id: str,
    name: str = Query("Pengelana"),
    color: str = Query("#38bdf8")
):
    client_id = f"plr_{uuid.uuid4().hex[:6]}"
    await world_hub.connect(websocket, client_id, name=name, color=color)
    try:
        while True:
            raw_text = await websocket.receive_text()
            save = game_store.get_save(1)
            farm_grid = save.farm_grid if save else []
            await world_hub.handle_client_message(client_id, raw_text, farm_grid)
    except WebSocketDisconnect:
        await world_hub.disconnect(client_id)
    except Exception:
        await world_hub.disconnect(client_id)

# ==================== STATIC FRONTEND SERVING ====================
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
