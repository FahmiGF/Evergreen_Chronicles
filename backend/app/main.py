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
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from pydantic import BaseModel

from app.security_engine import (
    DatabaseSecurity,
    HMACIntegrityShield,
    AntiCheatValidator,
    WAFEngine,
    RateLimiter,
    InputSanitizer,
    SecurityAuditLogger
)

from app.zones_engine import ZonesEngine
from app.boss_engine import BossEngine
from app.expeditions_engine import ExpeditionsEngine
from app.restoration_engine import RestorationEngine
from app.tools_advanced_engine import ToolsAdvancedEngine

from app.game_store import (
    game_store,
    ITEMS_DATABASE,
    CRAFTING_RECIPES,
    BLUEPRINT_CATALOG,
    ZONES_CATALOG,
    TUTORIAL_QUESTS,
    NPC_QUESTS_CATALOG,
    STORYLINE_CHAPTERS,
    RACES_CATALOG,
    PERSONALITIES_CATALOG,
    BACKGROUNDS_CATALOG,
    CUSTOMIZATION_PALETTES,
    LANDSCAPE_BRUSHES,
    GameSave
)
from app.npc_engine import npc_manager
from app.websocket_manager import world_hub
from app.civilization_engine import (
    civ_engine,
    CIVILIZATION_ERAS,
    DEFAULT_MARKET_COMMODITIES,
    TOWN_BUSINESSES,
    LIVING_NPCS_BRAIN
)
from app.progression_engine import (
    ProgressionEngine,
    SKILLS_CATALOG,
    MILESTONES,
    SKILL_TREES_DATA,
    PRESTIGE_BRANCHES,
    SKILL_SYNERGIES
)
from app.encyclopedia_engine import (
    EncyclopediaEngine,
    ENCYCLOPEDIA_CATEGORIES,
    MILESTONE_TIERS
)
from app.leaderboard_engine import (
    LeaderboardEngine,
    LEADERBOARD_CATEGORIES
)
from app.admin_engine import (
    AdminEngine,
    ROLES_PERMISSIONS
)
from app.equipment_engine import EquipmentEngine, TOOL_TIERS, TOOL_TYPES, ENCHANTMENTS_CATALOG
from app.mounts_engine import MountsEngine, MOUNTS_CATALOG, STABLE_TIERS
from app.mining_engine import MiningEngine, MINING_ZONES, MINERALS_CATALOG, MACHINERY_RECIPES
from app.fishing_engine import FishingEngine, WATER_ZONES, BOATS_CATALOG, FISH_SPECIES
from app.pets_engine import PetsEngine, PETS_CATALOG, RANCH_FACILITIES
from app.automation_engine import AutomationEngine, BUILDINGS_CATALOG, PRODUCTION_RECIPES
from app.events_engine import EventsEngine, PORTAL_DIMENSIONS, HALLOWEEN_SHOP_ITEMS
from app.journal_engine import JournalEngine, COLLECTIONS_CATALOG, ACHIEVEMENTS_CATALOG, GUILDS_CATALOG

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

class SecurityFirewallMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        path = request.url.path
        query = str(request.url.query)

        # 1. Anti-DDoS & Sliding-Window Rate Limiting
        is_sensitive = path.startswith("/api/v1/game/save") or path.startswith("/api/v1/admin") or path.startswith("/api/v1/security")
        is_allowed, ban_reason = RateLimiter.is_ip_allowed(client_ip, is_sensitive=is_sensitive)
        if not is_allowed:
            SecurityAuditLogger.log_event(
                event_type="RATE_LIMIT_BLOCKED",
                severity="MEDIUM",
                client_ip=client_ip,
                message=f"Request blocked by rate limiter on {path}: {ban_reason}",
                details={"path": path, "reason": ban_reason}
            )
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. CyberSec protection shield has temporarily throttled this IP.",
                    "details": ban_reason
                }
            )

        # 2. WAF Inspection for Path and Query String (SQLi, XSS, Path Traversal, Command Injection)
        headers_dict = {k.lower(): v for k, v in request.headers.items()}
        is_safe, attack_cat, pattern = WAFEngine.inspect_request(path, query, "", headers_dict, client_ip)
        if not is_safe:
            SecurityAuditLogger.log_event(
                event_type=f"WAF_INTRUSION_BLOCKED_{attack_cat}",
                severity="HIGH",
                client_ip=client_ip,
                message=f"Malicious attack pattern blocked on {path} ({attack_cat})",
                details={"pattern": pattern, "query": query, "path": path}
            )
            RateLimiter.record_violation(client_ip, attack_cat)
            return JSONResponse(
                status_code=403,
                content={
                    "error": "ACCESS_DENIED_BY_SECURITY_SHIELD",
                    "reason": f"Malicious payload or exploit signature detected: {attack_cat}",
                    "defense_system": "Evergreen-Guardian-v7.0.0",
                    "incident_logged": True
                }
            )

        # 3. Process Request
        try:
            response = await call_next(request)
        except ValueError as val_err:
            if "Anti-Cheat" in str(val_err):
                return JSONResponse(
                    status_code=400,
                    content={"error": "ANTI_CHEAT_VIOLATION", "message": str(val_err)}
                )
            raise

        # 4. Inject Enterprise Security Defense Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' data:; connect-src 'self' ws: wss:;"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Anti-Hack-Engine"] = "Evergreen-Guardian-v7.0"

        return response

app.add_middleware(SecurityFirewallMiddleware)

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

@app.get("/api/v1/game/blueprints")
def get_blueprint_catalog():
    """Return all architectural blueprint structures for building and planning."""
    return BLUEPRINT_CATALOG

@app.post("/api/v1/game/blueprints/build/{slot_id}")
async def build_blueprint_structure(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Construct a blueprint structure on the farm grid."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    struct_id = payload.get("structure_id")
    x = int(payload.get("x", 0))
    y = int(payload.get("y", 0))

    blueprint = next((b for b in BLUEPRINT_CATALOG if b["id"] == struct_id), None)
    if not blueprint:
        raise HTTPException(status_code=400, detail="Blueprint tidak ditemukan")
    
    player = save.player
    # Check gold
    if player["gold"] < blueprint["cost_gold"]:
        raise HTTPException(status_code=400, detail=f"Emas tidak cukup! Membutuhkan {blueprint['cost_gold']} Gold.")
    
    # Check materials
    inv = player.get("inventory", [])
    for mat in blueprint.get("materials", []):
        needed_id = mat["item_id"]
        needed_cnt = mat["count"]
        have_cnt = sum(slot["count"] for slot in inv if slot and slot.get("item_id") == needed_id)
        if have_cnt < needed_cnt:
            item_name = ITEMS_DATABASE.get(needed_id, None)
            name_str = item_name.name if item_name else needed_id
            raise HTTPException(status_code=400, detail=f"Material tidak cukup: butuh {needed_cnt}x {name_str}")

    # Deduct materials
    for mat in blueprint.get("materials", []):
        rem = mat["count"]
        for slot in inv:
            if slot and slot.get("item_id") == mat["item_id"]:
                take = min(rem, slot["count"])
                slot["count"] -= take
                rem -= take
                if slot["count"] <= 0:
                    slot.clear()
                if rem <= 0:
                    break
    
    # Deduct gold
    player["gold"] -= blueprint["cost_gold"]

    # Place on grid
    if 0 <= y < len(save.farm_grid) and 0 <= x < len(save.farm_grid[0]):
        tile = save.farm_grid[y][x]
        tile["structure_type"] = struct_id
        if "sprinkler" in struct_id:
            tile["tile_type"] = "tilled"
        elif "pipe" in struct_id:
            tile["water_piped"] = True

    # Broadcast to multiplayer
    await world_hub.broadcast_world_action("build_blueprint", x, y, {
        "structure_id": struct_id,
        "name": blueprint["name"]
    })

    return {
        "success": True,
        "message": f"Konstruksi {blueprint['name']} selesai! ✨",
        "save": save.model_dump()
    }

@app.post("/api/v1/game/tractor/mount/{slot_id}")
async def toggle_tractor_mount(slot_id: int):
    """Mount or dismount the farm tractor."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    tractor = save.player.setdefault("tractor", {
        "owned": True,
        "mounted": False,
        "x": 6 * 40,
        "y": 5 * 40,
        "dir": "down",
        "attachment": "tiller",
        "fuel": 100,
        "max_fuel": 100,
        "speed_boost": 1.75
    })
    tractor["mounted"] = not tractor.get("mounted", False)
    status_str = "menaiki" if tractor["mounted"] else "turun dari"
    return {
        "success": True,
        "mounted": tractor["mounted"],
        "message": f"Anda {status_str} Traktor Uap Aetherwyn 🚜",
        "tractor": tractor
    }

@app.post("/api/v1/game/tractor/attachment/{slot_id}")
def set_tractor_attachment(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Switch active tractor attachment (tiller, sprayer, mower)."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    attachment = payload.get("attachment", "tiller")
    tractor = save.player.setdefault("tractor", {
        "owned": True,
        "mounted": False,
        "attachment": "tiller",
        "fuel": 100
    })
    tractor["attachment"] = attachment
    names = {"tiller": "Mata Bajak Tiller (3x1)", "sprayer": "Tangki Semprot Air (3x1)", "mower": "Pisau Panen Otomatis (3x1)"}
    return {
        "success": True,
        "attachment": attachment,
        "message": f"Mode traktor diubah ke: {names.get(attachment, attachment)}",
        "tractor": tractor
    }

# ==================== CHARACTER STUDIO & PERSONALIZATION ENDPOINTS ====================
@app.get("/api/v1/game/races")
def get_playable_races():
    """Retrieve 10 playable races with lore, attributes, and passive perks."""
    return RACES_CATALOG

@app.get("/api/v1/game/personalities")
def get_personalities():
    """Retrieve 12 character personality dimensions."""
    return PERSONALITIES_CATALOG

@app.get("/api/v1/game/backgrounds")
def get_backgrounds():
    """Retrieve 8 character background origins."""
    return BACKGROUNDS_CATALOG

@app.get("/api/v1/game/character/options")
def get_character_options():
    """Retrieve all physical customization options, palettes, and wardrobe catalog."""
    return CUSTOMIZATION_PALETTES

@app.post("/api/v1/game/character/customize/{slot_id}")
def update_character_profile(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Update and persist player appearance, race, personality, and wardrobe."""
    profile = payload.get("profile", {})
    wardrobe = payload.get("wardrobe", None)
    save = game_store.update_character_profile(slot_id, profile, wardrobe)
    return {
        "success": True,
        "message": f"Karakter {save.player.get('name', 'Pemain')} berhasil diperbarui!",
        "character_profile": save.player["character_profile"],
        "wardrobe": save.player["wardrobe"],
        "race_perk": save.player.get("race_perk", "")
    }

# ==================== LANDSCAPE & TERRAIN PAINTER ENDPOINTS ====================
@app.get("/api/v1/game/landscape/brushes")
def get_landscape_brushes():
    """Retrieve landscape and terrain painter brushes."""
    return LANDSCAPE_BRUSHES

@app.post("/api/v1/game/landscape/paint/{slot_id}")
async def paint_landscape_tile(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Paint or sculpt a terrain tile on the farm grid."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    
    x = payload.get("x")
    y = payload.get("y")
    brush_type = payload.get("brush_type", "grass")
    
    if 0 <= y < len(save.farm_grid) and 0 <= x < len(save.farm_grid[0]):
        tile = save.farm_grid[y][x]
        tile["tile_type"] = brush_type
        
        # Broadcast to multiplayer
        await world_hub.broadcast_world_action("paint_terrain", x, y, {
            "tile_type": brush_type
        })
        
        return {
            "success": True,
            "message": f"Ubin ({x}, {y}) berhasil diubah menjadi {brush_type}",
            "tile": tile
        }
    raise HTTPException(status_code=400, detail="Invalid tile coordinates")

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
    return {
        "message": f"Game successfully saved to Slot {slot_id}",
        "saved_at": saved_obj.saved_at,
        "checksum": saved_obj.checksum,
        "version": saved_obj.version
    }

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

# ==================== CIVILIZATION & LIVING NPC SIMULATION ====================

@app.get("/api/v1/game/civilization/status/{slot_id}")
def get_civilization_status(slot_id: int):
    """Retrieve full 7-layer civilization simulation, Era progression, and business stats."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    civ = getattr(save, "civilization", {}) or {}
    cur_era_id = civ.get("current_era", "medieval")
    cur_meta = CIVILIZATION_ERAS.get(cur_era_id, CIVILIZATION_ERAS["medieval"])
    next_era_id = cur_meta.get("next_era")
    next_meta = CIVILIZATION_ERAS.get(next_era_id) if next_era_id else None

    return {
        "civilization": civ,
        "current_era": cur_meta,
        "next_era": next_meta,
        "all_eras": list(CIVILIZATION_ERAS.values()),
        "businesses": civ.get("businesses", TOWN_BUSINESSES),
        "prosperity_score": civ.get("prosperity_score", 450)
    }

@app.post("/api/v1/game/civilization/advance-era/{slot_id}")
async def advance_civilization_era_endpoint(slot_id: int):
    """Attempt to advance the world to the next civilization era."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    save_dict = save.model_dump()
    result = civ_engine.advance_civilization_era(save_dict)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))

    # Update in-memory store
    save.civilization = save_dict["civilization"]
    save.player["gold"] = save_dict["player"]["gold"]

    # Broadcast event to multiplayer
    await world_hub.broadcast_world_action("advance_era", 0, 0, {
        "era": save.civilization["current_era"],
        "name": result["new_era"]["name"]
    })

    return {
        "success": True,
        "message": result["message"],
        "civilization": save.civilization,
        "new_gold": save.player["gold"]
    }

@app.get("/api/v1/game/economy/market/{slot_id}")
def get_market_status(slot_id: int):
    """Retrieve dynamic commodities with real-time supply, demand, and prices."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    market = getattr(save, "market", {}) or {}
    commodities = market.get("commodities", DEFAULT_MARKET_COMMODITIES)

    # Calculate real-time dynamic prices
    calculated = {}
    for cid, comm in commodities.items():
        price = civ_engine.calculate_market_price(
            comm.get("base_price", 10),
            comm.get("supply", 100),
            comm.get("demand", 100),
            comm.get("min_price", 2),
            comm.get("max_price", 50)
        )
        calculated[cid] = {**comm, "current_price": price}

    return {
        "commodities": calculated,
        "businesses": TOWN_BUSINESSES
    }

@app.post("/api/v1/game/economy/trade/{slot_id}")
def trade_commodity(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Buy or sell commodities dynamically adjusting market supply and prices."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    action = payload.get("action")  # "buy" or "sell"
    cid = payload.get("commodity_id")
    amount = max(1, int(payload.get("amount", 1)))

    market = save.market.setdefault("commodities", DEFAULT_MARKET_COMMODITIES)
    if cid not in market:
        raise HTTPException(status_code=404, detail=f"Commodity '{cid}' not found in market")

    comm = market[cid]
    unit_price = civ_engine.calculate_market_price(
        comm["base_price"], comm["supply"], comm["demand"], comm["min_price"], comm["max_price"]
    )
    total_cost = unit_price * amount
    player = save.player
    inventory = player.get("inventory", [])

    if action == "buy":
        if player["gold"] < total_cost:
            raise HTTPException(status_code=400, detail=f"Emas tidak cukup (butuh {total_cost:,} G, dimiliki {player['gold']:,} G)")
        player["gold"] -= total_cost
        comm["supply"] = max(5, comm["supply"] - amount)
        comm["demand"] += int(round(amount * 0.8))

        # Add item to player inventory
        item_id_map = {"wood": "mat_wood", "stone": "mat_stone", "wheat": "crop_wheat", "parsnip": "crop_parsnip", "strawberry": "crop_strawberry", "iron_ore": "mat_iron_ore", "bread": "food_bread", "fish": "item_fish_parsnip"}
        inv_item_id = item_id_map.get(cid, f"item_{cid}")
        for slot in inventory:
            if slot and slot.get("item_id") == inv_item_id:
                slot["count"] += amount
                break
        else:
            for i, slot in enumerate(inventory):
                if slot is None:
                    inventory[i] = {"item_id": inv_item_id, "count": amount}
                    break

        msg = f"Membeli {amount}x {comm['name']} seharga {total_cost:,} G"

    elif action == "sell":
        player["gold"] += total_cost
        comm["supply"] += amount
        comm["demand"] = max(10, comm["demand"] - int(round(amount * 0.5)))
        msg = f"Menjual {amount}x {comm['name']} memperoleh {total_cost:,} G"
    else:
        raise HTTPException(status_code=400, detail="Invalid trade action ('buy' or 'sell' required)")

    # Recalculate price
    new_price = civ_engine.calculate_market_price(
        comm["base_price"], comm["supply"], comm["demand"], comm["min_price"], comm["max_price"]
    )
    comm["current_price"] = new_price

    return {
        "success": True,
        "message": msg,
        "total_gold": player["gold"],
        "commodity": {**comm, "current_price": new_price}
    }

@app.get("/api/v1/game/npcs/living/{slot_id}")
def get_living_npcs_status(slot_id: int):
    """Retrieve living NPCs, active daily schedules, memories, and multi-dimensional relationships."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    cur_hour = save.world.get("time_hour", 8)
    living_roster = []

    for npc_id, npc_data in LIVING_NPCS_BRAIN.items():
        schedule = civ_engine.get_current_npc_schedule(npc_id, cur_hour)
        living_roster.append({
            "id": npc_id,
            "name": npc_data["name"],
            "race": npc_data["race"],
            "title": npc_data["title"],
            "avatar_icon": npc_data["avatar_icon"],
            "personality": npc_data["personality"],
            "workplace": npc_data["workplace"],
            "home": npc_data["home"],
            "relationships": npc_data["relationships"],
            "current_schedule": schedule,
            "memories": npc_data.get("memories", [])
        })

    return {
        "hour": cur_hour,
        "npcs": living_roster
    }

@app.post("/api/v1/game/npcs/{npc_id}/interact/{slot_id}")
def interact_with_npc(slot_id: int, npc_id: str, payload: Dict[str, Any] = Body(...)):
    """Deep interaction with NPC: casual chat, routine inquiry, town gossip, or gift giving."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    npc_meta = LIVING_NPCS_BRAIN.get(npc_id)
    if not npc_meta:
        raise HTTPException(status_code=404, detail=f"NPC '{npc_id}' not found")

    interaction_type = payload.get("interaction_type", "chat")
    weather = save.world.get("weather", "Sunny")
    cur_hour = save.world.get("time_hour", 8)
    schedule = civ_engine.get_current_npc_schedule(npc_id, cur_hour)

    if interaction_type == "routine":
        speech = f"Saat ini aku sedang di {schedule['location']} ({schedule['activity']}). Jam {schedule['end']}:00 nanti aku akan berpindah kegiatan."
        gain_trust = 2
    elif interaction_type == "gossip":
        civ = save.civilization or {}
        speech = f"Kudengar kemakmuran lembah kita kini bernilai {civ.get('prosperity_score', 450)} poin. Para perajin dan pedagang sangat bersemangat!"
        gain_trust = 3
    elif interaction_type == "gift":
        speech = npc_meta.get("dialogues", {}).get("gift_thanks", "Wah, hadiah ini sungguh berharga! Terima kasih banyak, sahabat!")
        gain_trust = 6
    else:
        # Contextual chat
        if weather == "Rainy":
            speech = npc_meta.get("dialogues", {}).get("weather_rain", npc_meta.get("dialogues", {}).get("casual", ""))
        else:
            speech = npc_meta.get("dialogues", {}).get("casual", "Senang berjumpa denganmu lagi di lembah yang damai ini.")
        gain_trust = 2

    # Boost relationship
    npc_meta["relationships"]["trust"] = min(100, npc_meta["relationships"]["trust"] + gain_trust)
    npc_meta["relationships"]["friendship"] = min(100, npc_meta["relationships"]["friendship"] + 1)

    return {
        "success": True,
        "npc_name": npc_meta["name"],
        "speech": speech,
        "relationships": npc_meta["relationships"],
        "active_schedule": schedule
    }

@app.get("/api/v1/game/civilization/quests/{slot_id}")
def get_civilization_quests(slot_id: int):
    """Retrieve dynamic procedural quests based on actual world shortages."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    quests = civ_engine.generate_dynamic_quests(save.model_dump())
    return {
        "quests": quests
    }

@app.post("/api/v1/game/civilization/quests/complete/{slot_id}")
def complete_civilization_quest(slot_id: int, quest_id: str = Body(..., embed=True)):
    """Complete a dynamic town quest, delivering requested materials and receiving rewards."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")

    quests = civ_engine.generate_dynamic_quests(save.model_dump())
    target_quest = next((q for q in quests if q["id"] == quest_id), None)
    if not target_quest:
        raise HTTPException(status_code=404, detail=f"Quest '{quest_id}' not found")

    player = save.player
    req_item = target_quest["required_item"]
    req_amt = target_quest["required_amount"]

    # Check inventory
    inventory = player.get("inventory", [])
    found_count = 0
    for slot in inventory:
        if slot and slot.get("item_id") == req_item:
            found_count += slot.get("count", 1)

    if found_count < req_amt:
        raise HTTPException(status_code=400, detail=f"Bahan tidak cukup (butuh {req_amt}x {req_item}, dimiliki {found_count})")

    # Deduct items
    remaining = req_amt
    for slot in inventory:
        if slot and slot.get("item_id") == req_item:
            deduct = min(remaining, slot["count"])
            slot["count"] -= deduct
            remaining -= deduct
            if slot["count"] <= 0:
                slot.clear()
            if remaining <= 0:
                break

    # Award gold and prosperity
    reward_gold = target_quest.get("reward_gold", 100)
    reward_pros = target_quest.get("reward_prosperity", 20)
    player["gold"] += reward_gold
    save.civilization["prosperity_score"] = save.civilization.get("prosperity_score", 450) + reward_pros

    return {
        "success": True,
        "message": f"🎉 Misi '{target_quest['title']}' Selesai! (+{reward_gold} G, +{reward_pros} Kemakmuran)",
        "gold_earned": reward_gold,
        "current_gold": player["gold"],
        "prosperity_score": save.civilization["prosperity_score"]
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

# =========================================================================
# ==================== V4 ULTIMATE EXPANSION ENDPOINTS ====================
# =========================================================================

# --- 1. PLAYER PROGRESSION & 12 SKILLS ---
@app.get("/api/v1/game/skills")
def get_player_skills():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save file not found")
    ProgressionEngine.ensure_progression_state(save.player)
    return {
        "global_level": save.player.get("global_level", 1),
        "total_skill_levels": save.player.get("total_skill_levels", 12),
        "skills": save.player.get("skills", {}),
        "catalog": SKILLS_CATALOG,
        "milestones": MILESTONES,
        "trees": SKILL_TREES_DATA,
        "prestige_points": save.player.get("prestige_points", 0),
        "spent_prestige_points": save.player.get("spent_prestige_points", 0),
        "prestige_rank": save.player.get("prestige_rank", 1),
        "prestige_upgrades": save.player.get("prestige_upgrades", []),
        "prestige_branches": PRESTIGE_BRANCHES,
        "synergies": SKILL_SYNERGIES,
        "prestige_badges": save.player.get("prestige_badges", [])
    }

@app.post("/api/v1/game/skills/xp")
def add_player_skill_xp(payload: Dict[str, Any] = Body(...)):
    skill_id = payload.get("skill_id")
    amount = payload.get("amount", 25)
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = ProgressionEngine.add_skill_xp(save.player, skill_id, amount)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/v1/game/skills/perk")
def unlock_player_skill_perk(payload: Dict[str, Any] = Body(...)):
    skill_id = payload.get("skill_id")
    perk_id = payload.get("perk_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = ProgressionEngine.unlock_skill_perk(save.player, skill_id, perk_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal membuka perk."))
    return result

@app.post("/api/v1/game/skills/prestige")
def activate_player_skill_prestige(payload: Dict[str, Any] = Body(...)):
    skill_id = payload.get("skill_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = ProgressionEngine.activate_prestige(save.player, skill_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal aktivasi prestige."))
    return result

@app.post("/api/v1/game/prestige/upgrade")
def purchase_player_prestige_upgrade(payload: Dict[str, Any] = Body(...)):
    branch_id = payload.get("branch_id")
    upgrade_id = payload.get("upgrade_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = ProgressionEngine.purchase_prestige_upgrade(save.player, branch_id, upgrade_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pembelian upgrade prestige gagal."))
    return result

@app.post("/api/v1/game/prestige/reset")
def reset_player_prestige_points():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = ProgressionEngine.reset_prestige_points(save.player)
    return result

# --- 2. TOOLS & EQUIPMENT SYSTEM ---
@app.get("/api/v1/game/equipment")
def get_player_equipment():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    EquipmentEngine.initialize_equipment(save.player)
    return {
        "equipment": save.player.get("equipment", {}),
        "tool_tiers": TOOL_TIERS,
        "tool_types": TOOL_TYPES,
        "enchantments": ENCHANTMENTS_CATALOG
    }

@app.post("/api/v1/game/equipment/repair")
def repair_player_tool(payload: Dict[str, Any] = Body(...)):
    tool_type = payload.get("tool_type")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EquipmentEngine.repair_tool(save.player, tool_type)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Perbaikan alat gagal."))
    return result

@app.post("/api/v1/game/equipment/upgrade")
def upgrade_player_tool(payload: Dict[str, Any] = Body(...)):
    tool_type = payload.get("tool_type")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EquipmentEngine.upgrade_tool_tier(save.player, tool_type)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Upgrade alat gagal."))
    return result

@app.post("/api/v1/game/equipment/enchant")
def enchant_player_tool(payload: Dict[str, Any] = Body(...)):
    tool_type = payload.get("tool_type")
    enchantment_id = payload.get("enchantment_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EquipmentEngine.apply_enchantment(save.player, tool_type, enchantment_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Enchantment alat gagal."))
    return result

# --- 3. MOUNT & RIDING SYSTEM ---
@app.get("/api/v1/game/mounts")
def get_player_mounts():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    MountsEngine.initialize_mounts(save.player)
    return {
        "mounts_data": save.player.get("mounts_data", {}),
        "catalog": MOUNTS_CATALOG,
        "stables": STABLE_TIERS
    }

@app.post("/api/v1/game/mounts/toggle")
def toggle_player_mount(payload: Dict[str, Any] = Body(default={})):
    mount_id = payload.get("mount_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MountsEngine.toggle_mount(save.player, mount_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal menunggangi mount."))
    return result

@app.post("/api/v1/game/mounts/interact")
def interact_player_mount(payload: Dict[str, Any] = Body(...)):
    mount_id = payload.get("mount_id")
    action = payload.get("action", "feed")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MountsEngine.interact_mount(save.player, mount_id, action)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Interaksi mount gagal."))
    return result

@app.post("/api/v1/game/mounts/unlock")
def unlock_player_mount(payload: Dict[str, Any] = Body(...)):
    mount_id = payload.get("mount_id")
    custom_name = payload.get("custom_name")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MountsEngine.unlock_mount(save.player, mount_id, custom_name)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal membuka mount."))
    return result

@app.post("/api/v1/game/mounts/upgrade-stable")
def upgrade_player_stable():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MountsEngine.upgrade_stable(save.player)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Renovasi kandang gagal."))
    return result

# --- 4. UNDERGROUND MINING & MACHINERY ---
@app.get("/api/v1/game/mining")
def get_player_mining():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    MiningEngine.initialize_mining(save.player)
    return {
        "mining_data": save.player.get("mining_data", {}),
        "zones": MINING_ZONES,
        "minerals_catalog": MINERALS_CATALOG,
        "machinery_recipes": MACHINERY_RECIPES
    }

@app.post("/api/v1/game/mining/excavate")
def excavate_mining_floor(payload: Dict[str, Any] = Body(...)):
    floor = payload.get("floor", 1)
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MiningEngine.excavate_floor(save.player, floor)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Ekskavasi tambang gagal."))
    return result

@app.post("/api/v1/game/mining/machine")
def process_mining_machine(payload: Dict[str, Any] = Body(...)):
    recipe_name = payload.get("recipe_name")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = MiningEngine.process_machine(save.player, recipe_name)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pengolahan mesin gagal."))
    return result

# --- 5. FISHING, OCEAN & BOATS ---
@app.get("/api/v1/game/ocean-fishing")
def get_ocean_fishing():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    FishingEngine.initialize_fishing(save.player)
    return {
        "fishing_data": save.player.get("fishing_data", {}),
        "water_zones": WATER_ZONES,
        "boats_catalog": BOATS_CATALOG,
        "fish_species": FISH_SPECIES
    }

@app.post("/api/v1/game/ocean-fishing/cast")
def cast_fishing_line(payload: Dict[str, Any] = Body(...)):
    zone_id = payload.get("zone_id", "zone_lake")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = FishingEngine.cast_line(save.player, zone_id)
    return result

@app.post("/api/v1/game/ocean-fishing/boat")
def purchase_exploration_boat(payload: Dict[str, Any] = Body(...)):
    boat_id = payload.get("boat_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = FishingEngine.purchase_boat(save.player, boat_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pembelian perahu gagal."))
    return result

# --- 6. PETS, COMPANIONS & RANCH ---
@app.get("/api/v1/game/pets-ranch")
def get_pets_ranch():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    PetsEngine.initialize_pets(save.player)
    return {
        "pets_data": save.player.get("pets_data", {}),
        "pets_catalog": PETS_CATALOG,
        "ranch_facilities": RANCH_FACILITIES
    }

@app.post("/api/v1/game/pets-ranch/action")
def pet_companion_action(payload: Dict[str, Any] = Body(...)):
    pet_id = payload.get("pet_id")
    action = payload.get("action", "pet")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = PetsEngine.pet_action(save.player, pet_id, action)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Aksi hewan gagal."))
    return result

@app.post("/api/v1/game/pets-ranch/harvest")
def harvest_ranch_products():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = PetsEngine.harvest_ranch(save.player)
    return result

# --- 7. AUTOMATION & FACTORY EXPANSION ---
@app.get("/api/v1/game/automation")
def get_automation_state():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    AutomationEngine.initialize_automation(save.player)
    return {
        "automation_data": save.player.get("automation_data", {}),
        "buildings_catalog": BUILDINGS_CATALOG,
        "recipes": PRODUCTION_RECIPES
    }

@app.post("/api/v1/game/automation/build")
def build_factory_structure(payload: Dict[str, Any] = Body(...)):
    building_id = payload.get("building_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = AutomationEngine.construct_building(save.player, building_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pembangunan gagal."))
    return result

@app.post("/api/v1/game/automation/queue")
def queue_factory_production(payload: Dict[str, Any] = Body(...)):
    recipe_name = payload.get("recipe_name")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = AutomationEngine.queue_production(save.player, recipe_name)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Antrean pabrik gagal."))
    return result

@app.post("/api/v1/game/automation/collect")
def collect_factory_production(payload: Dict[str, Any] = Body(...)):
    queue_id = payload.get("queue_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = AutomationEngine.collect_production(save.player, queue_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pengambilan produk gagal."))
    return result

# --- 8. TIMED PORTALS & SEASONAL EVENTS (HALLOWEEN MADNESS) ---
@app.get("/api/v1/game/portals-events")
def get_portals_events():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    EventsEngine.initialize_events(save.world, save.player)
    return {
        "active_portals": save.world.get("active_portals", []),
        "portal_catalog": PORTAL_DIMENSIONS,
        "seasonal_events": save.world.get("seasonal_events", {}),
        "event_inventory": save.player.get("event_inventory", {}),
        "halloween_shop": HALLOWEEN_SHOP_ITEMS
    }

@app.post("/api/v1/game/portals-events/enter")
def enter_dimensional_portal(payload: Dict[str, Any] = Body(...)):
    portal_id = payload.get("portal_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EventsEngine.enter_portal(save.player, save.world, portal_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal menembus portal."))
    return result

@app.post("/api/v1/game/portals-events/trick-or-treat")
def trick_or_treat_npc(payload: Dict[str, Any] = Body(...)):
    npc_name = payload.get("npc_name", "Elara")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EventsEngine.trick_or_treat(save.player, save.world, npc_name)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Trick or treat gagal."))
    return result

@app.post("/api/v1/game/portals-events/shop")
def purchase_halloween_shop_item(payload: Dict[str, Any] = Body(...)):
    item_id = payload.get("item_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EventsEngine.purchase_halloween_item(save.player, save.world, item_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Pembelian gagal."))
    return result

# --- 9. COLLECTION JOURNAL, ACHIEVEMENTS & GUILDS ---
@app.get("/api/v1/game/collections")
def get_collections_summary():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    JournalEngine.initialize_journal(save.player)
    summary = JournalEngine.get_collection_summary(save.player)
    jdata = save.player.get("journal_data", {})
    return {
        "summary": summary,
        "achievements_catalog": ACHIEVEMENTS_CATALOG,
        "completed_achievements": jdata.get("completed_achievements", []),
        "claimed_achievements": jdata.get("claimed_achievements", [])
    }

@app.post("/api/v1/game/achievements/claim")
def claim_journal_achievement(payload: Dict[str, Any] = Body(...)):
    achievement_id = payload.get("achievement_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = JournalEngine.claim_achievement(save.player, achievement_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Klaim achievement gagal."))
    return result

@app.get("/api/v1/game/guilds")
def get_guilds():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    JournalEngine.initialize_journal(save.player)
    jdata = save.player.get("journal_data", {})
    return {
        "catalog": GUILDS_CATALOG,
        "active_guild_id": jdata.get("active_guild_id", "guild_farmer"),
        "guild_rank": jdata.get("guild_rank", "Adept"),
        "guild_reputation": jdata.get("guild_reputation", 280)
    }

@app.post("/api/v1/game/guilds/join")
def join_player_guild(payload: Dict[str, Any] = Body(...)):
    guild_id = payload.get("guild_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = JournalEngine.join_guild(save.player, guild_id)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal bergabung ke guild."))
    return result

# ==================== V6 EXPANSION: ENCYCLOPEDIA, LEADERBOARDS & ADMIN CONTROL CENTER ====================

# --- A. GRAND ENCYCLOPEDIA (38 CATEGORIES) ---
@app.get("/api/v1/game/encyclopedia/categories")
def get_encyclopedia_categories():
    return {
        "categories": EncyclopediaEngine.get_categories(),
        "milestone_tiers": MILESTONE_TIERS
    }

@app.get("/api/v1/game/encyclopedia/entries")
def get_encyclopedia_entries(
    category: Optional[str] = "all",
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 12
):
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    return EncyclopediaEngine.get_entries_page(
        player=save.player,
        category=category,
        search=search,
        page=page,
        limit=limit
    )

@app.post("/api/v1/game/encyclopedia/discover")
def record_encyclopedia_discovery(payload: Dict[str, Any] = Body(...)):
    entry_id = payload.get("entry_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EncyclopediaEngine.discover_entry(save.player, entry_id)
    return result

@app.post("/api/v1/game/encyclopedia/claim-milestone")
def claim_encyclopedia_milestone(payload: Dict[str, Any] = Body(...)):
    category = payload.get("category", "overall")
    percent = payload.get("percent", 10)
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    result = EncyclopediaEngine.claim_milestone_reward(save.player, category, int(percent))
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Klaim milestone gagal."))
    return result

# --- B. GLOBAL LEADERBOARDS & ANTI-CHEAT ---
@app.get("/api/v1/game/leaderboards/categories")
def get_leaderboard_categories():
    return {
        "categories": LEADERBOARD_CATEGORIES,
        "periods": ["all_time", "season", "monthly", "weekly", "daily"]
    }

@app.get("/api/v1/game/leaderboards/rankings")
def get_leaderboard_rankings(
    category: str = "overall_mastery",
    period: str = "all_time",
    page: int = 1,
    limit: int = 10
):
    save = game_store.get_save(1)
    player_data = save.player if save else None
    farm_grid = None
    if save and hasattr(save, "farm_grid"):
        farm_grid = [t for row in save.farm_grid for t in row]

    return LeaderboardEngine.get_leaderboard_page(
        category=category,
        period=period,
        player=player_data,
        farm_grid=farm_grid,
        page=page,
        limit=limit
    )

@app.get("/api/v1/game/leaderboards/profile")
def get_leaderboard_profile():
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    farm_grid = [t for row in save.farm_grid for t in row] if hasattr(save, "farm_grid") else None
    return LeaderboardEngine.get_player_profile(save.player, farm_grid)

@app.post("/api/v1/game/leaderboards/privacy")
def update_leaderboard_privacy(payload: Dict[str, Any] = Body(...)):
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    return LeaderboardEngine.update_privacy(save.player, payload)

# --- C. IN-GAME ADMIN CONTROL CENTER (EVERGREEN DASHBOARD) ---
@app.get("/api/v1/admin/telemetry")
def get_admin_telemetry():
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    if not AdminEngine.check_permission(role, "telemetry:read"):
        raise HTTPException(status_code=403, detail="Akses ditolak: role tidak memiliki izin membaca telemetri.")
    return AdminEngine.get_system_telemetry()

@app.get("/api/v1/admin/events")
def get_admin_staged_events():
    return {
        "events": AdminEngine.get_staged_events()
    }

@app.post("/api/v1/admin/events/manage")
def manage_admin_event(payload: Dict[str, Any] = Body(...)):
    event_id = payload.get("event_id")
    action = payload.get("action", "start")
    reason = payload.get("reason", "Pengujian staging event")
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    admin_name = save.player.get("name", "Admin") if save else "Admin"

    result = AdminEngine.manage_event(event_id, action, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal mengelola event."))
    return result

@app.post("/api/v1/admin/quests/simulate")
def simulate_admin_quest(payload: Dict[str, Any] = Body(...)):
    quest_id = payload.get("quest_id")
    objective_idx = payload.get("objective_idx", 0)
    reason = payload.get("reason", "Pengujian simulasi quest")
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    admin_name = save.player.get("name", "Admin") if save else "Admin"

    result = AdminEngine.simulate_quest(quest_id, objective_idx, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal simulasi quest."))
    return result

@app.post("/api/v1/admin/world/clock")
def adjust_admin_world_clock(payload: Dict[str, Any] = Body(...)):
    hours = int(payload.get("hours", 1))
    season = payload.get("season")
    reason = payload.get("reason", "Pengujian rotasi waktu")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    role = save.player.get("admin_role", "super_admin")
    admin_name = save.player.get("name", "Admin")

    result = AdminEngine.adjust_world_clock(save.world, hours, season, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal mengubah jam dunia."))
    return result

@app.post("/api/v1/admin/world/weather")
def set_admin_weather(payload: Dict[str, Any] = Body(...)):
    weather = payload.get("weather", "Sunny")
    reason = payload.get("reason", "Pengujian kondisi cuaca")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    role = save.player.get("admin_role", "super_admin")
    admin_name = save.player.get("name", "Admin")

    result = AdminEngine.set_weather(save.world, weather, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal mengubah cuaca."))
    return result

@app.post("/api/v1/admin/economy/simulate")
def simulate_admin_economy(payload: Dict[str, Any] = Body(...)):
    commodity = payload.get("commodity", "wheat")
    multiplier = float(payload.get("multiplier", 1.5))
    reason = payload.get("reason", "Simulasi lonjakan harga pasar")
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    admin_name = save.player.get("name", "Admin") if save else "Admin"

    result = AdminEngine.simulate_economy_shock(commodity, multiplier, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal simulasi ekonomi."))
    return result

@app.post("/api/v1/admin/farming/boost")
def boost_admin_farming(payload: Dict[str, Any] = Body(...)):
    reason = payload.get("reason", "Pengujian pematangan tanaman instan")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    role = save.player.get("admin_role", "super_admin")
    admin_name = save.player.get("name", "Admin")

    flat_grid = [t for row in save.farm_grid for t in row]
    result = AdminEngine.boost_all_crops(flat_grid, admin_name, role, reason)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal mematangkan tanaman."))
    return result

@app.get("/api/v1/admin/robotics/diagnose")
def diagnose_admin_robotics():
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    admin_name = save.player.get("name", "Admin") if save else "Admin"

    result = AdminEngine.diagnose_robotics(admin_name, role)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal diagnostik robot."))
    return result

@app.post("/api/v1/admin/qa/run")
def run_admin_qa_suite(payload: Dict[str, Any] = Body(...)):
    suite_name = payload.get("suite_name", "Full V6 Regression Suite")
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    admin_name = save.player.get("name", "Admin") if save else "Admin"

    result = AdminEngine.run_qa_automation_suite(suite_name, admin_name, role)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Gagal menjalankan suite QA."))
    return result

@app.get("/api/v1/admin/audit-logs")
def get_admin_audit_logs(limit: int = 50, search: Optional[str] = None):
    save = game_store.get_save(1)
    role = save.player.get("admin_role", "super_admin") if save else "player"
    if not AdminEngine.check_permission(role, "audit:read"):
        raise HTTPException(status_code=403, detail="Akses ditolak: role tidak memiliki izin membaca audit log.")
    return {
        "logs": AdminEngine.get_audit_logs(limit=limit, search=search)
    }


# ==================== CYBERSECURITY & ANTI-HACK SHIELD API ====================

@app.get("/api/v1/security/overview")
def get_security_overview():
    """Returns real-time cybersecurity telemetry, WAF status, and threat metrics."""
    return SecurityAuditLogger.get_security_overview()

@app.get("/api/v1/security/audit-logs")
def get_security_audit_logs(limit: int = 50, severity: Optional[str] = None):
    """Returns recent security events (tamper alerts, blocked intrusions)."""
    return {
        "logs": SecurityAuditLogger.get_recent_logs(limit=limit, min_severity=severity)
    }

@app.post("/api/v1/security/unblock-ip")
def unblock_quarantined_ip(payload: Dict[str, Any] = Body(...)):
    """Admin action to lift an IP quarantine."""
    ip = payload.get("ip")
    if not ip:
        raise HTTPException(status_code=400, detail="Missing ip address")
    success = RateLimiter.unban_ip(ip)
    return {"success": success, "unbanned_ip": ip}

@app.post("/api/v1/security/sanitize")
def sanitize_text_input(payload: Dict[str, Any] = Body(...)):
    """Utility endpoint to sanitize user-provided names and text."""
    raw_text = payload.get("text", "")
    cleaned = InputSanitizer.clean_text(raw_text)
    return {"original": raw_text, "sanitized": cleaned}

@app.post("/api/v1/security/verify-integrity/{slot_id}")
def verify_save_integrity(slot_id: int):
    """Verifies cryptographic HMAC signature and bounds sanity of a save slot."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail="Save slot not found")
    save_dict = save.dict()
    is_valid_sig = HMACIntegrityShield.verify_signature(save_dict, save.hmac_signature or "")
    is_valid_state, violation = AntiCheatValidator.validate_game_state(save_dict)
    return {
        "slot_id": slot_id,
        "hmac_verified": is_valid_sig,
        "state_sanitary": is_valid_state,
        "violation_reason": violation,
        "security_verdict": "SECURE" if (is_valid_sig and is_valid_state) else "TAMPERED"
    }


# ==================== V7 EXPANSION: WORLD EXPANSION & BOSS SYSTEMS ====================

@app.get("/api/v1/game/world-zones")
def get_world_zones():
    save = game_store.get_save(1)
    player = save.player if save else {}
    return {
        "zones": ZonesEngine.get_all_zones(player),
        "unlocked_zones": player.get("unlocked_zones", ["ancient_forest"]),
        "discovered_landmarks": player.get("discovered_landmarks", [])
    }

@app.post("/api/v1/game/world-zones/unlock")
def unlock_world_zone(payload: Dict[str, Any] = Body(...)):
    zone_id = payload.get("zone_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ZonesEngine.unlock_zone(save.player, zone_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal membuka zona"))
    return res

@app.post("/api/v1/game/world-zones/fast-travel")
def fast_travel_to_zone(payload: Dict[str, Any] = Body(...)):
    zone_id = payload.get("zone_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ZonesEngine.fast_travel(save.player, zone_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal fast travel"))
    return res

@app.post("/api/v1/game/world-zones/landmark")
def discover_zone_landmark(payload: Dict[str, Any] = Body(...)):
    landmark_id = payload.get("landmark_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ZonesEngine.discover_landmark(save.player, landmark_id)
    return res

# --- BOSS ENCOUNTER ENGINE ---

@app.get("/api/v1/game/bosses")
def get_boss_catalog():
    save = game_store.get_save(1)
    player = save.player if save else {}
    return {
        "bosses": BossEngine.get_boss_catalog(player),
        "active_encounters": list(BossEngine.ACTIVE_ENCOUNTERS.keys())
    }

@app.post("/api/v1/game/bosses/start")
def start_boss_encounter(payload: Dict[str, Any] = Body(...)):
    boss_id = payload.get("boss_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = BossEngine.start_encounter(save.player, boss_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal memulai encounter boss"))
    return res

@app.post("/api/v1/game/bosses/progress")
def progress_boss_encounter(payload: Dict[str, Any] = Body(...)):
    encounter_id = payload.get("encounter_id")
    amount = payload.get("amount", payload.get("contribution", 1))
    res = BossEngine.progress_objective(encounter_id, amount)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal memajukan puzzle boss"))
    return res

@app.post("/api/v1/game/bosses/claim-rewards")
def claim_boss_rewards(payload: Dict[str, Any] = Body(...)):
    encounter_id = payload.get("encounter_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = BossEngine.claim_boss_rewards(save.player, encounter_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal klaim reward"))
    return res

# --- EXPEDITION SYSTEM ---

@app.get("/api/v1/game/expeditions/metadata")
def get_expedition_metadata():
    return ExpeditionsEngine.get_expedition_metadata()

@app.post("/api/v1/game/expeditions/dispatch")
def dispatch_expedition(payload: Dict[str, Any] = Body(...)):
    zone_id = payload.get("zone_id")
    destination_name = payload.get("destination_name", "Ekspedisi Purba")
    companion_ids = payload.get("companion_ids") or ([payload.get("companion_id")] if payload.get("companion_id") else ["comp_elara"])
    supplies = payload.get("supplies", [])
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ExpeditionsEngine.create_and_dispatch_expedition(save.player, zone_id, destination_name, companion_ids, supplies)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal memberangkatkan ekspedisi"))
    return res

@app.post("/api/v1/game/expeditions/progress")
def progress_expedition(payload: Dict[str, Any] = Body(...)):
    expedition_id = payload.get("expedition_id")
    objective_index = payload.get("objective_index", 0)
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ExpeditionsEngine.progress_expedition_objective(save.player, expedition_id, objective_index)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal memperbarui progres ekspedisi"))
    return res

@app.post("/api/v1/game/expeditions/complete")
def complete_expedition(payload: Dict[str, Any] = Body(...)):
    expedition_id = payload.get("expedition_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ExpeditionsEngine.complete_expedition_and_generate_report(save.player, expedition_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal menyelesaikan ekspedisi"))
    return res

# --- RESTORATION PROJECTS ---

@app.get("/api/v1/game/restoration/projects")
def get_restoration_projects():
    save = game_store.get_save(1)
    player = save.player if save else {}
    return {
        "projects": RestorationEngine.get_projects(player)
    }

@app.post("/api/v1/game/restoration/contribute")
def contribute_to_restoration(payload: Dict[str, Any] = Body(...)):
    project_id = payload.get("project_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = RestorationEngine.contribute_to_stage(save.player, project_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal kontribusi restorasi"))
    return res

# --- ADVANCED TOOLS & EQUIPMENT ---

@app.get("/api/v1/game/tools/advanced")
def get_advanced_tools():
    save = game_store.get_save(1)
    player = save.player if save else {}
    return ToolsAdvancedEngine.get_tools_catalog(player)

@app.post("/api/v1/game/tools/advanced/upgrade")
def upgrade_advanced_tool(payload: Dict[str, Any] = Body(...)):
    tool_id = payload.get("tool_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ToolsAdvancedEngine.upgrade_tool(save.player, tool_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal upgrade tool"))
    return res

@app.post("/api/v1/game/tools/advanced/loadout")
def set_advanced_loadout(payload: Dict[str, Any] = Body(...)):
    preset_id = payload.get("preset_id")
    save = game_store.get_save(1)
    if not save:
        raise HTTPException(status_code=404, detail="Save not found")
    res = ToolsAdvancedEngine.set_active_loadout(save.player, preset_id)
    if not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Gagal switch loadout"))
    return res


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
