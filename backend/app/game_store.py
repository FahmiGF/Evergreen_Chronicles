import datetime
import random
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class Item(BaseModel):
    id: str
    name: str
    category: str  # tool, seed, crop, mineral, material, animal_product, technology, food
    description: str
    buy_price: int
    sell_price: int
    stackable: bool
    icon_type: str  # e.g., 'hoe', 'can', 'seed', 'crop_parsnip', 'sword', 'crystal'
    crop_growth_days: Optional[int] = None
    harvest_item_id: Optional[str] = None
    stamina_cost: Optional[int] = 0
    energy_restore: Optional[int] = 0

class CropState(BaseModel):
    crop_id: str
    stage: int  # 0 to 4 (0: seed, 4: mature)
    max_stage: int
    days_grown: int
    watered_today: bool

class FarmTile(BaseModel):
    x: int
    y: int
    tile_type: str  # grass, tilled, watered, obstacle_rock, obstacle_wood, obstacle_weed, structure
    crop: Optional[CropState] = None
    structure_type: Optional[str] = None  # e.g. sprinkler, chest, lamp

class NPCProfile(BaseModel):
    id: str
    name: str
    title: str
    location: str
    friendship_points: int  # 0 to 2500 (250 pts per heart, max 10 hearts)
    talked_today: bool
    favorite_gifts: List[str]
    dialogues: Dict[str, str]  # season/era specific dialogue

class TechNode(BaseModel):
    id: str
    name: str
    era: int  # 1 to 5
    description: str
    cost_gold: int
    cost_aether: int
    unlocked: bool
    prerequisites: List[str]
    benefits: str

class GameSave(BaseModel):
    slot_id: int
    save_name: str
    saved_at: str
    player: Dict[str, Any]
    world: Dict[str, Any]
    farm_grid: List[List[Dict[str, Any]]]
    npcs: List[Dict[str, Any]]
    tech_tree: List[Dict[str, Any]]
    active_quests: List[Dict[str, Any]]
    completed_quests: List[str]
    shipping_bin: List[Dict[str, Any]]

# Comprehensive Item Catalog
ITEMS_DATABASE: Dict[str, Item] = {
    # Tools
    "tool_hoe": Item(id="tool_hoe", name="Cangkul Besi Tempa", category="tool", description="Mencangkul tanah rumput menjadi petak siap tanam.", buy_price=0, sell_price=50, stackable=False, icon_type="hoe", stamina_cost=2),
    "tool_watering_can": Item(id="tool_watering_can", name="Gembor Tembaga", category="tool", description="Menyiram air pada tanah agar tanaman bertumbuh.", buy_price=0, sell_price=50, stackable=False, icon_type="can", stamina_cost=2),
    "tool_pickaxe": Item(id="tool_pickaxe", name="Beliung Penambang", category="tool", description="Menghancurkan batu dan menambang bijih mineral.", buy_price=0, sell_price=50, stackable=False, icon_type="pickaxe", stamina_cost=3),
    "tool_axe": Item(id="tool_axe", name="Kapak Penebang", category="tool", description="Menebang pohon dan membelah tunggul kayu keras.", buy_price=0, sell_price=50, stackable=False, icon_type="axe", stamina_cost=3),
    "tool_sword": Item(id="tool_sword", name="Pedang Ksatria Aether", category="tool", description="Senjata tempur tebas untuk membasmi monster dungeon.", buy_price=250, sell_price=100, stackable=False, icon_type="sword", stamina_cost=1),
    "tool_crystal_blade": Item(id="tool_crystal_blade", name="Bilah Kristal Aether", category="tool", description="Pedang modern bertenaga resonansi kristal tajam.", buy_price=1200, sell_price=600, stackable=False, icon_type="crystal_blade", stamina_cost=1),

    # Seeds
    "seed_parsnip": Item(id="seed_parsnip", name="Benih Parsnip", category="seed", description="Tumbuh dalam 4 hari di musim semi.", buy_price=20, sell_price=10, stackable=True, icon_type="seed_bag", crop_growth_days=4, harvest_item_id="crop_parsnip"),
    "seed_potato": Item(id="seed_potato", name="Bibit Kentang", category="seed", description="Tumbuh dalam 5 hari, potensi panen ganda.", buy_price=35, sell_price=15, stackable=True, icon_type="seed_bag", crop_growth_days=5, harvest_item_id="crop_potato"),
    "seed_strawberry": Item(id="seed_strawberry", name="Benih Stroberi", category="seed", description="Tumbuh dalam 6 hari dan berbuah berulang.", buy_price=60, sell_price=30, stackable=True, icon_type="seed_bag", crop_growth_days=6, harvest_item_id="crop_strawberry"),
    "seed_corn": Item(id="seed_corn", name="Benih Jagung Emas", category="seed", description="Tumbuh di musim panas dan gugur dalam 6 hari.", buy_price=45, sell_price=20, stackable=True, icon_type="seed_bag", crop_growth_days=6, harvest_item_id="crop_corn"),
    "seed_tomato": Item(id="seed_tomato", name="Benih Tomat Segar", category="seed", description="Tumbuh dalam 5 hari dan berbuah cepat.", buy_price=30, sell_price=15, stackable=True, icon_type="seed_bag", crop_growth_days=5, harvest_item_id="crop_tomato"),
    "seed_moonberry": Item(id="seed_moonberry", name="Benih Moonberry Ajaib", category="seed", description="Tanaman langka yang bersinar di malam hari.", buy_price=150, sell_price=75, stackable=True, icon_type="seed_magical", crop_growth_days=7, harvest_item_id="crop_moonberry"),

    # Crops Harvested
    "crop_parsnip": Item(id="crop_parsnip", name="Parsnip Segar", category="crop", description="Akar umbi manis musim semi.", buy_price=60, sell_price=45, stackable=True, icon_type="parsnip", energy_restore=25),
    "crop_potato": Item(id="crop_potato", name="Kentang Aetherwyn", category="crop", description="Bergizi tinggi dan lezat dipanggang.", buy_price=90, sell_price=70, stackable=True, icon_type="potato", energy_restore=35),
    "crop_strawberry": Item(id="crop_strawberry", name="Stroberi Manis", category="crop", description="Buah merah ranum favorit penduduk Greenvale.", buy_price=160, sell_price=120, stackable=True, icon_type="strawberry", energy_restore=45),
    "crop_corn": Item(id="crop_corn", name="Jagung Emas", category="crop", description="Tongkol jagung kuning manis kaya karbohidrat.", buy_price=120, sell_price=90, stackable=True, icon_type="corn", energy_restore=40),
    "crop_tomato": Item(id="crop_tomato", name="Tomat Merah Segar", category="crop", description="Bahan dasar masakan sup dan saus hangat.", buy_price=80, sell_price=60, stackable=True, icon_type="tomato", energy_restore=30),
    "crop_moonberry": Item(id="crop_moonberry", name="Moonberry Kristal", category="crop", description="Buah magis bercahaya ungu yang berharga tinggi.", buy_price=400, sell_price=320, stackable=True, icon_type="moonberry", energy_restore=80),

    # Minerals & Materials
    "mat_wood": Item(id="mat_wood", name="Kayu Gelondongan", category="material", description="Material dasar bangunan dan pagar.", buy_price=20, sell_price=5, stackable=True, icon_type="wood"),
    "mat_stone": Item(id="mat_stone", name="Batu Kali", category="material", description="Bahan pondasi jalan dan tungku peleburan.", buy_price=20, sell_price=4, stackable=True, icon_type="stone"),
    "mat_copper_ore": Item(id="mat_copper_ore", name="Bijih Tembaga", category="mineral", description="Mineral logam kemerahan dari gua tambang.", buy_price=50, sell_price=25, stackable=True, icon_type="ore_copper"),
    "mat_iron_ore": Item(id="mat_iron_ore", name="Bijih Besi", category="mineral", description="Bahan utama penempaan mesin dan perkakas kokoh.", buy_price=90, sell_price=45, stackable=True, icon_type="ore_iron"),
    "mat_gold_ore": Item(id="mat_gold_ore", name="Bijih Emas Murni", category="mineral", description="Logam mulia berkilau untuk sirkuit dan mahkota.", buy_price=200, sell_price=100, stackable=True, icon_type="ore_gold"),
    "mat_aether_crystal": Item(id="mat_aether_crystal", name="Kristal Aether Murni", category="mineral", description="Sumber energi peradaban modern Aetherwyn.", buy_price=350, sell_price=180, stackable=True, icon_type="aether_crystal"),

    # Modern & Magical Tech
    "tech_sprinkler_basic": Item(id="tech_sprinkler_basic", name="Crystal Sprinkler Mk.I", category="technology", description="Menyiram 4 petak di sekelilingnya setiap pagi secara otomatis.", buy_price=300, sell_price=150, stackable=True, icon_type="sprinkler"),
    "tech_sprinkler_modern": Item(id="tech_sprinkler_modern", name="Smart Aether Sprinkler Mk.II", category="technology", description="Menyiram 8 petak di sekitarnya dengan energi kristal.", buy_price=750, sell_price=350, stackable=True, icon_type="sprinkler_adv"),
    "tech_aether_generator": Item(id="tech_aether_generator", name="Generator Daya Aether", category="technology", description="Pembangkit daya listrik mikro untuk lampu dan otomasi.", buy_price=1500, sell_price=700, stackable=False, icon_type="generator"),
    "tech_street_lamp": Item(id="tech_street_lamp", name="Lampu Jalan LED Modern", category="technology", description="Menerangi malam hari secara otomatis.", buy_price=180, sell_price=80, stackable=True, icon_type="lamp"),
}

class EvergreenGameEngine:
    """Core Game Engine Manager handling game state, procedural world, and saves."""
    def __init__(self):
        self.grid_width = 16
        self.grid_height = 16
        self.save_slots: Dict[int, GameSave] = {}
        self._init_default_save()

    def _create_initial_grid(self) -> List[List[Dict[str, Any]]]:
        grid = []
        for y in range(self.grid_height):
            row = []
            for x in range(self.grid_width):
                # Center area clear for farming
                tile_type = "grass"
                crop = None
                structure = None

                # Scatter starter rocks, weeds, and wood outside central farming plot
                is_near_center = (4 <= x <= 11) and (4 <= y <= 11)
                if not is_near_center:
                    rand_val = random.random()
                    if rand_val < 0.12:
                        tile_type = "obstacle_weed"
                    elif rand_val < 0.22:
                        tile_type = "obstacle_rock"
                    elif rand_val < 0.30:
                        tile_type = "obstacle_wood"

                # Pre-tilled plot with starter parsnips for immediate fun
                if (x, y) == (7, 7):
                    tile_type = "watered"
                    crop = {"crop_id": "crop_parsnip", "stage": 3, "max_stage": 4, "days_grown": 3, "watered_today": True}
                elif (x, y) == (8, 7):
                    tile_type = "watered"
                    crop = {"crop_id": "crop_strawberry", "stage": 4, "max_stage": 4, "days_grown": 6, "watered_today": True}
                elif (x, y) == (7, 8):
                    tile_type = "tilled"
                    crop = {"crop_id": "crop_potato", "stage": 1, "max_stage": 4, "days_grown": 1, "watered_today": False}
                elif (x, y) == (8, 8):
                    tile_type = "tilled"
                    crop = None

                row.append({
                    "x": x,
                    "y": y,
                    "tile_type": tile_type,
                    "crop": crop,
                    "structure_type": structure
                })
            grid.append(row)
        return grid

    def _init_default_save(self):
        initial_player = {
            "name": "Fahmi",
            "gold": 650,
            "aether_shards": 25,
            "hp": 100,
            "max_hp": 100,
            "stamina": 120,
            "max_stamina": 120,
            "profession_levels": {
                "farmer": 2,
                "miner": 1,
                "warrior": 1,
                "engineer": 1
            },
            "inventory": [
                {"item_id": "tool_hoe", "count": 1},
                {"item_id": "tool_watering_can", "count": 1},
                {"item_id": "tool_pickaxe", "count": 1},
                {"item_id": "tool_axe", "count": 1},
                {"item_id": "tool_sword", "count": 1},
                {"item_id": "seed_parsnip", "count": 8},
                {"item_id": "seed_strawberry", "count": 4},
                {"item_id": "crop_parsnip", "count": 2},
                {"item_id": "mat_wood", "count": 24},
                {"item_id": "mat_stone", "count": 16},
                {"item_id": "tech_sprinkler_basic", "count": 1},
                None, None, None, None, None, None, None, None, None, None, None, None, None
            ],
            "equipped_index": 0
        }

        initial_world = {
            "day": 5,
            "season": "Spring",
            "year": 1,
            "time_hour": 8,
            "time_minute": 30,
            "weather": "Sunny",
            "era_level": 1,  # 1: Medieval Village, 2: Settlement, 3: Industrial, 4: Modern Fantasy
            "era_name": "Era 1 — Medieval Roots (Desa Awal)",
            "village_prosperity": 340,
            "current_location": "Aetherwyn Farm"
        }

        initial_npcs = [
            {
                "id": "npc_elara",
                "name": "Elara",
                "title": "Ahli Herbal & Tabib Desa",
                "location": "Apotek Herbal Greenvale",
                "friendship_points": 750,  # 3 hearts
                "talked_today": False,
                "favorite_gifts": ["crop_strawberry", "crop_moonberry"],
                "dialogue": "Selamat pagi, pengelana! Udara musim semi hari ini membawa aroma segar pucuk tanaman."
            },
            {
                "id": "npc_rowan",
                "name": "Rowan",
                "title": "Pandai Besi Kerajaan",
                "location": "Bengkel Tempa Rowan",
                "friendship_points": 500,  # 2 hearts
                "talked_today": False,
                "favorite_gifts": ["mat_iron_ore", "mat_copper_ore"],
                "dialogue": "Bawakan aku lebih banyak bijih besi dari tambang kuno, dan aku bisa menempa cangkul yang lebih awet untukmu."
            },
            {
                "id": "npc_nessa",
                "name": "Nessa",
                "title": "Insinyur Mesin & Penemu",
                "location": "Laboratorium Riset Aether",
                "friendship_points": 620,  # 2.5 hearts
                "talked_today": False,
                "favorite_gifts": ["mat_aether_crystal", "mat_gold_ore"],
                "dialogue": "Kristal Aether ini bukan sekadar batu permata biasa. Getarannya sanggup menyalakan lampu tanpa setetes pun minyak!"
            },
            {
                "id": "npc_mira",
                "name": "Mira",
                "title": "Pedagang Umum & Pasar",
                "location": "Toserba Greenvale",
                "friendship_points": 900,  # 3.5 hearts
                "talked_today": False,
                "favorite_gifts": ["crop_parsnip", "crop_potato"],
                "dialogue": "Sayuran berkualitas tinggi selalu kubeli dengan harga bersaing. Jangan ragu mengisi kotak pengirimanmu!"
            }
        ]

        initial_tech_tree = [
            {"id": "tech_agri_1", "name": "Irigasi Parit Tradisional", "era": 1, "description": "Menurunkan konsumsi stamina saat menyiram tanaman.", "cost_gold": 150, "cost_aether": 0, "unlocked": True, "prerequisites": [], "benefits": "Stamina hemat 25%"},
            {"id": "tech_mineral_1", "name": "Peleburan Tembaga & Perunggu", "era": 1, "description": "Membuka kemampuan menempa alat tembaga di pandai besi.", "cost_gold": 250, "cost_aether": 5, "unlocked": True, "prerequisites": [], "benefits": "Buka Upgrade Cangkul Tembaga"},
            {"id": "tech_sprinkler_1", "name": "Crystal Sprinkler Otomatis", "era": 2, "description": "Membuat sprinkler berbasis getaran kristal untuk menyiram 4 petak sekeliling.", "cost_gold": 500, "cost_aether": 15, "unlocked": False, "prerequisites": ["tech_agri_1"], "benefits": "Penyiraman 4 Petak Otomatis"},
            {"id": "tech_steam_1", "name": "Mesin Uap & Rel Tambang", "era": 3, "description": "Membuka jalur lori dorong minecart di dalam tambang gua.", "cost_gold": 1200, "cost_aether": 40, "unlocked": False, "prerequisites": ["tech_mineral_1"], "benefits": "Kecepatan Transportasi Tambang +50%"},
            {"id": "tech_electric_1", "name": "Jaringan Listrik Kristal Aether", "era": 4, "description": "Menggantikan lentera minyak desa menjadi lampu jalan LED modern.", "cost_gold": 2500, "cost_aether": 80, "unlocked": False, "prerequisites": ["tech_sprinkler_1", "tech_steam_1"], "benefits": "Evolusi Desa ke Era Modern"},
            {"id": "tech_auto_harvest", "name": "Automaton Pemanen Otonom", "era": 5, "description": "Robot automaton bertenaga Aether yang memanen tanaman matang otomatis.", "cost_gold": 6000, "cost_aether": 200, "unlocked": False, "prerequisites": ["tech_electric_1"], "benefits": "Otomasi Total Pertanian"}
        ]

        default_save = GameSave(
            slot_id=1,
            save_name="Petualangan Fahmi - Aetherwyn",
            saved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            player=initial_player,
            world=initial_world,
            farm_grid=self._create_initial_grid(),
            npcs=initial_npcs,
            tech_tree=initial_tech_tree,
            active_quests=[
                {"id": "qst_01", "title": "Warisan Tanah Hijau", "description": "Panen tanaman pertamamu dan jual di kotak pengiriman.", "reward_gold": 150, "reward_aether": 5, "progress": 1, "target": 2, "completed": False},
                {"id": "qst_02", "title": "Menembus Gua Tambang", "description": "Kalahkan 3 slime di lantai 1 Forgotten Mines.", "reward_gold": 200, "reward_aether": 10, "progress": 0, "target": 3, "completed": False}
            ],
            completed_quests=[],
            shipping_bin=[]
        )
        self.save_slots[1] = default_save

    def get_save(self, slot_id: int) -> Optional[GameSave]:
        return self.save_slots.get(slot_id)

    def save_game(self, slot_id: int, payload: Dict[str, Any]) -> GameSave:
        save_obj = GameSave(
            slot_id=slot_id,
            save_name=payload.get("save_name", f"Slot {slot_id}"),
            saved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            player=payload["player"],
            world=payload["world"],
            farm_grid=payload["farm_grid"],
            npcs=payload["npcs"],
            tech_tree=payload["tech_tree"],
            active_quests=payload.get("active_quests", []),
            completed_quests=payload.get("completed_quests", []),
            shipping_bin=payload.get("shipping_bin", [])
        )
        self.save_slots[slot_id] = save_obj
        return save_obj

    def advance_day(self, slot_id: int) -> Dict[str, Any]:
        save = self.save_slots.get(slot_id)
        if not save:
            self._init_default_save()
            save = self.save_slots[1]

        # 1. Calculate shipping bin profits
        total_gold_earned = sum(item.get("sell_price", 10) * item.get("count", 1) for item in save.shipping_bin)
        save.player["gold"] += total_gold_earned
        sold_summary = list(save.shipping_bin)
        save.shipping_bin = []

        # 2. Advance time & calendar
        world = save.world
        world["day"] += 1
        if world["day"] > 28:
            world["day"] = 1
            seasons = ["Spring", "Summer", "Autumn", "Winter"]
            cur_idx = seasons.index(world["season"])
            next_season = seasons[(cur_idx + 1) % len(seasons)]
            world["season"] = next_season
            if next_season == "Spring":
                world["year"] += 1

        world["time_hour"] = 6
        world["time_minute"] = 0
        # Random weather tomorrow
        world["weather"] = random.choice(["Sunny", "Sunny", "Rainy", "Cloudy", "Sunny"])

        # 3. Restore player Stamina & HP
        save.player["stamina"] = save.player["max_stamina"]
        save.player["hp"] = save.player["max_hp"]

        # 4. Advance crops on farm grid
        crops_grown_count = 0
        grid = save.farm_grid
        is_raining = world["weather"] == "Rainy"

        for row in grid:
            for tile in row:
                # Watered soil dries out unless raining
                was_watered = tile["tile_type"] == "watered" or is_raining or tile.get("structure_type") == "sprinkler"
                crop = tile.get("crop")

                if crop and was_watered:
                    crop["days_grown"] += 1
                    crop["stage"] = min(crop["max_stage"], crop["days_grown"])
                    crops_grown_count += 1

                # Reset tile watering for new day
                if is_raining:
                    tile["tile_type"] = "watered" if tile["tile_type"] in ["tilled", "watered"] else tile["tile_type"]
                else:
                    tile["tile_type"] = "tilled" if tile["tile_type"] == "watered" else tile["tile_type"]

        # 5. Check Era Evolution based on unlocked tech
        unlocked_tech_ids = [t["id"] for t in save.tech_tree if t.get("unlocked")]
        if "tech_auto_harvest" in unlocked_tech_ids:
            world["era_level"] = 5
            world["era_name"] = "Era 5 — Aether Civilization (Peradaban Magis Modern Penuh)"
        elif "tech_electric_1" in unlocked_tech_ids:
            world["era_level"] = 4
            world["era_name"] = "Era 4 — Modern Fantasy (Listrik & Mesin Cerdas)"
        elif "tech_steam_1" in unlocked_tech_ids:
            world["era_level"] = 3
            world["era_name"] = "Era 3 — Industrial Fantasy (Uap & Lori Tambang)"
        elif "tech_sprinkler_1" in unlocked_tech_ids:
            world["era_level"] = 2
            world["era_name"] = "Era 2 — Growing Settlement (Desa Berkembang)"
        else:
            world["era_level"] = 1
            world["era_name"] = "Era 1 — Medieval Roots (Desa Awal)"

        return {
            "day": world["day"],
            "season": world["season"],
            "year": world["year"],
            "weather": world["weather"],
            "era_level": world["era_level"],
            "era_name": world["era_name"],
            "total_gold_earned": total_gold_earned,
            "sold_items": sold_summary,
            "crops_grown_count": crops_grown_count
        }

    def unlock_tech(self, slot_id: int, tech_id: str) -> Dict[str, Any]:
        save = self.save_slots.get(slot_id)
        if not save:
            self._init_default_save()
            save = self.save_slots[1]

        target_tech = next((t for t in save.tech_tree if t["id"] == tech_id), None)
        if not target_tech:
            return {"success": False, "error": f"Tech ID '{tech_id}' not found"}

        if target_tech.get("unlocked"):
            return {"success": False, "error": f"Tech '{target_tech['name']}' already unlocked"}

        # Check prereqs
        unlocked_ids = [t["id"] for t in save.tech_tree if t.get("unlocked")]
        for prereq in target_tech.get("prerequisites", []):
            if prereq not in unlocked_ids:
                return {"success": False, "error": f"Prerequisite '{prereq}' is not yet unlocked"}

        # Check costs
        cost_gold = target_tech.get("cost_gold", 0)
        cost_aether = target_tech.get("cost_aether", 0)

        if save.player["gold"] < cost_gold:
            return {"success": False, "error": f"Not enough Gold (Need {cost_gold}, Have {save.player['gold']})"}
        if save.player.get("aether_shards", 0) < cost_aether:
            return {"success": False, "error": f"Not enough Aether Shards (Need {cost_aether}, Have {save.player.get('aether_shards', 0)})"}

        # Deduct
        save.player["gold"] -= cost_gold
        save.player["aether_shards"] -= cost_aether
        target_tech["unlocked"] = True

        # Re-evaluate era
        unlocked_tech_ids = [t["id"] for t in save.tech_tree if t.get("unlocked")]
        world = save.world
        if "tech_auto_harvest" in unlocked_tech_ids:
            world["era_level"] = 5
            world["era_name"] = "Era 5 — Aether Civilization (Peradaban Magis Modern Penuh)"
        elif "tech_electric_1" in unlocked_tech_ids:
            world["era_level"] = 4
            world["era_name"] = "Era 4 — Modern Fantasy (Listrik & Mesin Cerdas)"
        elif "tech_steam_1" in unlocked_tech_ids:
            world["era_level"] = 3
            world["era_name"] = "Era 3 — Industrial Fantasy (Uap & Lori Tambang)"
        elif "tech_sprinkler_1" in unlocked_tech_ids:
            world["era_level"] = 2
            world["era_name"] = "Era 2 — Growing Settlement (Desa Berkembang)"

        return {
            "success": True,
            "tech": target_tech,
            "era_level": world["era_level"],
            "era_name": world["era_name"],
            "gold_left": save.player["gold"],
            "aether_left": save.player["aether_shards"]
        }

CRAFTING_RECIPES = [
    {
        "result_item_id": "tech_sprinkler_basic",
        "result_count": 1,
        "name": "Crystal Sprinkler Mk.I",
        "category": "Technology",
        "materials": [{"item_id": "mat_copper_ore", "count": 2}, {"item_id": "mat_wood", "count": 5}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_sprinkler_modern",
        "result_count": 1,
        "name": "Smart Aether Sprinkler Mk.II",
        "category": "Technology",
        "materials": [{"item_id": "mat_iron_ore", "count": 4}, {"item_id": "mat_aether_crystal", "count": 1}],
        "unlocked_by_era": 3
    },
    {
        "result_item_id": "tool_crystal_blade",
        "result_count": 1,
        "name": "Bilah Kristal Aether",
        "category": "Weapon",
        "materials": [{"item_id": "mat_iron_ore", "count": 5}, {"item_id": "mat_aether_crystal", "count": 3}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_street_lamp",
        "result_count": 1,
        "name": "Lampu Jalan LED Modern",
        "category": "Lighting",
        "materials": [{"item_id": "mat_wood", "count": 8}, {"item_id": "mat_aether_crystal", "count": 1}],
        "unlocked_by_era": 4
    }
]

game_store = EvergreenGameEngine()
