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

from app.game_store import (
    game_store,
    ITEMS_DATABASE,
    CRAFTING_RECIPES,
    ZONES_CATALOG,
    TUTORIAL_QUESTS,
    NPC_QUESTS_CATALOG,
    STORYLINE_CHAPTERS,
    GameSave
)
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

# ==================== AFFECTION & STORYLINE LOGIC ====================
AFFECTION_PERKS_TABLE = {
    "npc_elara": {
        1: "Penyembuhan Herbal +10%",
        3: "Teh Stamina Hutan Gratis Setiap Pagi",
        5: "Pertumbuhan Tanaman Ladang +15% Lebih Cepat",
        8: "Berkah Pohon Suci: Tanpa Kehilangan Stamina Saat Hujan",
        10: "Resep Rahasia: Elixir Keabadian Aetherwyn"
    },
    "npc_rowan": {
        1: "Kekuatan Beliung Tambang +5%",
        3: "Gratis Biaya Tempa & Perbaikan Perkakas",
        5: "20% Peluang Mendapatkan Ganda Saat Melebur Logam",
        8: "Penguasaan Senjata Ksatria (+50% Serangan Tebas)",
        10: "Palu Tempa Masterwork Aether: Tambang Area 3x3 Seketika"
    },
    "npc_nessa": {
        1: "Jangkauan Sprinkler Otomatis +1 Petak",
        3: "Daya Output Generator Kristal +15%",
        5: "Diskon Biaya Material Perakitan Mesin 25%",
        8: "Robot Droid Automaton Asisten Pribadi Terbuka",
        10: "Reaktor Daya Aether Tanpa Batas (Energi Abadi)"
    },
    "npc_mira": {
        1: "Harga Jual Semua Hasil Panen +5%",
        3: "Diskon 10% Semua Barang di Toko Mira",
        5: "Diskon 20% & Stok Benih Langka Tanpa Batas",
        8: "Bonus Dividen Pengiriman Desa +30% Keuntungan Emas",
        10: "Mahkota Saudagar Kehormatan (+50% Semua Hadiah Emas)"
    }
}

def update_npc_affection(npc: Dict[str, Any], added_points: int) -> Dict[str, Any]:
    old_lvl = npc.get("affection_level", 0)
    current_pts = min(1000, max(0, npc.get("friendship_points", 0) + added_points))
    new_lvl = min(10, current_pts // 100)
    npc["friendship_points"] = current_pts
    npc["affection_level"] = new_lvl

    perk_dict = AFFECTION_PERKS_TABLE.get(npc.get("id"), {})
    unlocked_perks = []
    for lvl_req, perk_name in sorted(perk_dict.items()):
        if new_lvl >= lvl_req:
            unlocked_perks.append(f"Lv.{lvl_req}: {perk_name}")
    npc["unlocked_perks"] = unlocked_perks

    return {
        "old_level": old_lvl,
        "new_level": new_lvl,
        "leveled_up": new_lvl > old_lvl,
        "current_points": current_pts,
        "next_level_points": min(1000, (new_lvl + 1) * 100),
        "unlocked_perks": unlocked_perks
    }

def evaluate_storyline_unlocks(save) -> List[Dict[str, Any]]:
    unlocked_list = list(save.storyline_unlocked or ["chap_prologue"])
    completed_npc_quests = save.completed_npc_quests or []
    npcs = {n["id"]: n for n in save.npcs}
    era_level = save.world.get("era_level", 1)

    evaluated_chapters = []
    for chap in STORYLINE_CHAPTERS:
        chap_copy = dict(chap)
        cid = chap["id"]
        is_unlocked = cid in unlocked_list or cid == "chap_prologue"

        rule = chap.get("unlock_rule")
        if not is_unlocked and rule:
            rtype = rule.get("type")
            if rtype == "affection_or_tutorial":
                npc = npcs.get(rule.get("npc_id"), {})
                if npc.get("affection_level", 0) >= rule.get("level", 1):
                    is_unlocked = True
                elif any(q.get("completed") for q in TUTORIAL_QUESTS if q.get("step", 0) >= rule.get("tut_step", 2)):
                    is_unlocked = True
            elif rtype == "quest_or_affection":
                if rule.get("quest_id") in completed_npc_quests:
                    is_unlocked = True
                npc = npcs.get(rule.get("npc_id"), {})
                if npc.get("affection_level", 0) >= rule.get("level", 3):
                    is_unlocked = True
            elif rtype == "affection_any":
                if rule.get("quest_id") and rule.get("quest_id") in completed_npc_quests:
                    is_unlocked = True
                target_lvl = rule.get("level", 5)
                if any(n.get("affection_level", 0) >= target_lvl for n in npcs.values()):
                    is_unlocked = True
            elif rtype == "affection_or_quests":
                target_lvl = rule.get("level", 6)
                if any(n.get("affection_level", 0) >= target_lvl for n in npcs.values()):
                    is_unlocked = True
                if len(completed_npc_quests) >= rule.get("quests_count", 6):
                    is_unlocked = True
            elif rtype == "era_or_affection":
                if era_level >= rule.get("era", 4):
                    is_unlocked = True
                target_lvl = rule.get("level", 8)
                if any(n.get("affection_level", 0) >= target_lvl for n in npcs.values()):
                    is_unlocked = True

        if is_unlocked and cid not in unlocked_list:
            unlocked_list.append(cid)
            save.storyline_unlocked = unlocked_list

        chap_copy["unlocked"] = is_unlocked
        evaluated_chapters.append(chap_copy)

    return evaluated_chapters

# ==================== NPC QUESTS & AFFECTION ENDPOINTS ====================
@app.get("/api/v1/game/npc-quests/{slot_id}")
def get_npc_quests(slot_id: int):
    """Retrieve all NPC quests with current progress, items needed, and completion status."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    player = save.player
    inventory = player.get("inventory", [])
    active_quests_ids = [q.get("id") for q in (save.active_npc_quests or [])]
    completed_quests_ids = save.completed_npc_quests or []
    npcs_dict = {n["id"]: n for n in save.npcs}

    quests_response = []
    for q in NPC_QUESTS_CATALOG:
        q_copy = dict(q)
        qid = q["id"]
        npc_data = npcs_dict.get(q["npc_id"], {})
        current_affection = npc_data.get("affection_level", 0)
        req_affection = q.get("required_affection_level", 0)

        is_completed = qid in completed_quests_ids
        is_active = qid in active_quests_ids or is_completed
        is_available = current_affection >= req_affection

        # Calculate current progress
        current_progress = 0
        target = q.get("target_count", 1)

        if q.get("type") == "deliver_item":
            target_item = q.get("target_item")
            current_progress = sum(s.get("count", 0) for s in inventory if s and s.get("item_id") == target_item)
            target_item_meta = ITEMS_DATABASE.get(target_item)
            q_copy["target_item_name"] = target_item_meta.name if target_item_meta else target_item
        elif q.get("type") == "affection_milestone":
            target = q.get("target_affection_level", 5)
            current_progress = max([n.get("affection_level", 0) for n in save.npcs] + [0])
        elif q.get("type") == "max_affection":
            target = 10
            current_progress = max([n.get("affection_level", 0) for n in save.npcs] + [0])
        elif q.get("type") == "slimes_defeated":
            target = q.get("target_count", 5)
            current_progress = target if is_completed else 3

        q_copy["is_available"] = is_available
        q_copy["is_active"] = is_active
        q_copy["is_completed"] = is_completed
        q_copy["current_progress"] = current_progress
        q_copy["target"] = target
        q_copy["can_turn_in"] = (current_progress >= target) and not is_completed

        quests_response.append(q_copy)

    return quests_response

@app.post("/api/v1/game/npc-quests/accept/{slot_id}")
def accept_npc_quest(slot_id: int, quest_id: str = Body(..., embed=True)):
    """Accept an NPC quest."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    quest = next((q for q in NPC_QUESTS_CATALOG if q["id"] == quest_id), None)
    if not quest:
        raise HTTPException(status_code=404, detail=f"Quest '{quest_id}' not found")

    active_list = save.active_npc_quests or []
    if any(q.get("id") == quest_id for q in active_list):
        return {"success": True, "message": "Quest sudah aktif!", "active_quests": active_list}

    active_list.append({
        "id": quest_id,
        "npc_id": quest["npc_id"],
        "title": quest["title"],
        "target_count": quest.get("target_count", 1),
        "completed": False
    })
    save.active_npc_quests = active_list

    return {
        "success": True,
        "message": f"Quest '{quest['title']}' diterima!",
        "quest": quest,
        "active_quests": active_list
    }

@app.post("/api/v1/game/npc-quests/turn-in/{slot_id}")
def turn_in_npc_quest(slot_id: int, quest_id: str = Body(..., embed=True)):
    """Turn in NPC quest, deduct requirements, reward gold, aether, and increase affection levels."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    quest = next((q for q in NPC_QUESTS_CATALOG if q["id"] == quest_id), None)
    if not quest:
        raise HTTPException(status_code=404, detail=f"Quest '{quest_id}' not found")

    completed_npc_quests = list(save.completed_npc_quests or [])
    if quest_id in completed_npc_quests:
        raise HTTPException(status_code=400, detail="Quest sudah diselesaikan!")

    player = save.player
    inventory = player.get("inventory", [])
    npcs_dict = {n["id"]: n for n in save.npcs}
    target_npc = npcs_dict.get(quest["npc_id"])

    # 1. Verify and deduct requirements
    qtype = quest.get("type")
    if qtype == "deliver_item":
        target_item = quest["target_item"]
        target_count = quest["target_count"]
        owned_count = sum(s.get("count", 0) for s in inventory if s and s.get("item_id") == target_item)
        if owned_count < target_count:
            item_name = ITEMS_DATABASE.get(target_item)
            item_label = item_name.name if item_name else target_item
            raise HTTPException(
                status_code=400,
                detail=f"Barang belum cukup! Butuh {target_count} {item_label} (Kamu memiliki {owned_count})"
            )

        # Deduct
        needed = target_count
        for s in inventory:
            if s and s.get("item_id") == target_item:
                if s["count"] > needed:
                    s["count"] -= needed
                    needed = 0
                    break
                else:
                    needed -= s["count"]
                    s.clear()
                    if needed <= 0:
                        break

    elif qtype == "affection_milestone":
        target_lvl = quest.get("target_affection_level", 5)
        target_completed = quest.get("target_quests_completed", 4)
        has_friend_lvl = any(n.get("affection_level", 0) >= target_lvl for n in save.npcs)
        has_completed_quests = len(completed_npc_quests) >= target_completed
        if not (has_friend_lvl or has_completed_quests):
            raise HTTPException(
                status_code=400,
                detail=f"Syarat belum terpenuhi! Capai Affection Level {target_lvl} dengan warga ATAU selesaikan {target_completed} quest penduduk."
            )

    elif qtype == "max_affection":
        target_lvl = quest.get("target_affection_level", 10)
        if not any(n.get("affection_level", 0) >= target_lvl for n in save.npcs):
            raise HTTPException(status_code=400, detail=f"Butuh Hubungan Tingkat {target_lvl} (Soulmate) dengan salah satu warga!")

    # 2. Add Rewards
    reward_gold = quest.get("reward_gold", 0)
    reward_aether = quest.get("reward_aether", 0)
    player["gold"] += reward_gold
    player["aether_shards"] += reward_aether

    # Give reward item if any
    reward_item_id = quest.get("reward_item")
    if reward_item_id:
        for slot in inventory:
            if slot and slot.get("item_id") == reward_item_id:
                slot["count"] += 1
                break
        else:
            for i, slot in enumerate(inventory):
                if slot is None:
                    inventory[i] = {"item_id": reward_item_id, "count": 1}
                    break

    # 3. Increase Affection Points
    affection_gain = quest.get("reward_affection", 100)
    affection_results = []

    if quest["id"] == "quest_mira_friendship":
        # 'Having Friends with Us!' increases affection for ALL village NPCs!
        for npc in save.npcs:
            res = update_npc_affection(npc, affection_gain)
            affection_results.append({"npc_id": npc["id"], "name": npc["name"], **res})
    elif target_npc:
        res = update_npc_affection(target_npc, affection_gain)
        affection_results.append({"npc_id": target_npc["id"], "name": target_npc["name"], **res})

    # 4. Mark Completed
    completed_npc_quests.append(quest_id)
    save.completed_npc_quests = completed_npc_quests
    save.active_npc_quests = [q for q in (save.active_npc_quests or []) if q.get("id") != quest_id]

    # 5. Evaluate Storyline Unlocks
    evaluated_chapters = evaluate_storyline_unlocks(save)

    return {
        "success": True,
        "message": f"Quest '{quest['title']}' berhasil diselesaikan! (+{reward_gold} G, +{reward_aether} Kristal Aether)",
        "reward_gold": reward_gold,
        "reward_aether": reward_aether,
        "reward_item": reward_item_id,
        "current_gold": player["gold"],
        "affection_results": affection_results,
        "completed_npc_quests": completed_npc_quests,
        "storyline_chapters": evaluated_chapters
    }

class NpcGiftRequest(BaseModel):
    npc_id: str
    item_id: str

@app.post("/api/v1/game/npc/gift/{slot_id}")
def give_npc_gift(slot_id: int, req: NpcGiftRequest):
    """Give a gift to an NPC, increase friendship points and affectionate level up to 10."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    target_npc = next((n for n in save.npcs if n["id"] == req.npc_id), None)
    if not target_npc:
        raise HTTPException(status_code=404, detail=f"NPC '{req.npc_id}' not found")

    player = save.player
    inventory = player.get("inventory", [])

    # Check item in inventory
    item_slot = next((s for s in inventory if s and s.get("item_id") == req.item_id), None)
    if not item_slot or item_slot.get("count", 0) <= 0:
        raise HTTPException(status_code=400, detail="Item tidak ada di tas!")

    # Deduct 1 item
    item_slot["count"] -= 1
    if item_slot["count"] <= 0:
        for i, s in enumerate(inventory):
            if s and s.get("item_id") == req.item_id and s["count"] <= 0:
                inventory[i] = None

    # Check favorite gift
    is_favorite = req.item_id in target_npc.get("favorite_gifts", [])
    added_points = 120 if is_favorite else 60

    aff_result = update_npc_affection(target_npc, added_points)
    item_meta = ITEMS_DATABASE.get(req.item_id)
    item_name = item_meta.name if item_meta else req.item_id

    # Check storyline unlocks
    evaluated_chapters = evaluate_storyline_unlocks(save)

    return {
        "success": True,
        "is_favorite": is_favorite,
        "message": f"{target_npc['name']} sangat menyukai {item_name}! (+{added_points} Poin Hubungan)" if is_favorite else f"{target_npc['name']} menerima {item_name}.",
        "affection_result": aff_result,
        "inventory": inventory,
        "storyline_chapters": evaluated_chapters
    }

@app.get("/api/v1/game/storyline/{slot_id}")
def get_storyline_chapters(slot_id: int):
    """Retrieve all Storyline Chapters & Trailer cutscenes with locked/unlocked progress status."""
    save = game_store.get_save(slot_id)
    if not save:
        # Default unlock evaluation
        return STORYLINE_CHAPTERS
    return evaluate_storyline_unlocks(save)

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
