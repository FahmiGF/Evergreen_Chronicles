import datetime
import random
import hashlib
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.progression_engine import ProgressionEngine
from app.equipment_engine import EquipmentEngine
from app.mounts_engine import MountsEngine
from app.mining_engine import MiningEngine
from app.fishing_engine import FishingEngine
from app.pets_engine import PetsEngine
from app.automation_engine import AutomationEngine
from app.events_engine import EventsEngine
from app.journal_engine import JournalEngine
from app.encyclopedia_engine import EncyclopediaEngine
from app.leaderboard_engine import LeaderboardEngine
from app.admin_engine import AdminEngine

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
    structure_type: Optional[str] = None  # e.g. sprinkler, chest, lamp, pipe, hydroponic
    tree_type: Optional[str] = None  # oak, pine, birch, willow, lumina, cherry, ironbark, golden_apple
    tree_stage: Optional[int] = 0  # 0: sapling, 1: young, 2: mature
    tree_hp: Optional[int] = 3
    fertilizer_type: Optional[str] = None  # organic, speed
    water_piped: Optional[bool] = False

class NPCProfile(BaseModel):
    id: str
    name: str
    title: str
    location: str
    affection_level: int = 0  # 0 to 10 max
    friendship_points: int = 0  # 0 to 1000 (100 points per level)
    talked_today: bool = False
    favorite_gifts: List[str] = []
    dialogues: Optional[Dict[str, str]] = {}
    unlocked_perks: Optional[List[str]] = []

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
    version: Optional[str] = "6.0.0"
    checksum: Optional[str] = None
    player: Dict[str, Any]
    world: Dict[str, Any]
    farm_grid: List[List[Dict[str, Any]]]
    npcs: List[Dict[str, Any]]
    tech_tree: List[Dict[str, Any]]
    active_quests: List[Dict[str, Any]]
    completed_quests: List[str]
    active_npc_quests: Optional[List[Dict[str, Any]]] = []
    completed_npc_quests: Optional[List[str]] = []
    storyline_unlocked: Optional[List[str]] = ["chap_prologue"]
    shipping_bin: List[Dict[str, Any]]
    civilization: Optional[Dict[str, Any]] = None
    market: Optional[Dict[str, Any]] = None
    living_npcs: Optional[Dict[str, Any]] = None

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
    "seed_beetroot": Item(id="seed_beetroot", name="Benih Bit Merah", category="seed", description="Umbi merah kaya zat besi. Tumbuh dalam 4 hari, disukai Tabib Elara dan Rowan.", buy_price=35, sell_price=18, stackable=True, icon_type="seed_bag", crop_growth_days=4, harvest_item_id="crop_beetroot"),
    "seed_corn": Item(id="seed_corn", name="Benih Jagung Emas", category="seed", description="Tumbuh di musim panas dan gugur dalam 6 hari.", buy_price=45, sell_price=20, stackable=True, icon_type="seed_bag", crop_growth_days=6, harvest_item_id="crop_corn"),
    "seed_tomato": Item(id="seed_tomato", name="Benih Tomat Segar", category="seed", description="Tumbuh dalam 5 hari dan berbuah cepat.", buy_price=30, sell_price=15, stackable=True, icon_type="seed_bag", crop_growth_days=5, harvest_item_id="crop_tomato"),
    "seed_moonberry": Item(id="seed_moonberry", name="Benih Moonberry Ajaib", category="seed", description="Tanaman langka yang bersinar di malam hari.", buy_price=150, sell_price=75, stackable=True, icon_type="seed_magical", crop_growth_days=7, harvest_item_id="crop_moonberry"),
    "seed_wheat": Item(id="seed_wheat", name="Benih Gandum Emas", category="seed", description="Tumbuh subur dalam 4 hari. Gandum utama untuk roti hangat dan pakan ternak.", buy_price=25, sell_price=12, stackable=True, icon_type="seed_bag", crop_growth_days=4, harvest_item_id="crop_wheat"),
    "seed_golden_pumpkin": Item(id="seed_golden_pumpkin", name="Benih Labu Emas", category="seed", description="Benih labu raksasa berkilau emas. Tumbuh dalam 6 hari dengan nilai jual fantastis.", buy_price=180, sell_price=90, stackable=True, icon_type="seed_magical", crop_growth_days=6, harvest_item_id="crop_golden_pumpkin"),
    "seed_frostberry": Item(id="seed_frostberry", name="Benih Frostberry Salju", category="seed", description="Tanaman beri tahan beku dari Frostpeak. Tumbuh dalam 5 hari menghasilkan buah es segar.", buy_price=90, sell_price=45, stackable=True, icon_type="seed_magical", crop_growth_days=5, harvest_item_id="crop_frostberry"),
    "seed_sunburst_corn": Item(id="seed_sunburst_corn", name="Benih Jagung Surya", category="seed", description="Varietas jagung modern tahan kekeringan. Tumbuh dalam 5 hari dan panen berulang tiap 2 hari.", buy_price=110, sell_price=55, stackable=True, icon_type="seed_bag", crop_growth_days=5, harvest_item_id="crop_sunburst_corn"),
    "seed_steam_spud": Item(id="seed_steam_spud", name="Umbi Kentang Uap", category="seed", description="Hasil rekayasa teknologi pertanian Ironhaven. Menghasilkan energi uap alami saat direbus.", buy_price=75, sell_price=35, stackable=True, icon_type="seed_bag", crop_growth_days=4, harvest_item_id="crop_steam_spud"),
    "seed_ghost_pumpkin": Item(id="seed_ghost_pumpkin", name="Benih Labu Hantu", category="seed", description="Benih labu musiman Halloween Madness. Tumbuh dalam 4 hari menghasilkan buah labu mistis bercahaya.", buy_price=120, sell_price=60, stackable=True, icon_type="seed_magical", crop_growth_days=4, harvest_item_id="crop_ghost_pumpkin"),
    "crop_ghost_pumpkin": Item(id="crop_ghost_pumpkin", name="Labu Hantu Halloween", category="crop", description="Labu mistis bermata oranye terang untuk festival roh dan pai labu.", buy_price=300, sell_price=220, stackable=True, icon_type="crop_ghost_pumpkin", energy_restore=60),

    # Tree Saplings (8 Unique Tree Varieties)
    "sapling_oak": Item(id="sapling_oak", name="Sapling Pohon Ek Rimba", category="seed", description="Tumbuh menjadi Pohon Ek yang rindang dan menghasilkan Kayu Ek padat serta Acorn.", buy_price=80, sell_price=40, stackable=True, icon_type="sapling_oak"),
    "sapling_pine": Item(id="sapling_pine", name="Sapling Pohon Pinus Salju", category="seed", description="Pohon jarum wangi khas pegunungan. Menghasilkan Kayu Pinus dan Getah Damar berharga.", buy_price=90, sell_price=45, stackable=True, icon_type="sapling_pine"),
    "sapling_birch": Item(id="sapling_birch", name="Sapling Pohon Birch Perak", category="seed", description="Pohon dengan kulit putih keperakan. Menghasilkan Kayu Birch halus bermutu tinggi.", buy_price=85, sell_price=40, stackable=True, icon_type="sapling_birch"),
    "sapling_willow": Item(id="sapling_willow", name="Sapling Pohon Gandaria Rawa", category="seed", description="Pohon willow dengan sulur menjuntai artistik. Tahan air dan menghasilkan kayu keras.", buy_price=120, sell_price=60, stackable=True, icon_type="sapling_willow"),
    "sapling_lumina": Item(id="sapling_lumina", name="Sapling Pohon Lumina Roh", category="seed", description="Pohon magis bercahaya ungu kebiruan dari Moonveil. Menghasilkan Kayu Lumina dan Getah Roh.", buy_price=260, sell_price=130, stackable=True, icon_type="sapling_lumina"),
    "sapling_cherry": Item(id="sapling_cherry", name="Sapling Pohon Sakura Harum", category="seed", description="Pohon bunga sakura mekar merah muda yang menyejukkan hati. Menghasilkan Nektar Sakura.", buy_price=150, sell_price=75, stackable=True, icon_type="sapling_cherry"),
    "sapling_ironbark": Item(id="sapling_ironbark", name="Sapling Pohon Besi Purba", category="seed", description="Pohon purba berkulit sekeras lempeng baja. Menghasilkan Kayu Besi untuk industri berat.", buy_price=220, sell_price=110, stackable=True, icon_type="sapling_ironbark"),
    "sapling_golden_apple": Item(id="sapling_golden_apple", name="Sapling Pohon Apel Emas", category="seed", description="Pohon buah legendaris istana Crownspire. Berbuah Apel Emas yang memulihkan stamina penuh.", buy_price=400, sell_price=200, stackable=True, icon_type="sapling_golden_apple"),

    # Crops Harvested
    "crop_parsnip": Item(id="crop_parsnip", name="Parsnip Segar", category="crop", description="Akar umbi manis musim semi.", buy_price=60, sell_price=45, stackable=True, icon_type="parsnip", energy_restore=25),
    "crop_potato": Item(id="crop_potato", name="Kentang Aetherwyn", category="crop", description="Bergizi tinggi dan lezat dipanggang.", buy_price=90, sell_price=70, stackable=True, icon_type="potato", energy_restore=35),
    "crop_strawberry": Item(id="crop_strawberry", name="Stroberi Manis", category="crop", description="Buah merah ranum favorit penduduk Greenvale.", buy_price=160, sell_price=120, stackable=True, icon_type="strawberry", energy_restore=45),
    "crop_beetroot": Item(id="crop_beetroot", name="Bit Merah Segar", category="crop", description="Umbi merah manis bergizi tinggi untuk tonik kesehatan dan bahan tempa pandai besi.", buy_price=85, sell_price=60, stackable=True, icon_type="beetroot", energy_restore=35),
    "crop_corn": Item(id="crop_corn", name="Jagung Emas", category="crop", description="Tongkol jagung kuning manis kaya karbohidrat.", buy_price=120, sell_price=90, stackable=True, icon_type="corn", energy_restore=40),
    "crop_tomato": Item(id="crop_tomato", name="Tomat Merah Segar", category="crop", description="Bahan dasar masakan sup dan saus hangat.", buy_price=80, sell_price=60, stackable=True, icon_type="tomato", energy_restore=30),
    "crop_moonberry": Item(id="crop_moonberry", name="Moonberry Kristal", category="crop", description="Buah magis bercahaya ungu yang berharga tinggi.", buy_price=400, sell_price=320, stackable=True, icon_type="moonberry", energy_restore=80),
    "crop_wheat": Item(id="crop_wheat", name="Gandum Emas Aetherwyn", category="crop", description="Gandum matang kaya bulir emas, bahan tepung roti dan pakan ternak istimewa.", buy_price=75, sell_price=55, stackable=True, icon_type="wheat", energy_restore=30),
    "crop_golden_pumpkin": Item(id="crop_golden_pumpkin", name="Labu Emas Kerajaan", category="crop", description="Labu raksasa kuning keemasan yang memancarkan aroma manis karamel.", buy_price=500, sell_price=380, stackable=True, icon_type="golden_pumpkin", energy_restore=90),
    "crop_frostberry": Item(id="crop_frostberry", name="Frostberry Dingin", category="crop", description="Buah beri sejuk yang memberikan kesegaran instan di tengah keletihan kerja.", buy_price=220, sell_price=160, stackable=True, icon_type="frostberry", energy_restore=60),
    "crop_sunburst_corn": Item(id="crop_sunburst_corn", name="Jagung Surya Unggul", category="crop", description="Jagung manis dengan biji berkilau seperti sinar fajar musim panas.", buy_price=240, sell_price=175, stackable=True, icon_type="sunburst_corn", energy_restore=65),
    "crop_steam_spud": Item(id="crop_steam_spud", name="Kentang Uap Mekanikal", category="crop", description="Kentang kaya pati padat bertenaga yang disukai para insinyur perbengkelan.", buy_price=170, sell_price=130, stackable=True, icon_type="steam_spud", energy_restore=50),
    "crop_golden_apple": Item(id="crop_golden_apple", name="Apel Emas Mistis", category="crop", description="Buah legenda Aetherwyn. Menyembuhkan 80 HP dan memulihkan 100 Stamina seketika!", buy_price=600, sell_price=450, stackable=True, icon_type="golden_apple", energy_restore=100),
    "crop_cherry_nectar": Item(id="crop_cherry_nectar", name="Nektar Bunga Sakura", category="crop", description="Ekstrak madu bunga sakura musim semi yang manis dan menenangkan.", buy_price=190, sell_price=140, stackable=True, icon_type="cherry_nectar", energy_restore=50),

    # Minerals & Materials (Wood Types & Tree Drops)
    "mat_wood": Item(id="mat_wood", name="Kayu Gelondongan", category="material", description="Material dasar bangunan dan pagar.", buy_price=20, sell_price=5, stackable=True, icon_type="wood"),
    "mat_oak_wood": Item(id="mat_oak_wood", name="Balok Kayu Ek", category="material", description="Kayu ek kuat dan padat untuk struktur perumahan dan perabot.", buy_price=30, sell_price=10, stackable=True, icon_type="wood_oak"),
    "mat_pine_wood": Item(id="mat_pine_wood", name="Kayu Pinus Wangi", category="material", description="Kayu pinus resin ringan untuk peti dan lantai kapal.", buy_price=35, sell_price=12, stackable=True, icon_type="wood_pine"),
    "mat_birch_wood": Item(id="mat_birch_wood", name="Kayu Birch Perak", category="material", description="Kayu berwarna terang elegan untuk perabot mewah dan kertas gambar cetak biru.", buy_price=35, sell_price=12, stackable=True, icon_type="wood_birch"),
    "mat_willow_hardwood": Item(id="mat_willow_hardwood", name="Kayu Gandaria Rawa", category="material", description="Kayu elastis tahan air untuk kincir air dan pipa irigasi.", buy_price=45, sell_price=18, stackable=True, icon_type="wood_willow"),
    "mat_lumina_wood": Item(id="mat_lumina_wood", name="Kayu Lumina Berpendar", category="material", description="Kayu magis yang memancarkan pendaran ungu di malam hari. Bahan konduktor daya aether.", buy_price=90, sell_price=45, stackable=True, icon_type="wood_lumina"),
    "mat_cherry_wood": Item(id="mat_cherry_wood", name="Kayu Sakura Merah Muda", category="material", description="Kayu dekoratif bernilai artistik tinggi dengan serat merah muda halus.", buy_price=65, sell_price=28, stackable=True, icon_type="wood_cherry"),
    "mat_ironbark_timber": Item(id="mat_ironbark_timber", name="Balok Kayu Besi Purba", category="material", description="Kayu sekeras baja dari pohon purba. Tahan api dan peluru, bahan mesin industri berat.", buy_price=120, sell_price=60, stackable=True, icon_type="wood_ironbark"),
    "mat_tree_sap": Item(id="mat_tree_sap", name="Getah Pohon Alami", category="material", description="Getah perekat alami untuk membuat pupuk dan obor.", buy_price=25, sell_price=8, stackable=True, icon_type="sap"),
    "mat_resin": Item(id="mat_resin", name="Damar Pinus Gunung", category="material", description="Damar amber berkilau untuk vernis kapal dan campuran bahan bakar uap traktor.", buy_price=40, sell_price=16, stackable=True, icon_type="resin"),
    "mat_mystic_sap": Item(id="mat_mystic_sap", name="Getah Roh Lumina", category="material", description="Cairan getah mistis bercahaya untuk mengaktifkan medan daya pylon dan traktor aether.", buy_price=110, sell_price=55, stackable=True, icon_type="mystic_sap"),
    "mat_stone": Item(id="mat_stone", name="Batu Kali", category="material", description="Bahan pondasi jalan dan tungku peleburan.", buy_price=20, sell_price=4, stackable=True, icon_type="stone"),
    "mat_copper_ore": Item(id="mat_copper_ore", name="Bijih Tembaga", category="mineral", description="Mineral logam kemerahan dari gua tambang.", buy_price=50, sell_price=25, stackable=True, icon_type="ore_copper"),
    "mat_iron_ore": Item(id="mat_iron_ore", name="Bijih Besi", category="mineral", description="Bahan utama penempaan mesin dan perkakas kokoh.", buy_price=90, sell_price=45, stackable=True, icon_type="ore_iron"),
    "mat_gold_ore": Item(id="mat_gold_ore", name="Bijih Emas Murni", category="mineral", description="Logam mulia berkilau untuk sirkuit dan mahkota.", buy_price=200, sell_price=100, stackable=True, icon_type="ore_gold"),
    "mat_aether_crystal": Item(id="mat_aether_crystal", name="Kristal Aether Murni", category="mineral", description="Sumber energi peradaban modern Aetherwyn.", buy_price=350, sell_price=180, stackable=True, icon_type="aether_crystal"),

    # Fertilizers & Soil Enhancers
    "item_fertilizer_organic": Item(id="item_fertilizer_organic", name="Pupuk Kompos Bio-Organik", category="fertilizer", description="Taburkan pada tanah bercocok tanam. Meningkatkan kualitas hasil panen (+30% nilai jual).", buy_price=40, sell_price=15, stackable=True, icon_type="fertilizer_green"),
    "item_fertilizer_speed": Item(id="item_fertilizer_speed", name="Eliksir Percepat Tumbuh Aether", category="fertilizer", description="Menutrisi bibit dengan cairan aether aktif, mempercepat masa panen hingga 2 kali lipat!", buy_price=90, sell_price=40, stackable=True, icon_type="fertilizer_blue"),

    # Vehicle (Tractor) & Heavy Farming Accessories
    "vehicle_tractor": Item(id="vehicle_tractor", name="Traktor Uap Aetherwyn Mk.I", category="vehicle", description="Kendaraan traktor roda besar serbaguna. Naiki (Tekan T) untuk membajak, menyiram, dan panen kilat!", buy_price=2500, sell_price=1200, stackable=False, icon_type="tractor"),
    "tech_tractor_tiller": Item(id="tech_tractor_tiller", name="Mata Bajak Tiller Traktor", category="technology", description="Attachment depan traktor untuk membajak 3 petak tanah sekaligus saat dikendarai.", buy_price=600, sell_price=250, stackable=False, icon_type="tiller"),
    "tech_tractor_sprayer": Item(id="tech_tractor_sprayer", name="Tangki Semprot Air Traktor", category="technology", description="Attachment tangki semprot air untuk menyiram 3 petak tanah sekaligus sambil melaju.", buy_price=750, sell_price=300, stackable=False, icon_type="sprayer"),
    "tech_tractor_mower": Item(id="tech_tractor_mower", name="Pisau Pemanen Otomatis Traktor", category="technology", description="Attachment pemotong panen yang langsung memindahkan hasil panen matang ke bagasi.", buy_price=950, sell_price=400, stackable=False, icon_type="mower"),
    "fuel_bio_aether": Item(id="fuel_bio_aether", name="Tabung Bio-Aether Traktor", category="material", description="Bahan bakar uap ramah lingkungan untuk traktor Aetherwyn (+100 Bahan Bakar).", buy_price=80, sell_price=35, stackable=True, icon_type="fuel_can"),

    # Modern & Magical Tech & Blueprint Structures
    "tech_sprinkler_basic": Item(id="tech_sprinkler_basic", name="Crystal Sprinkler Mk.I", category="technology", description="Menyiram 4 petak di sekelilingnya setiap pagi secara otomatis.", buy_price=300, sell_price=150, stackable=True, icon_type="sprinkler"),
    "tech_sprinkler_modern": Item(id="tech_sprinkler_modern", name="Smart Aether Sprinkler Mk.II", category="technology", description="Menyiram 8 petak di sekitarnya dengan energi kristal.", buy_price=750, sell_price=350, stackable=True, icon_type="sprinkler_adv"),
    "tech_irrigation_pipe": Item(id="tech_irrigation_pipe", name="Pipa Irigasi Aether Bawah Tanah", category="technology", description="Pipa air bertekanan mengalirkan air kolam ke seluruh sprinkler dan petak tanah.", buy_price=60, sell_price=25, stackable=True, icon_type="pipe"),
    "tech_hydroponic_basin": Item(id="tech_hydroponic_basin", name="Bak Hidroponik Otomatis", category="technology", description="Media tanam kaya nutrisi cairan aether. Tumbuh sepanjang tahun tanpa tergantung musim.", buy_price=650, sell_price=300, stackable=True, icon_type="hydroponic"),
    "tech_compost_bin": Item(id="tech_compost_bin", name="Bak Kompos Bio-Organik", category="technology", description="Mengolah sampah rumput dan sisa tanaman menjadi Pupuk Kompos Alami bermutu.", buy_price=250, sell_price=100, stackable=True, icon_type="compost"),
    "tech_seed_extractor": Item(id="tech_seed_extractor", name="Mesin Ekstraksi Benih", category="technology", description="Memisahkan biji unggul dari panen menjadi 2-3 bibit berkualitas tinggi.", buy_price=550, sell_price=240, stackable=True, icon_type="seed_extractor"),
    "tech_auto_harvester": Item(id="tech_auto_harvester", name="Menara Panen Otomatis", category="technology", description="Memanen tanaman matang di radius 5x5 otomatis setiap fajar.", buy_price=1400, sell_price=650, stackable=True, icon_type="auto_harvester"),
    "tech_mana_pylon": Item(id="tech_mana_pylon", name="Menara Pylon Daya Aether", category="technology", description="Memancarkan medan resonansi daya listrik nirkabel ke mesin pertanian.", buy_price=900, sell_price=400, stackable=True, icon_type="pylon"),
    "tech_aether_generator": Item(id="tech_aether_generator", name="Generator Daya Aether", category="technology", description="Pembangkit daya listrik mikro untuk lampu dan otomasi.", buy_price=1500, sell_price=700, stackable=False, icon_type="generator"),
    "tech_street_lamp": Item(id="tech_street_lamp", name="Lampu Jalan LED Modern", category="technology", description="Menerangi malam hari secara otomatis.", buy_price=180, sell_price=80, stackable=True, icon_type="lamp"),
    "tech_storage_chest": Item(id="tech_storage_chest", name="Peti Kayu Kuat", category="technology", description="Peti penyimpanan ekstra untuk hasil panen dan perkakas.", buy_price=100, sell_price=40, stackable=True, icon_type="chest"),
    "tech_fence_wood": Item(id="tech_fence_wood", name="Pagar Kayu Paddock", category="technology", description="Pagar kayu pelindung petak tanaman dan batas peternakan.", buy_price=20, sell_price=8, stackable=True, icon_type="fence"),
    "item_fellowship_medal": Item(id="item_fellowship_medal", name="Medali Harmoni Aetherwyn", category="material", description="Simbol persaudaraan dan cinta sejati dengan seluruh warga desa.", buy_price=0, sell_price=1200, stackable=False, icon_type="medal"),
}

# ==================== 10 PLAYABLE RACES CATALOG ====================
RACES_CATALOG = [
    {
        "id": "race_human",
        "name": "Human (Manusia)",
        "heritage": "Pioneer Realm of Aetherwyn",
        "icon": "👤",
        "description": "Ras serbaguna dengan daya adaptasi tinggi dan semangat merintis yang tak tergoyahkan.",
        "passive_perk": "Pengalaman Cepat: +10% EXP semua profesi & konsumsi stamina seimbang.",
        "perk_type": "all_round",
        "perk_values": {"exp_boost": 0.10, "stamina_cost_mult": 1.0},
        "default_features": {"ears": "ears_human_round", "horns": "none", "wings": "none", "tail": "none"},
        "lore": "Manusia mendirikan pemukiman pertama di lembah Aetherwyn, menggabungkan kearifan bertani tradisional dengan rasa ingin tahu terhadap misteri dunia."
    },
    {
        "id": "race_high_elf",
        "name": "High Elf (Peri Hutan)",
        "heritage": "Ancient First Canopy of Sylva",
        "icon": "🧝",
        "description": "Keturunan pengelana kanopi purba yang memiliki ikatan batin erat dengan flora dan tanah.",
        "passive_perk": "Sentuhan Alam: Tanaman tumbuh 25% lebih cepat & hasil panen berpotensi ganda.",
        "perk_type": "farming",
        "perk_values": {"growth_speed_mult": 1.25, "double_harvest_chance": 0.20},
        "default_features": {"ears": "ears_elven_long", "horns": "none", "wings": "none", "tail": "none"},
        "lore": "Kaum High Elf mampu mendengar bisikan benih di dalam tanah, menjaga keasrian hutan sembari membudidayakan rempah langka."
    },
    {
        "id": "race_dwarf",
        "name": "Dwarf (Kurcaci Penempa)",
        "heritage": "Irondeep Mountain Citadel",
        "icon": "🧔",
        "description": "Ahli geologi dan pandai besi tangguh dari pegunungan batu berurat bijih.",
        "passive_perk": "Nadi Batuan: +35% perolehan bijih tambang & daya tahan beliung 2x lipat.",
        "perk_type": "mining",
        "perk_values": {"mining_yield_boost": 0.35, "pickaxe_durability": 2.0},
        "default_features": {"ears": "ears_human_round", "horns": "none", "wings": "none", "tail": "none"},
        "lore": "Ditempa di antara gemeretak perapian, bangsa kurcaci menguasai rahasia peleburan logam kuno dan kristal Aether."
    },
    {
        "id": "race_beastfolk",
        "name": "Beastfolk (Kaum Satwa)",
        "heritage": "Verdant Roar Plains",
        "icon": "🦊",
        "description": "Keturunan roh rimba bertelinga dan berekor rubah atau serigala yang lincah dan berempati tinggi.",
        "passive_perk": "Sahabat Satwa: Hewan ternak menghasilkan +50% kebahagiaan & kecepatan gerak di rumput +15%.",
        "perk_type": "animals",
        "perk_values": {"animal_happy_boost": 0.50, "grass_speed_boost": 0.15},
        "default_features": {"ears": "ears_beast_fluffy", "horns": "none", "wings": "none", "tail": "tail_beast_fluffy"},
        "lore": "Kedekatan Beastfolk dengan hewan liar membuat mereka peternak alami yang paling dicintai oleh domba dan unggas."
    },
    {
        "id": "race_dragonkin",
        "name": "Dragonkin (Bangsawan Naga)",
        "heritage": "Volcanic Cinderspire Peak",
        "icon": "🐲",
        "description": "Keturunan ras naga kuno bersisik halus dan bertanduk megah dengan ketahanan fisik luar biasa.",
        "passive_perk": "Darah Wyrm: Imun terhadap udara panas & konsumsi stamina berkurang 20% saat kerja berat.",
        "perk_type": "stamina",
        "perk_values": {"stamina_cost_mult": 0.80, "heat_immunity": True},
        "default_features": {"ears": "ears_human_round", "horns": "horns_draconic", "wings": "wings_dragon_leather", "tail": "tail_dragon_scaled"},
        "lore": "Nafas naga yang mengalir di pembuluh darah mereka memberikan kekuatan tanpa tanding saat mencangkul tanah keras."
    },
    {
        "id": "race_sylph",
        "name": "Sylph (Roh Angin)",
        "heritage": "Whispering Zephyr Isles",
        "icon": "🌪️",
        "description": "Makhluk aerodinamis yang melayang anggun mengikuti hembusan angin sepoi-sepoi.",
        "passive_perk": "Langkah Angin: Kecepatan lari dasar meningkat +25% & stamina sprint gratis.",
        "perk_type": "speed",
        "perk_values": {"speed_mult": 1.25, "sprint_stamina": 0.0},
        "default_features": {"ears": "ears_elven_long", "horns": "none", "wings": "wings_sylph_feather", "tail": "none"},
        "lore": "Kaki bangsa Sylph nyaris tidak menyentuh tanah, memungkinkan mereka menjelajah seluruh penjuru peta dengan kilat."
    },
    {
        "id": "race_fairykin",
        "name": "Fairykin (Kaum Peri Mungil)",
        "heritage": "Twilight Lumina Glade",
        "icon": "🧚",
        "description": "Sosok peri mungil bercahaya lembut dengan sayap kristal berkilauan.",
        "passive_perk": "Aura Gemerlap: Menerangi area gelap di malam hari & panen bunga langka 2x lipat.",
        "perk_type": "foraging",
        "perk_values": {"night_glow": True, "rare_flower_mult": 2.0},
        "default_features": {"ears": "ears_elven_long", "horns": "none", "wings": "wings_fairy_glimmer", "tail": "none"},
        "lore": "Kehadiran Fairykin di malam hari membawa taburan debu peri yang menyuburkan tanah dan menenteramkan malam."
    },
    {
        "id": "race_tideborn",
        "name": "Tideborn (Keturunan Samudra)",
        "heritage": "Coral Abyssal Depths",
        "icon": "🧜",
        "description": "Penjaga perairan berhiaskan sirip telinga mutiara yang menguasai seni memancing dan irigasi.",
        "passive_perk": "Mata Laut: Target tangkapan pancingan 40% lebih lebar & ikan langka lebih sering mendekat.",
        "perk_type": "fishing",
        "perk_values": {"fishing_bar_width_mult": 1.40, "rare_fish_attraction": 0.30},
        "default_features": {"ears": "ears_fin_aquatic", "horns": "none", "wings": "none", "tail": "tail_fish_aquatic"},
        "lore": "Setiap arus air dan getaran permukaan kolam terbaca jelas oleh insting tajam para pemancing Tideborn."
    },
    {
        "id": "race_golemkin",
        "name": "Golemkin (Manusia Batu Aether)",
        "heritage": "Forgotten Foundry of Titans",
        "icon": "🗿",
        "description": "Konstruk hidup bertubuh batuan granit yang dialiri inti energi kristal Aether murni.",
        "passive_perk": "Rangka Baja: Kebal efek lelah stamina & biaya material saat membangun diskon 15%.",
        "perk_type": "building",
        "perk_values": {"building_cost_discount": 0.15, "stamina_exhaustion_proof": True},
        "default_features": {"ears": "ears_human_round", "horns": "horns_crystal", "wings": "none", "tail": "none"},
        "lore": "Diciptakan oleh arsitek purba, Golemkin sanggup mengangkat balok kayu raksasa tanpa mengenal rasa letih."
    },
    {
        "id": "race_shadowborn",
        "name": "Shadowborn (Kaum Bayangan)",
        "heritage": "Eclipse Umbral Realm",
        "icon": "🌑",
        "description": "Pengelana malam misterius yang mendapatkan berkah kekuatan dari pancaran sinar bulan dan kegelapan.",
        "passive_perk": "Tirai Malam: Kecepatan +30% saat malam & bonus drop loot gua tambang 25%.",
        "perk_type": "combat",
        "perk_values": {"night_speed_boost": 0.30, "dungeon_loot_boost": 0.25},
        "default_features": {"ears": "ears_elven_long", "horns": "none", "wings": "none", "tail": "none"},
        "lore": "Saat matahari terbenam dan kabut malam tiba, para Shadowborn justru berada dalam performa puncak mereka."
    }
]

# ==================== 12 PERSONALITIES CATALOG ====================
PERSONALITIES_CATALOG = [
    {"id": "pers_kind", "name": "Kind (Penyayang)", "icon": "❤️", "desc": "Penuh empati, gemar menolong, disukai hewan ternak dan penduduk desa."},
    {"id": "pers_brave", "name": "Brave (Pemberani)", "icon": "⚔️", "desc": "Tidak gentar menjelajahi gua tambang gelap dan menantang monster rimba."},
    {"id": "pers_curious", "name": "Curious (Penasaran)", "icon": "🔍", "desc": "Selalu mencari rahasia tersembunyi, tanaman langka, dan teknologi baru."},
    {"id": "pers_ambitious", "name": "Ambitious (Ambisius)", "icon": "👑", "desc": "Fokus pada pertumbuhan ekonomi, perluasan kebun, dan kejayaan pemukiman."},
    {"id": "pers_creative", "name": "Creative (Kreatif)", "icon": "🎨", "desc": "Mencintai desain arsitektur, dekorasi ruangan, dan keindahan estetika."},
    {"id": "pers_introverted", "name": "Introverted (Pendiam)", "icon": "📖", "desc": "Lebih menikmati ketenangan kebun, membaca buku, dan waktu menyendiri."},
    {"id": "pers_outgoing", "name": "Outgoing (Supel)", "icon": "🎉", "desc": "Mudah mengakrabkan diri di festival dan cepat menaikkan hati warga desa."},
    {"id": "pers_calm", "name": "Calm (Tenang)", "icon": "🧘", "desc": "Selalu berkepala dingin di saat krisis dan efisien dalam penggunaan stamina."},
    {"id": "pers_adventurous", "name": "Adventurous (Petualang)", "icon": "🗺️", "desc": "Senang melintasi perbatasan zona dan mengumpulkan artefak kuno."},
    {"id": "pers_practical", "name": "Practical (Praktis)", "icon": "🔧", "desc": "Mengutamakan mekanisasi pertanian, efisiensi traktor, dan otomatisasi."},
    {"id": "pers_scholarly", "name": "Scholarly (Cendekiawan)", "icon": "🧪", "desc": "Ahli dalam eksperimen botani, mutasi benih, dan riset era peradaban."},
    {"id": "pers_mischievous", "name": "Mischievous (Jenaka)", "icon": "🎭", "desc": "Penuh humor, suka membuat kejutan, dan membuat suasana selalu ceria."}
]

# ==================== 8 BACKGROUNDS CATALOG ====================
BACKGROUNDS_CATALOG = [
    {"id": "bg_merchant", "name": "Mantan Pedagang Kota", "icon": "💰", "bonus_gold": 300, "bonus_items": ["crop_parsnip", "crop_potato"], "desc": "Memulai dengan modal emas lebih banyak dan pemahaman harga pasar."},
    {"id": "bg_village_heir", "name": "Pewaris Tanah Leluhur", "icon": "🏡", "bonus_gold": 100, "bonus_items": ["tool_hoe", "seed_wheat"], "desc": "Mendapat sambutan hangat dari tetua desa dan benih warisan keluarga."},
    {"id": "bg_adventurer", "name": "Pengelana Kelana", "icon": "🛡️", "bonus_gold": 150, "bonus_items": ["tool_sword", "mat_copper_ore"], "desc": "Membawa pedang tempaan tua dan ketahanan fisik menjelajahi belantara."},
    {"id": "bg_engineer", "name": "Magang Insinyur Mesin", "icon": "⚙️", "bonus_gold": 120, "bonus_items": ["fuel_bio_aether", "tech_sprinkler_basic"], "desc": "Paham teknologi traktor dan mekanisasi sejak hari pertama kedatangan."},
    {"id": "bg_refugee", "name": "Bangsawan Dalam Pelarian", "icon": "⚜️", "bonus_gold": 250, "bonus_items": ["mat_aether_crystal"], "desc": "Menyimpan kristal pusaka kerajaan di balik jubah petaninya."},
    {"id": "bg_scholar", "name": "Peneliti Ekologi Hutan", "icon": "📜", "bonus_gold": 100, "bonus_items": ["item_fertilizer_organic", "sapling_cherry"], "desc": "Membawa pupuk organik racikan sendiri dan bibit sakura langka."},
    {"id": "bg_guardian", "name": "Penjaga Rumpun Rimba", "icon": "🌿", "bonus_gold": 80, "bonus_items": ["sapling_lumina", "crop_moonberry"], "desc": "Memiliki kepekaan mistis terhadap pohon lumina dan buah malam."},
    {"id": "bg_wanderer", "name": "Musafir Tanpa Jejak", "icon": "👣", "bonus_gold": 150, "bonus_items": ["seed_parsnip", "mat_wood"], "desc": "Memulai lembaran hidup baru dari nol di bumi Aetherwyn."}
]

# ==================== CUSTOMIZATION PALETTES ====================
CUSTOMIZATION_PALETTES = {
    "skin_tones": [
        {"id": "tone_warm_fair", "name": "Warm Fair (Kuning Langsat)", "hex": "#fed7aa"},
        {"id": "tone_pale", "name": "Pale Elven (Putih Pucat)", "hex": "#fef3c7"},
        {"id": "tone_olive", "name": "Olive (Sawo Matang)", "hex": "#d97706"},
        {"id": "tone_deep_amber", "name": "Deep Amber (Emas Gelap)", "hex": "#b45309"},
        {"id": "tone_obsidian", "name": "Obsidian Night (Gelap Pekat)", "hex": "#451a03"},
        {"id": "tone_celestial_blue", "name": "Celestial Cyan (Biru Roh)", "hex": "#a5f3fc"},
        {"id": "tone_draconic_crimson", "name": "Draconic Ruby (Merah Naga)", "hex": "#fca5a5"}
    ],
    "hair_styles": [
        {"id": "adventurer", "name": "Rambut Petualang Pendek", "category": "classic"},
        {"id": "braided_long", "name": "Kepang Panjang Rimba", "category": "long"},
        {"id": "spiky", "name": "Spiky Ksatria Angin", "category": "short"},
        {"id": "wavy_bob", "name": "Wavy Bob Elegan", "category": "medium"},
        {"id": "elven_twin", "name": "Kuncir Kembar Peri", "category": "long"},
        {"id": "dwarven_bun", "name": "Sanggul Pandai Besi", "category": "bun"},
        {"id": "mage_shaggy", "name": "Shaggy Cendekiawan", "category": "medium"},
        {"id": "royal_curly", "name": "Ikal Bangsawan Istana", "category": "long"}
    ],
    "hair_colors": [
        {"id": "hair_chestnut", "name": "Cokelat Kayu Manis", "hex": "#78350f"},
        {"id": "hair_golden", "name": "Emas Jagung", "hex": "#eab308"},
        {"id": "hair_silver", "name": "Perak Salju", "hex": "#e2e8f0"},
        {"id": "hair_crimson", "name": "Merah Delima", "hex": "#dc2626"},
        {"id": "hair_obsidian", "name": "Hitam Arang", "hex": "#1c1917"},
        {"id": "hair_sakura", "name": "Merah Muda Sakura", "hex": "#f472b6"},
        {"id": "hair_aether_cyan", "name": "Cyan Kristal Aether", "hex": "#06b6d4"},
        {"id": "hair_emerald", "name": "Hijau Zamrud", "hex": "#16a34a"}
    ],
    "eye_colors": [
        {"id": "eye_sapphire", "name": "Biru Safir", "hex": "#2563eb"},
        {"id": "eye_emerald", "name": "Hijau Zamrud", "hex": "#059669"},
        {"id": "eye_amber", "name": "Kuning Amber", "hex": "#d97706"},
        {"id": "eye_ruby", "name": "Merah Delima", "hex": "#dc2626"},
        {"id": "eye_amethyst", "name": "Ungu Ametis", "hex": "#7c3aed"},
        {"id": "eye_obsidian", "name": "Hitam Pekat", "hex": "#0f172a"}
    ],
    "face_shapes": [
        {"id": "shape_oval", "name": "Oval Harmonis"},
        {"id": "shape_angular", "name": "Tirus Tegas"},
        {"id": "shape_round", "name": "Bulat Ramah"},
        {"id": "shape_chiseled", "name": "Ksatria Rahang Kokoh"}
    ],
    "facial_markings": [
        {"id": "none", "name": "Tanpa Tanda"},
        {"id": "freckles", "name": "Bintik Matahari (Freckles)"},
        {"id": "scar_cheek", "name": "Bekas Luka Pipih (Veteran)"},
        {"id": "mystic_rune", "name": "Rune Magis Pelindung"},
        {"id": "battle_paint", "name": "Cat Perang Rimba"}
    ],
    "body_builds": [
        {"id": "slender", "name": "Ramping Lincah"},
        {"id": "balanced", "name": "Proporsional Seimbang"},
        {"id": "muscular", "name": "Kekar Berotot"},
        {"id": "petite", "name": "Mungil Gesit"}
    ],
    "appendages": {
        "ears": [
            {"id": "ears_human_round", "name": "Telinga Manusia Bulat"},
            {"id": "ears_elven_long", "name": "Telinga Peri Runcing Panjang"},
            {"id": "ears_beast_fluffy", "name": "Telinga Satwa Berbulu Halus"},
            {"id": "ears_fin_aquatic", "name": "Sirip Telinga Samudra Mutiara"}
        ],
        "horns": [
            {"id": "none", "name": "Tanpa Tanduk"},
            {"id": "horns_draconic", "name": "Tanduk Naga Gagah"},
            {"id": "horns_curled", "name": "Tanduk Melingkar Tanduk Domba"},
            {"id": "horns_crystal", "name": "Tanduk Kristal Aether"}
        ],
        "wings": [
            {"id": "none", "name": "Tanpa Sayap"},
            {"id": "wings_fairy_glimmer", "name": "Sayap Peri Berpendar"},
            {"id": "wings_dragon_leather", "name": "Sayap Naga Membran"},
            {"id": "wings_sylph_feather", "name": "Sayap Bulu Angin"}
        ],
        "tails": [
            {"id": "none", "name": "Tanpa Ekor"},
            {"id": "tail_beast_fluffy", "name": "Ekor Rubah Rimba Lebat"},
            {"id": "tail_dragon_scaled", "name": "Ekor Naga Bersisik Baja"},
            {"id": "tail_fish_aquatic", "name": "Ekor Ikan Samudra"}
        ]
    },
    "wardrobe": {
        "headwear": [
            {"id": "hat_straw", "name": "Topi Jerami Petani Tradisional", "icon": "👒"},
            {"id": "hat_beret_merchant", "name": "Baret Bulu Saudagar", "icon": "🧢"},
            {"id": "helm_iron", "name": "Helm Pelindung Besi", "icon": "🪖"},
            {"id": "crown_laurel", "name": "Mahkota Daun Emas", "icon": "👑"},
            {"id": "none", "name": "Tanpa Penutup Kepala", "icon": "❌"}
        ],
        "tops": [
            {"id": "tunic_red_classic", "name": "Kemeja Merah Petualang", "icon": "👕", "hex": "#dc2626"},
            {"id": "armor_iron_mail", "name": "Baju Zirah Rantai Besi", "icon": "🛡️", "hex": "#64748b"},
            {"id": "robe_velvet_royal", "name": "Jubah Beludru Bangsawan", "icon": "🧥", "hex": "#831843"},
            {"id": "coat_engineer_cyan", "name": "Jas Praktik Insinyur Aether", "icon": "🥼", "hex": "#0891b2"},
            {"id": "tunic_emerald_druid", "name": "Tunik Hijau Pelindung Rimba", "icon": "🌿", "hex": "#15803d"}
        ],
        "bottoms": [
            {"id": "pants_blue_overalls", "name": "Celana Kodok Denim Biru", "hex": "#1e3a8a"},
            {"id": "pants_hardy_leather", "name": "Celana Kulit Tempa Rowan", "hex": "#78350f"},
            {"id": "trousers_silk_gold", "name": "Celana Sutra Bergaris Emas", "hex": "#ca8a04"},
            {"id": "skirt_pleated_green", "name": "Rok Lipit Tenun Hijau", "hex": "#166534"}
        ],
        "footwear": [
            {"id": "boots_leather_work", "name": "Sepatu Bot Kulit Kerja", "hex": "#451a03"},
            {"id": "boots_iron_greaves", "name": "Sepatu Pelindung Logam", "hex": "#475569"},
            {"id": "sandals_elven_woven", "name": "Sandal Anyaman Peri", "hex": "#b45309"}
        ],
        "back_items": [
            {"id": "backpack_leather", "name": "Ransel Kulit Penjelajah", "icon": "🎒"},
            {"id": "cape_crimson_knight", "name": "Mantel Merah Ksatria", "icon": "🧣"},
            {"id": "none", "name": "Tanpa Aksesori Punggung", "icon": "❌"}
        ]
    }
}

# ==================== LANDSCAPE BRUSHES CATALOG ====================
LANDSCAPE_BRUSHES = [
    {"id": "brush_grass", "name": "Padang Rumput Hijau (Grassland)", "icon": "🌱", "tile_type": "grass", "color": "#2d5a27", "desc": "Rumput hijau subur khas pedesaan Aetherwyn."},
    {"id": "brush_sand", "name": "Pasir Gurun & Oasis (Sand Dune)", "icon": "🏜️", "tile_type": "sand", "color": "#d97706", "desc": "Lahan berpasir halus cocok untuk tanaman kurma dan kaktus."},
    {"id": "brush_snow", "name": "Tundra Salju Putih (Snowland)", "icon": "❄️", "tile_type": "snow", "color": "#e2e8f0", "desc": "Lapisan salju abadi pegunungan Frostpeak, tempat frostberry tumbuh subur."},
    {"id": "brush_marsh", "name": "Rawa Lahan Gambut (Swampland)", "icon": "🌾", "tile_type": "marsh", "color": "#3f3f46", "desc": "Tanah gambut lembap kaya mineral rawa dan jamur ajaib."},
    {"id": "brush_stone", "name": "Jalan Batu Paving (Cobblestone)", "icon": "🧱", "tile_type": "stone_path", "color": "#64748b", "desc": "Jalan setapak batu rapi untuk mempercepat langkah kaki dan traktor."},
    {"id": "brush_volcanic", "name": "Batuan Basal Vulkanik (Volcanic)", "icon": "🌋", "tile_type": "volcanic", "color": "#1c1917", "desc": "Abu vulkanik kaya fosfor dari kawah naga Cinderspire."},
    {"id": "brush_water_shallow", "name": "Kanal Air Dangkal (Shallow Water)", "icon": "💧", "tile_type": "water_shallow", "color": "#0284c7", "desc": "Saluran air irigasi untuk mengairi tanah bercocok tanam."},
    {"id": "brush_water_deep", "name": "Danau Kristal Biru (Deep Water)", "icon": "🌊", "tile_type": "water_deep", "color": "#075985", "desc": "Danau dalam yang kaya ikan langka dan pantulan langit."}
]

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

                # Tree placements on farm perimeter
                tree_type = None
                tree_stage = 0
                tree_hp = 3
                if (x, y) == (1, 1):
                    tree_type, tree_stage = "oak", 2
                elif (x, y) == (4, 1):
                    tree_type, tree_stage = "pine", 2
                elif (x, y) == (1, 5):
                    tree_type, tree_stage = "cherry", 2
                elif (x, y) == (14, 8):
                    tree_type, tree_stage = "birch", 2
                elif (x, y) == (14, 14):
                    tree_type, tree_stage = "lumina", 2
                elif (x, y) == (1, 14):
                    tree_type, tree_stage = "willow", 2
                elif (x, y) == (5, 1):
                    tree_type, tree_stage = "golden_apple", 2
                elif (x, y) == (14, 1):
                    tree_type, tree_stage = "ironbark", 2

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
                    tile_type = "watered"
                    crop = {"crop_id": "crop_beetroot", "stage": 4, "max_stage": 4, "days_grown": 4, "watered_today": True}
                elif (x, y) == (9, 7):
                    tile_type = "watered"
                    crop = {"crop_id": "crop_wheat", "stage": 4, "max_stage": 4, "days_grown": 4, "watered_today": True}
                elif (x, y) == (9, 8):
                    tile_type = "watered"
                    crop = {"crop_id": "crop_golden_pumpkin", "stage": 3, "max_stage": 4, "days_grown": 5, "watered_today": True}

                row.append({
                    "x": x,
                    "y": y,
                    "tile_type": tile_type,
                    "crop": crop,
                    "structure_type": structure,
                    "tree_type": tree_type,
                    "tree_stage": tree_stage,
                    "tree_hp": tree_hp,
                    "fertilizer_type": None,
                    "water_piped": False
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
                {"item_id": "seed_beetroot", "count": 8},
                {"item_id": "seed_wheat", "count": 10},
                {"item_id": "item_fertilizer_organic", "count": 6},
                {"item_id": "sapling_cherry", "count": 2},
                {"item_id": "sapling_lumina", "count": 1},
                {"item_id": "crop_parsnip", "count": 2},
                {"item_id": "crop_beetroot", "count": 4},
                {"item_id": "mat_wood", "count": 24},
                {"item_id": "mat_stone", "count": 16},
                {"item_id": "tech_sprinkler_basic", "count": 2},
                {"item_id": "fuel_bio_aether", "count": 3},
                None, None, None, None, None, None, None
            ],
            "equipped_index": 0,
            "tractor": {
                "owned": True,
                "mounted": False,
                "x": 6 * 40,
                "y": 5 * 40,
                "dir": "down",
                "attachment": "tiller",  # tiller, sprayer, mower
                "fuel": 100,
                "max_fuel": 100,
                "speed_boost": 1.75
            },
            "admin_role": "super_admin",
            "equipped_title": "Pionir Lembah Evergreen",
            "prestige_points": 5,
            "spent_prestige_points": 0,
            "prestige_rank": 1,
            "prestige_upgrades": [],
            "encyclopedia_discoveries": {
                "crop_wheat": {"discovered_at": datetime.datetime.utcnow().isoformat(), "count": 4},
                "crop_parsnip": {"discovered_at": datetime.datetime.utcnow().isoformat(), "count": 6},
                "flw_wild_daisy": {"discovered_at": datetime.datetime.utcnow().isoformat(), "count": 2},
                "tree_ancient_oak": {"discovered_at": datetime.datetime.utcnow().isoformat(), "count": 5},
                "biome_evergreen_valley": {"discovered_at": datetime.datetime.utcnow().isoformat(), "count": 1}
            },
            "claimed_encyclopedia_milestones": {},
            "privacy_settings": {
                "public_profile": True,
                "show_net_worth": True,
                "show_guild": True
            }
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
                "affection_level": 3,
                "friendship_points": 350,  # 350/1000 pts (Lv 3)
                "max_affection_level": 10,
                "talked_today": False,
                "favorite_gifts": ["crop_strawberry", "crop_moonberry", "crop_beetroot"],
                "unlocked_perks": ["Herbal Healing +10%", "Daily Forest Vitality Tea"],
                "dialogue": "Selamat pagi, pengelana! Udara musim semi hari ini membawa aroma segar pucuk tanaman herbal dan bit merah."
            },
            {
                "id": "npc_rowan",
                "name": "Rowan",
                "title": "Pandai Besi Kerajaan",
                "location": "Bengkel Tempa Rowan",
                "affection_level": 2,
                "friendship_points": 240,  # 240/1000 pts (Lv 2)
                "max_affection_level": 10,
                "talked_today": False,
                "favorite_gifts": ["mat_iron_ore", "mat_copper_ore", "crop_beetroot"],
                "unlocked_perks": ["Mining Damage +5%", "Anvil Repair Discount"],
                "dialogue": "Bawakan aku lebih banyak bijih besi dan bit merah bergizi tinggi untuk stamina perapian tempa."
            },
            {
                "id": "npc_nessa",
                "name": "Nessa",
                "title": "Insinyur Mesin & Penemu",
                "location": "Laboratorium Riset Aether",
                "affection_level": 2,
                "friendship_points": 260,  # 260/1000 pts (Lv 2)
                "max_affection_level": 10,
                "talked_today": False,
                "favorite_gifts": ["mat_aether_crystal", "mat_gold_ore", "tech_sprinkler_basic"],
                "unlocked_perks": ["Sprinkler Range +1", "Aether Energy Output +10%"],
                "dialogue": "Kristal Aether ini bukan sekadar batu permata biasa. Getarannya sanggup menyalakan lampu tanpa setetes pun minyak!"
            },
            {
                "id": "npc_mira",
                "name": "Mira",
                "title": "Pedagang Umum & Pasar",
                "location": "Toserba Greenvale",
                "affection_level": 3,
                "friendship_points": 380,  # 380/1000 pts (Lv 3)
                "max_affection_level": 10,
                "talked_today": False,
                "favorite_gifts": ["crop_parsnip", "crop_potato", "crop_beetroot"],
                "unlocked_perks": ["Selling Price +5%", "Toserba Shop Discount 10%"],
                "dialogue": "Sayuran berkualitas tinggi seperti bit merah dan stroberi selalu kubeli dengan harga bersaing. Jangan ragu mengisi kotak pengirimanmu!"
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

        # Initialize V4 Ultimate Expansion Systems
        ProgressionEngine.ensure_progression_state(initial_player)
        EquipmentEngine.initialize_equipment(initial_player)
        MountsEngine.initialize_mounts(initial_player)
        MiningEngine.initialize_mining(initial_player)
        FishingEngine.initialize_fishing(initial_player)
        PetsEngine.initialize_pets(initial_player)
        AutomationEngine.initialize_automation(initial_player)
        EventsEngine.initialize_events(initial_world, initial_player)
        JournalEngine.initialize_journal(initial_player)

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
            active_npc_quests=[
                {"id": "quest_elara_beetroots", "npc_id": "npc_elara", "accepted": True, "progress": 4, "target": 5, "completed": False},
                {"id": "quest_rowan_beetroots", "npc_id": "npc_rowan", "accepted": True, "progress": 4, "target": 5, "completed": False},
                {"id": "quest_mira_friendship", "npc_id": "npc_mira", "accepted": True, "progress": 3, "target": 5, "completed": False}
            ],
            completed_npc_quests=[],
            storyline_unlocked=["chap_prologue", "chap_01"],
            shipping_bin=[],
            version="6.0.0",
            checksum="genesis_verified",
            civilization={
                "current_era": "medieval",
                "prosperity_score": 450,
                "population_count": 38,
                "layers": {
                    "population": {"score": 82, "label": "Stabil & Bahagia", "metric": "38 Jiwa"},
                    "economy": {"score": 75, "label": "Perdagangan Lancar", "metric": "Kas Pasar 4,500 G"},
                    "infrastructure": {"score": 68, "label": "Jalan Setapak Baik", "metric": "Cakupan Air 70%"},
                    "social": {"score": 88, "label": "Gotong Royong Guyub", "metric": "Keamanan 98%"},
                    "governance": {"score": 80, "label": "Kepemimpinan Stabil", "metric": "Pajak 5%"},
                    "environment": {"score": 92, "label": "Tanah & Hutan Subur", "metric": "Kualitas Udara 100%"},
                    "culture": {"score": 78, "label": "Tradisi Leluhur Hidup", "metric": "Festival Siap"}
                },
                "businesses": [
                    {"id": "biz_bakery", "name": "Toko Roti & Pastri Cedric", "owner": "Cedric", "revenue": 160, "status": "Aktif"},
                    {"id": "biz_blacksmith", "name": "Bengkel Tempa Rowan", "owner": "Rowan", "revenue": 240, "status": "Aktif"},
                    {"id": "biz_herbalist", "name": "Sanggar Botani Elara", "owner": "Elara", "revenue": 180, "status": "Aktif"},
                    {"id": "biz_engineer", "name": "Laboratorium Riset Nessa", "owner": "Nessa", "revenue": 290, "status": "Aktif"}
                ]
            },
            market={
                "commodities": {
                    "wood": {"name": "Kayu Rimba", "icon": "🪵", "base_price": 6, "min_price": 3, "max_price": 18, "current_price": 6, "supply": 140, "demand": 160},
                    "stone": {"name": "Batu Gunung", "icon": "🪨", "base_price": 5, "min_price": 2, "max_price": 15, "current_price": 5, "supply": 180, "demand": 170},
                    "wheat": {"name": "Gandum Emas", "icon": "🌾", "base_price": 8, "min_price": 4, "max_price": 22, "current_price": 9, "supply": 90, "demand": 150},
                    "parsnip": {"name": "Wortel Parsnip", "icon": "🥕", "base_price": 12, "min_price": 6, "max_price": 30, "current_price": 12, "supply": 70, "demand": 110},
                    "strawberry": {"name": "Stroberi Manis", "icon": "🍓", "base_price": 26, "min_price": 14, "max_price": 65, "current_price": 28, "supply": 40, "demand": 95},
                    "iron_ore": {"name": "Bijih Besi Tempa", "icon": "⛏️", "base_price": 22, "min_price": 12, "max_price": 55, "current_price": 24, "supply": 35, "demand": 80},
                    "bread": {"name": "Roti Gandum Hangat", "icon": "🍞", "base_price": 16, "min_price": 8, "max_price": 38, "current_price": 16, "supply": 50, "demand": 85},
                    "fish": {"name": "Ikan Danau Aether", "icon": "🐟", "base_price": 15, "min_price": 8, "max_price": 40, "current_price": 15, "supply": 45, "demand": 70}
                }
            }
        )
        self.save_slots[1] = default_save

    def get_save(self, slot_id: int) -> Optional[GameSave]:
        save = self.save_slots.get(slot_id)
        if save:
            if not getattr(save, "civilization", None):
                save.civilization = {
                    "current_era": "medieval",
                    "prosperity_score": 450,
                    "population_count": 38,
                    "layers": {
                        "population": {"score": 82, "label": "Stabil & Bahagia", "metric": "38 Jiwa"},
                        "economy": {"score": 75, "label": "Perdagangan Lancar", "metric": "Kas Pasar 4,500 G"},
                        "infrastructure": {"score": 68, "label": "Jalan Setapak Baik", "metric": "Cakupan Air 70%"},
                        "social": {"score": 88, "label": "Gotong Royong Guyub", "metric": "Keamanan 98%"},
                        "governance": {"score": 80, "label": "Kepemimpinan Stabil", "metric": "Pajak 5%"},
                        "environment": {"score": 92, "label": "Tanah & Hutan Subur", "metric": "Kualitas Udara 100%"},
                        "culture": {"score": 78, "label": "Tradisi Leluhur Hidup", "metric": "Festival Siap"}
                    },
                    "businesses": [
                        {"id": "biz_bakery", "name": "Toko Roti & Pastri Cedric", "owner": "Cedric", "revenue": 160, "status": "Aktif"},
                        {"id": "biz_blacksmith", "name": "Bengkel Tempa Rowan", "owner": "Rowan", "revenue": 240, "status": "Aktif"},
                        {"id": "biz_herbalist", "name": "Sanggar Botani Elara", "owner": "Elara", "revenue": 180, "status": "Aktif"},
                        {"id": "biz_engineer", "name": "Laboratorium Riset Nessa", "owner": "Nessa", "revenue": 290, "status": "Aktif"}
                    ]
                }
            if not getattr(save, "market", None):
                save.market = {
                    "commodities": {
                        "wood": {"name": "Kayu Rimba", "icon": "🪵", "base_price": 6, "min_price": 3, "max_price": 18, "current_price": 6, "supply": 140, "demand": 160},
                        "stone": {"name": "Batu Gunung", "icon": "🪨", "base_price": 5, "min_price": 2, "max_price": 15, "current_price": 5, "supply": 180, "demand": 170},
                        "wheat": {"name": "Gandum Emas", "icon": "🌾", "base_price": 8, "min_price": 4, "max_price": 22, "current_price": 9, "supply": 90, "demand": 150},
                        "parsnip": {"name": "Wortel Parsnip", "icon": "🥕", "base_price": 12, "min_price": 6, "max_price": 30, "current_price": 12, "supply": 70, "demand": 110},
                        "strawberry": {"name": "Stroberi Manis", "icon": "🍓", "base_price": 26, "min_price": 14, "max_price": 65, "current_price": 28, "supply": 40, "demand": 95},
                        "iron_ore": {"name": "Bijih Besi Tempa", "icon": "⛏️", "base_price": 22, "min_price": 12, "max_price": 55, "current_price": 24, "supply": 35, "demand": 80},
                        "bread": {"name": "Roti Gandum Hangat", "icon": "🍞", "base_price": 16, "min_price": 8, "max_price": 38, "current_price": 16, "supply": 50, "demand": 85},
                        "fish": {"name": "Ikan Danau Aether", "icon": "🐟", "base_price": 15, "min_price": 8, "max_price": 40, "current_price": 15, "supply": 45, "demand": 70}
                    }
                }
            if "tractor" not in save.player or not save.player.get("tractor"):
                save.player["tractor"] = {
                    "owned": True,
                    "mounted": False,
                    "x": 11 * 40,
                    "y": 8 * 40,
                    "dir": "down",
                    "attachment": "tiller",
                    "fuel": 100,
                    "max_fuel": 100,
                    "speed_boost": 1.75
                }
            if "character_profile" not in save.player or not save.player.get("character_profile"):
                save.player["character_profile"] = {
                    "race_id": "race_human",
                    "personality_id": "pers_brave",
                    "background_id": "bg_adventurer",
                    "skin_tone": "tone_warm_fair",
                    "face_shape": "shape_oval",
                    "hair_style": "adventurer",
                    "hair_color": "#b45309",
                    "hair_highlight": "#fde047",
                    "eye_color": "#2563eb",
                    "facial_marking": "none",
                    "body_build": "balanced",
                    "ears": "ears_human_round",
                    "horns": "none",
                    "wings": "none",
                    "tail": "none"
                }
            if "wardrobe" not in save.player or not save.player.get("wardrobe"):
                save.player["wardrobe"] = {
                    "headwear": "hat_straw",
                    "top": "tunic_red_classic",
                    "bottom": "pants_blue_overalls",
                    "footwear": "boots_leather_work",
                    "back_item": "backpack_leather",
                    "outfit_presets": {
                        "work": {"top": "tunic_red_classic", "bottom": "pants_blue_overalls", "headwear": "hat_straw"},
                        "adventure": {"top": "armor_iron_mail", "bottom": "pants_hardy_leather", "headwear": "helm_iron"},
                        "formal": {"top": "robe_velvet_royal", "bottom": "trousers_silk_gold", "headwear": "crown_laurel"},
                        "sleepwear": {"top": "shirt_cotton_white", "bottom": "pants_soft_linen", "headwear": "none"}
                    }
                }
            # Ensure V4 Ultimate Expansion Systems in loaded save
            ProgressionEngine.ensure_progression_state(save.player)
            EquipmentEngine.initialize_equipment(save.player)
            MountsEngine.initialize_mounts(save.player)
            MiningEngine.initialize_mining(save.player)
            FishingEngine.initialize_fishing(save.player)
            PetsEngine.initialize_pets(save.player)
            AutomationEngine.initialize_automation(save.player)
            EventsEngine.initialize_events(save.world, save.player)
            JournalEngine.initialize_journal(save.player)

            # Ensure V6 Expansion Systems in loaded save
            EncyclopediaEngine.ensure_encyclopedia_state(save.player)
            if "admin_role" not in save.player:
                save.player["admin_role"] = "super_admin"
            if "equipped_title" not in save.player:
                save.player["equipped_title"] = "Pionir Lembah Evergreen"
            if "privacy_settings" not in save.player:
                save.player["privacy_settings"] = {"public_profile": True, "show_net_worth": True, "show_guild": True}

        return save

    def update_character_profile(self, slot_id: int, profile: Dict[str, Any], wardrobe: Optional[Dict[str, Any]] = None) -> GameSave:
        save = self.get_save(slot_id)
        if not save:
            self._init_default_save()
            save = self.save_slots[1]
        
        save.player["character_profile"] = {**save.player.get("character_profile", {}), **profile}
        if wardrobe:
            save.player["wardrobe"] = {**save.player.get("wardrobe", {}), **wardrobe}
        
        # Sync race perks to player
        race_id = profile.get("race_id")
        matching_race = next((r for r in RACES_CATALOG if r["id"] == race_id), None)
        if matching_race:
            save.player["race_perk"] = matching_race["passive_perk"]
            save.player["race_name"] = matching_race["name"]
        
        return save

    def save_game(self, slot_id: int, payload: Dict[str, Any]) -> GameSave:
        # Checksum validation
        raw_json = json.dumps(payload, sort_keys=True, default=str).encode('utf-8')
        calc_checksum = hashlib.sha256(raw_json).hexdigest()

        save_obj = GameSave(
            slot_id=slot_id,
            save_name=payload.get("save_name", f"Slot {slot_id}"),
            saved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            version="4.0.0",
            checksum=calc_checksum,
            player=payload["player"],
            world=payload["world"],
            farm_grid=payload["farm_grid"],
            npcs=payload["npcs"],
            tech_tree=payload["tech_tree"],
            active_quests=payload.get("active_quests", []),
            completed_quests=payload.get("completed_quests", []),
            active_npc_quests=payload.get("active_npc_quests", []),
            completed_npc_quests=payload.get("completed_npc_quests", []),
            storyline_unlocked=payload.get("storyline_unlocked", ["chap_prologue"]),
            shipping_bin=payload.get("shipping_bin", []),
            civilization=payload.get("civilization", self.save_slots.get(slot_id, self.save_slots.get(1)).civilization if self.save_slots.get(1) else None),
            market=payload.get("market", self.save_slots.get(slot_id, self.save_slots.get(1)).market if self.save_slots.get(1) else None),
            living_npcs=payload.get("living_npcs", None)
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
    },
    {
        "result_item_id": "tech_irrigation_pipe",
        "result_count": 3,
        "name": "Pipa Irigasi Aether Bawah Tanah",
        "category": "Technology",
        "materials": [{"item_id": "mat_copper_ore", "count": 2}, {"item_id": "mat_stone", "count": 4}],
        "unlocked_by_era": 1
    },
    {
        "result_item_id": "tech_hydroponic_basin",
        "result_count": 1,
        "name": "Bak Hidroponik Otomatis",
        "category": "Technology",
        "materials": [{"item_id": "mat_iron_ore", "count": 4}, {"item_id": "mat_aether_crystal", "count": 1}, {"item_id": "crop_parsnip", "count": 3}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_compost_bin",
        "result_count": 1,
        "name": "Bak Kompos Bio-Organik",
        "category": "Technology",
        "materials": [{"item_id": "mat_wood", "count": 12}, {"item_id": "mat_stone", "count": 8}],
        "unlocked_by_era": 1
    },
    {
        "result_item_id": "item_fertilizer_organic",
        "result_count": 4,
        "name": "Pupuk Kompos Bio-Organik",
        "category": "Farming",
        "materials": [{"item_id": "mat_tree_sap", "count": 2}, {"item_id": "mat_stone", "count": 2}],
        "unlocked_by_era": 1
    },
    {
        "result_item_id": "item_fertilizer_speed",
        "result_count": 2,
        "name": "Eliksir Percepat Tumbuh Aether",
        "category": "Farming",
        "materials": [{"item_id": "mat_mystic_sap", "count": 1}, {"item_id": "mat_aether_crystal", "count": 1}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_tractor_tiller",
        "result_count": 1,
        "name": "Mata Bajak Tiller Traktor",
        "category": "Vehicle",
        "materials": [{"item_id": "mat_iron_ore", "count": 6}, {"item_id": "mat_wood", "count": 10}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_tractor_sprayer",
        "result_count": 1,
        "name": "Tangki Semprot Air Traktor",
        "category": "Vehicle",
        "materials": [{"item_id": "mat_copper_ore", "count": 5}, {"item_id": "mat_iron_ore", "count": 4}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "tech_tractor_mower",
        "result_count": 1,
        "name": "Pisau Pemanen Otomatis Traktor",
        "category": "Vehicle",
        "materials": [{"item_id": "mat_iron_ore", "count": 8}, {"item_id": "mat_aether_crystal", "count": 2}],
        "unlocked_by_era": 3
    },
    {
        "result_item_id": "fuel_bio_aether",
        "result_count": 2,
        "name": "Tabung Bio-Aether Traktor",
        "category": "Vehicle",
        "materials": [{"item_id": "mat_resin", "count": 2}, {"item_id": "mat_aether_crystal", "count": 1}],
        "unlocked_by_era": 2
    },
    {
        "result_item_id": "sapling_cherry",
        "result_count": 1,
        "name": "Sapling Pohon Sakura Harum",
        "category": "Nature",
        "materials": [{"item_id": "mat_wood", "count": 5}, {"item_id": "mat_tree_sap", "count": 2}],
        "unlocked_by_era": 1
    },
    {
        "result_item_id": "sapling_lumina",
        "result_count": 1,
        "name": "Sapling Pohon Lumina Roh",
        "category": "Nature",
        "materials": [{"item_id": "mat_aether_crystal", "count": 2}, {"item_id": "mat_mystic_sap", "count": 2}],
        "unlocked_by_era": 2
    }
]

# Blueprint Structures Catalog (Interactive Construction & CAD Overlay)
BLUEPRINT_CATALOG = [
    {
        "id": "struct_sprinkler_basic",
        "name": "Crystal Sprinkler Mk.I",
        "category": "Irigasi",
        "icon": "💧",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 1,
        "description": "Menyiram 8 petak di sekelilingnya (3x3 area) secara otomatis setiap fajar.",
        "cost_gold": 150,
        "materials": [{"item_id": "mat_copper_ore", "count": 2}, {"item_id": "mat_wood", "count": 5}],
        "unlocked_era": 1
    },
    {
        "id": "struct_sprinkler_modern",
        "name": "Smart Aether Sprinkler Mk.II",
        "category": "Irigasi",
        "icon": "⚙️",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 2,
        "description": "Menyiram area luas 5x5 petak berkat nosel kabut bertenaga kristal.",
        "cost_gold": 450,
        "materials": [{"item_id": "mat_iron_ore", "count": 4}, {"item_id": "mat_aether_crystal", "count": 1}],
        "unlocked_era": 2
    },
    {
        "id": "struct_irrigation_pipe",
        "name": "Jalur Pipa Irigasi Aether",
        "category": "Irigasi",
        "icon": "🚰",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Pipa air bertekanan mengalirkan air kolam alami langsung ke petak tanaman.",
        "cost_gold": 40,
        "materials": [{"item_id": "mat_copper_ore", "count": 1}, {"item_id": "mat_stone", "count": 2}],
        "unlocked_era": 1
    },
    {
        "id": "struct_hydroponic_basin",
        "name": "Bak Hidroponik Otomatis",
        "category": "Pertanian Maju",
        "icon": "🌱",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Media tanam kaya nutrisi cairan aether. Tumbuh sepanjang tahun tanpa tergantung musim.",
        "cost_gold": 600,
        "materials": [{"item_id": "mat_iron_ore", "count": 4}, {"item_id": "mat_aether_crystal", "count": 2}],
        "unlocked_era": 2
    },
    {
        "id": "struct_auto_harvester",
        "name": "Menara Panen Otomatis",
        "category": "Otomasi",
        "icon": "🤖",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 2,
        "description": "Sensor kristal memetik tanaman matang otomatis saat fajar dan menyimpannya di peti.",
        "cost_gold": 1200,
        "materials": [{"item_id": "mat_gold_ore", "count": 3}, {"item_id": "mat_aether_crystal", "count": 3}],
        "unlocked_era": 3
    },
    {
        "id": "struct_compost_bin",
        "name": "Bak Kompos Bio-Organik",
        "category": "Pertanian Maju",
        "icon": "🍃",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Menghasilkan Pupuk Kompos Alami berkualitas tinggi setiap hari.",
        "cost_gold": 200,
        "materials": [{"item_id": "mat_wood", "count": 15}, {"item_id": "mat_stone", "count": 10}],
        "unlocked_era": 1
    },
    {
        "id": "struct_seed_extractor",
        "name": "Mesin Ekstraksi Benih",
        "category": "Otomasi",
        "icon": "🔬",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Memisahkan biji unggul dari hasil panen, menghasilkan 2-3 bibit berkualitas.",
        "cost_gold": 500,
        "materials": [{"item_id": "mat_iron_ore", "count": 4}, {"item_id": "mat_copper_ore", "count": 4}],
        "unlocked_era": 2
    },
    {
        "id": "struct_mana_pylon",
        "name": "Menara Pylon Daya Aether",
        "category": "Energi",
        "icon": "⚡",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 4,
        "description": "Memancarkan medan resonansi daya listrik nirkabel ke seluruh mesin pertanian.",
        "cost_gold": 800,
        "materials": [{"item_id": "mat_aether_crystal", "count": 4}, {"item_id": "mat_iron_ore", "count": 6}],
        "unlocked_era": 3
    },
    {
        "id": "struct_street_lamp",
        "name": "Lampu Kristal Jalanan",
        "category": "Dekorasi",
        "icon": "🏮",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 3,
        "description": "Menerangi malam hari secara otomatis dengan cahaya hangat menenangkan.",
        "cost_gold": 100,
        "materials": [{"item_id": "mat_wood", "count": 6}, {"item_id": "mat_copper_ore", "count": 1}],
        "unlocked_era": 1
    },
    {
        "id": "struct_storage_chest",
        "name": "Peti Kayu Kuat",
        "category": "Penyimpanan",
        "icon": "📦",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Peti penyimpanan aman untuk menyimpan cadangan hasil panen dan perkakas.",
        "cost_gold": 80,
        "materials": [{"item_id": "mat_wood", "count": 20}],
        "unlocked_era": 1
    },
    {
        "id": "struct_fence_wood",
        "name": "Pagar Kayu Paddock",
        "category": "Dekorasi",
        "icon": "🪵",
        "footprint": {"w": 1, "h": 1},
        "range_radius": 0,
        "description": "Pagar rapi untuk menandai batas petak tanaman dan kandang ternak.",
        "cost_gold": 15,
        "materials": [{"item_id": "mat_wood", "count": 2}],
        "unlocked_era": 1
    },
    {
        "id": "struct_tractor_garage",
        "name": "Garasi Traktor & Servis",
        "category": "Kendaraan",
        "icon": "🚜",
        "footprint": {"w": 2, "h": 2},
        "range_radius": 0,
        "description": "Tempat parkir, pengisian uap/bahan bakar, dan pergantian attachment traktor.",
        "cost_gold": 1500,
        "materials": [{"item_id": "mat_iron_ore", "count": 10}, {"item_id": "mat_stone", "count": 25}],
        "unlocked_era": 2
    }
]

ZONES_CATALOG = [
    {
        "id": "zone_farm",
        "name": "Aetherwyn Farm",
        "title_id": "Lahan Pertanian Aetherwyn",
        "description": "Lahan warisan subur dengan rumah petani, petak bercocok tanam, kolam air, dan kandang ternak.",
        "icon": "🏡",
        "features": ["Pondok Petani", "Petak Bercocok Tanam", "Kotak Jual", "Kolam Ikan", "Kandang Domba & Ayam"]
    },
    {
        "id": "zone_village",
        "name": "Greenvale Village Square",
        "title_id": "Alun-Alun Desa Greenvale",
        "description": "Jantung perdagangan desa dengan air mancur marmer, Toserba Mira, bengkel tempa Rowan, dan papan pengumuman.",
        "icon": "🏘️",
        "features": ["Air Mancur Desa", "Toserba Mira", "Bengkel Tempa Rowan", "Papan Pengumuman"]
    },
    {
        "id": "zone_woods",
        "name": "Whispering Woods & Sanctuary",
        "title_id": "Hutan Berbisik & Suaka Herbal",
        "description": "Hutan pinus kuno tempat tinggal Tabib Elara, dipenuhi tanaman herba liar, jamur bercahaya, dan pohon purba Aether.",
        "icon": "🌲",
        "features": ["Apotek Tabib Elara", "Tanaman Herbal Liar", "Pohon Purba Aether", "Mata Air Suci"]
    },
    {
        "id": "zone_lab",
        "name": "Aether Tech & Power Station",
        "title_id": "Laboratorium Riset Aether",
        "description": "Fasilitas riset modern penemu Nessa dengan generator kristal raksasa, jaringan pipa uap, dan arena automaton.",
        "icon": "⚡",
        "features": ["Generator Daya Kristal", "Bengkel Perakitan Automaton", "Stasiun Lori Rel"]
    },
    {
        "id": "zone_mines",
        "name": "The Forgotten Mines",
        "title_id": "Gua Tambang Terlupakan",
        "description": "Gua bawah tanah bertingkat penuh monster slime, kristal kelelawar, serta urat bijih tembaga, besi, dan emas.",
        "icon": "⛏️",
        "features": ["Tangga Bawah Tanah", "Urat Bijih Logam", "Monster Slime & Bat", "Peti Harta"]
    },
    {
        "id": "zone_lake",
        "name": "Starfall Lake & Fishing Docks",
        "title_id": "Danau Bintang & Dermaga Nelayan",
        "description": "Danau air tawar nan jernih dengan dermaga kayu panjang, perahu nelayan, dan habitat ikan langka.",
        "icon": "⛵",
        "features": ["Dermaga Pancing Air Dalam", "Ikan Langka Forel Rembulan", "Mercusuar Pantai"]
    },
    {
        "id": "zone_ruins",
        "name": "Sunken Aether Ruins",
        "title_id": "Reruntuhan Kuno Bawah Tanah",
        "description": "Sisa reruntuhan peradaban maju sebelum The Great Sundering dengan pilar marmer berukir sirkuit kristal.",
        "icon": "🏛️",
        "features": ["Pilar Berukir Glif Kuno", "Teka-teki Resonansi", "Peti Pusaka Kristal"]
    },
    {
        "id": "zone_summit",
        "name": "Highland Windmill & Summit",
        "title_id": "Puncak Gunung Kincir Angin",
        "description": "Dataran tinggi berangin sejuk dengan kincir angin raksasa, ladang gandum emas, dan panorama seluruh kerajaan.",
        "icon": "🌾",
        "features": ["Kincir Angin Gandum", "Pemandangan Lembah Aetherwyn", "Sarang Rajawali Langka"]
    }
]

TUTORIAL_QUESTS = [
    {
        "step": 1,
        "id": "tut_till",
        "title": "Cangkul Tanah Ladang",
        "description": "Gunakan Cangkul Besi Tempa (Slot [1]) lalu klik pada petak rumput di ladang.",
        "reward_gold": 60,
        "reward_items": [{"item_id": "seed_parsnip", "count": 5}],
        "completed": False
    },
    {
        "step": 2,
        "id": "tut_plant",
        "title": "Tanam Benih Parsnip",
        "description": "Pilih Benih Parsnip dan tanam di petak tanah yang telah dicangkul.",
        "reward_gold": 60,
        "reward_items": [],
        "completed": False
    },
    {
        "step": 3,
        "id": "tut_water",
        "title": "Siram Tanaman dengan Gembor",
        "description": "Pilih Gembor Tembaga (Slot [2]) dan siram tanamanmu agar tanah menjadi basah dan subur.",
        "reward_gold": 60,
        "reward_items": [],
        "completed": False
    },
    {
        "step": 4,
        "id": "tut_talk",
        "title": "Bicara dengan Tabib Elara",
        "description": "Dekati Tabib Elara yang sedang berjalan atau klik namanya di panel samping untuk mendengarkan Suara AI-nya.",
        "reward_gold": 100,
        "reward_items": [],
        "completed": False
    },
    {
        "step": 5,
        "id": "tut_fish",
        "title": "Memancing di Kolam Air",
        "description": "Dekati kolam air dan tekan [F] atau klik tombol Pancing untuk menangkap ikan.",
        "reward_gold": 120,
        "reward_items": [],
        "completed": False
    },
    {
        "step": 6,
        "id": "tut_dungeon",
        "title": "Jelajah Gua Tambang Terlupakan",
        "description": "Buka menu Gua [M], kalahkan monster slime dengan pedang, dan kumpulkan bijih logam.",
        "reward_gold": 150,
        "reward_items": [{"item_id": "mat_aether_crystal", "count": 2}],
        "completed": False
    },
    {
        "step": 7,
        "id": "tut_sleep",
        "title": "Jual Hasil Bumi & Tidur",
        "description": "Masukkan barang ke Kotak Pengiriman lalu tidurlah di Kasur Rumah [Z] untuk memulai hari baru.",
        "reward_gold": 250,
        "reward_items": [],
        "completed": False
    }
]

# ==================== NPC QUESTS CATALOG (18 EXTENSIVE QUESTS) ====================
NPC_QUESTS_CATALOG = [
    # ELARA'S HERBALIST & NATURE QUESTS
    {
        "id": "quest_elara_intro",
        "npc_id": "npc_elara",
        "npc_name": "Elara",
        "title": "Ramuan Herba Pembuka",
        "description": "Bawakan 3 Parsnip Segar ke Elara untuk meracik salep pemulih stamina petani pemula.",
        "type": "deliver_item",
        "target_item": "crop_parsnip",
        "target_count": 3,
        "reward_gold": 120,
        "reward_aether": 5,
        "reward_affection": 100,  # +1 Affection Level
        "required_affection_level": 0
    },
    {
        "id": "quest_elara_beetroots",
        "npc_id": "npc_elara",
        "npc_name": "Elara",
        "title": "Tonik Segar Bit Merah (5 Bit Merah)",
        "description": "Elara membutuhkan 5 Bit Merah segar untuk membuat tonik vitalitas penawar racun dan keletihan.",
        "type": "deliver_item",
        "target_item": "crop_beetroot",
        "target_count": 5,
        "reward_gold": 300,
        "reward_aether": 15,
        "reward_affection": 150,  # +1.5 Affection Levels
        "required_affection_level": 1
    },
    {
        "id": "quest_elara_moonberry",
        "npc_id": "npc_elara",
        "npc_name": "Elara",
        "title": "Flora Cahaya Rembulan",
        "description": "Bawakan 1 Moonberry Kristal langka yang bersinar di malam hari untuk ramuan eliksir suci.",
        "type": "deliver_item",
        "target_item": "crop_moonberry",
        "target_count": 1,
        "reward_gold": 450,
        "reward_aether": 25,
        "reward_affection": 200,  # +2.0 Affection Levels
        "required_affection_level": 3
    },
    {
        "id": "quest_elara_sanctuary",
        "npc_id": "npc_elara",
        "npc_name": "Elara",
        "title": "Pelindung Suaka Hutan Berbisik",
        "description": "Bawakan 12 Kayu Gelondongan untuk merestorasi pagar suaka tanaman obat purba di Whispering Woods.",
        "type": "deliver_item",
        "target_item": "mat_wood",
        "target_count": 12,
        "reward_gold": 350,
        "reward_aether": 20,
        "reward_affection": 200,
        "required_affection_level": 4
    },

    # ROWAN'S BLACKSMITH & ROYAL FORGE QUESTS
    {
        "id": "quest_rowan_intro",
        "npc_id": "npc_rowan",
        "npc_name": "Rowan",
        "title": "Bahan Peleburan Tembaga Pertama",
        "description": "Serahkan 4 Bijih Tembaga dari Forgotten Mines ke bengkel Rowan untuk menyalakan tanur.",
        "type": "deliver_item",
        "target_item": "mat_copper_ore",
        "target_count": 4,
        "reward_gold": 150,
        "reward_aether": 5,
        "reward_affection": 100,
        "required_affection_level": 0
    },
    {
        "id": "quest_rowan_beetroots",
        "npc_id": "npc_rowan",
        "npc_name": "Rowan",
        "title": "Stamina Pandai Besi (5 Bit Merah)",
        "description": "Rowan dan para magang butuh tenaga! Bawakan 5 Bit Merah segar untuk memulihkan stamina saat menempa di depan api tungku.",
        "type": "deliver_item",
        "target_item": "crop_beetroot",
        "target_count": 5,
        "reward_gold": 320,
        "reward_aether": 15,
        "reward_affection": 150,
        "required_affection_level": 1
    },
    {
        "id": "quest_rowan_iron",
        "npc_id": "npc_rowan",
        "npc_name": "Rowan",
        "title": "Pesanan Baja Tempa Kerajaan",
        "description": "Serahkan 5 Bijih Besi berkualitas tinggi untuk menempa perkakas kokoh tahan banting.",
        "type": "deliver_item",
        "target_item": "mat_iron_ore",
        "target_count": 5,
        "reward_gold": 400,
        "reward_aether": 20,
        "reward_affection": 200,
        "required_affection_level": 2
    },
    {
        "id": "quest_rowan_masterwork",
        "npc_id": "npc_rowan",
        "npc_name": "Rowan",
        "title": "Rahasia Paduan Kristal Aether",
        "description": "Bawakan 3 Kristal Aether Murni untuk eksperimen menempa bilah pedang kristal yang tidak akan pernah tumpul.",
        "type": "deliver_item",
        "target_item": "mat_aether_crystal",
        "target_count": 3,
        "reward_gold": 800,
        "reward_aether": 35,
        "reward_affection": 250,
        "required_affection_level": 5
    },

    # NESSA'S HIGH-TECH INVENTOR QUESTS
    {
        "id": "quest_nessa_intro",
        "npc_id": "npc_nessa",
        "npc_name": "Nessa",
        "title": "Konduksi Sederhana Penemu",
        "description": "Serahkan 3 Bijih Tembaga dan 5 Batu Kali ke laboratorium riset Nessa untuk merakit generator sirkuit.",
        "type": "deliver_item",
        "target_item": "mat_copper_ore",
        "target_count": 3,
        "reward_gold": 160,
        "reward_aether": 10,
        "reward_affection": 100,
        "required_affection_level": 0
    },
    {
        "id": "quest_nessa_battery",
        "npc_id": "npc_nessa",
        "npc_name": "Nessa",
        "title": "Baterai Prototip Sprinkler Cerdas",
        "description": "Bawakan 2 Kristal Aether Murni untuk menyalakan pompa getar sprinkler generasi kedua.",
        "type": "deliver_item",
        "target_item": "mat_aether_crystal",
        "target_count": 2,
        "reward_gold": 450,
        "reward_aether": 25,
        "reward_affection": 180,
        "required_affection_level": 2
    },
    {
        "id": "quest_nessa_gold",
        "npc_id": "npc_nessa",
        "npc_name": "Nessa",
        "title": "Konduktor Emas Berkecepatan Tinggi",
        "description": "Bawakan 2 Bijih Emas Murni dari kedalaman tambang untuk jalur sinyal automaton otonom.",
        "type": "deliver_item",
        "target_item": "mat_gold_ore",
        "target_count": 2,
        "reward_gold": 600,
        "reward_aether": 30,
        "reward_affection": 220,
        "required_affection_level": 4
    },
    {
        "id": "quest_nessa_core",
        "npc_id": "npc_nessa",
        "npc_name": "Nessa",
        "title": "Inti Abadi Peradaban Aether",
        "description": "Bawakan 5 Kristal Aether Murni untuk menghidupkan stasiun daya modern seluruh desa.",
        "type": "deliver_item",
        "target_item": "mat_aether_crystal",
        "target_count": 5,
        "reward_gold": 1200,
        "reward_aether": 60,
        "reward_affection": 280,
        "required_affection_level": 6
    },

    # MIRA'S MERCHANT & FELLOWSHIP QUESTS
    {
        "id": "quest_mira_intro",
        "npc_id": "npc_mira",
        "npc_name": "Mira",
        "title": "Pasokan Sayur Pasar Greenvale",
        "description": "Kirimkan 4 Kentang Aetherwyn ke toserba Mira untuk memenuhi pesanan kafilah pedagang.",
        "type": "deliver_item",
        "target_item": "crop_potato",
        "target_count": 4,
        "reward_gold": 220,
        "reward_aether": 5,
        "reward_affection": 100,
        "required_affection_level": 0
    },
    {
        "id": "quest_mira_beetroots",
        "npc_id": "npc_mira",
        "npc_name": "Mira",
        "title": "Festival Kuliner Bit Merah (5 Bit Merah)",
        "description": "Permintaan khusus saudagar ibukota! Kumpulkan 5 Bit Merah manis dan segar untuk pameran hasil bumi.",
        "type": "deliver_item",
        "target_item": "crop_beetroot",
        "target_count": 5,
        "reward_gold": 380,
        "reward_aether": 15,
        "reward_affection": 160,
        "required_affection_level": 1
    },
    {
        "id": "quest_mira_friendship",
        "npc_id": "npc_mira",
        "npc_name": "Mira",
        "title": "Having Friends with Us! (Harmoni Penduduk)",
        "description": "Perkuat persahabatan di desa! Selesaikan minimal 4 Quest Penduduk ATAU capai Affection Level 5 dengan salah satu warga desa!",
        "type": "affection_milestone",
        "target_affection_level": 5,
        "target_quests_completed": 4,
        "reward_gold": 800,
        "reward_aether": 50,
        "reward_affection": 250,  # Boosts ALL NPCs!
        "reward_item": "item_fellowship_medal",
        "required_affection_level": 2
    },
    {
        "id": "quest_mira_caravan",
        "npc_id": "npc_mira",
        "npc_name": "Mira",
        "title": "Ekspedisi Kafilah Dagang Emas",
        "description": "Buktikan kesuksesan pertanianmu dengan menghasilkan panen melimpah dan serahkan 1 Moonberry Kristal.",
        "type": "deliver_item",
        "target_item": "crop_moonberry",
        "target_count": 1,
        "reward_gold": 1000,
        "reward_aether": 40,
        "reward_affection": 250,
        "required_affection_level": 5
    },

    # GUILD & WORLD MILESTONES
    {
        "id": "quest_mines_slimes",
        "npc_id": "npc_rowan",
        "npc_name": "Rowan",
        "title": "Pembersih Monster Slime Tambang",
        "description": "Kalahkan minimal 5 monster slime di Forgotten Mines untuk mengamankan lorong pekerja tambang.",
        "type": "slimes_defeated",
        "target_count": 5,
        "reward_gold": 300,
        "reward_aether": 15,
        "reward_affection": 150,
        "required_affection_level": 0
    },
    {
        "id": "quest_legend_soulmate",
        "npc_id": "npc_elara",
        "npc_name": "Elara",
        "title": "Ikatan Abadi — Soulmate of Aetherwyn",
        "description": "Capai Tingkat Hubungan Maksimal (Affection Level 10) dengan salah satu warga Greenvale.",
        "type": "max_affection",
        "target_affection_level": 10,
        "reward_gold": 2500,
        "reward_aether": 100,
        "reward_affection": 0,
        "reward_item": "item_fellowship_medal",
        "required_affection_level": 6
    }
]

# ==================== STORYLINE & TRAILER CUTSCENES ====================
STORYLINE_CHAPTERS = [
    {
        "id": "chap_prologue",
        "chapter_number": 0,
        "title": "Trailer Sinematik: The Great Sundering & Warisan Aetherwyn",
        "subtitle": "Dari Runtuhnya Peradaban Kuno Menuju Fajar Baru",
        "unlock_desc": "Terbuka Sejak Awal",
        "unlocked": True,
        "bg_theme": "ruins_night",
        "scenes": [
            {
                "speaker": "Narator Sejarah",
                "text": "Dahulu kala, Kerajaan Aetherwyn adalah pusat peradaban paling makmur di benua ini. Kristal Aether mengalirkan daya murni ke kota-kota megah dan ladang subur tanpa batas...",
                "visual": "ancient_glory"
            },
            {
                "speaker": "Narator Sejarah",
                "text": "Namun prahara misterius 'The Great Sundering' mengguncang dunia. Bumi terbelah, menara-menara runtuh, dan teknologi peradaban lenyap tertelan kabut waktu.",
                "visual": "cataclysm_sundering"
            },
            {
                "speaker": "Pengelana Baru",
                "text": "Berabad-abad kemudian... Kamu mewarisi lahan pertanian terbengkalai ini. Dengan sebuah cangkul tua, tanah penuh ilalang, dan tekad baja untuk bangkit.",
                "visual": "arrival_farm"
            },
            {
                "speaker": "Suara Bisikan Aether",
                "text": "Bangunlah kembali warisan leluhur ini. Dari akar tradisional medieval, jalin persahabatan sejati, dan bawalah Aetherwyn menuju era keemasan baru!",
                "visual": "dawn_rising"
            }
        ]
    },
    {
        "id": "chap_01",
        "chapter_number": 1,
        "title": "Babak I: Akar Pertama Kehidupan (The Sacred Soil)",
        "subtitle": "Tunas Hijau di Tanah yang Bangkit",
        "unlock_desc": "Capai Affection Level 1 dengan Elara atau selesaikan Tutorial Bertani",
        "unlock_rule": {"type": "affection_or_tutorial", "npc_id": "npc_elara", "level": 1, "tut_step": 2},
        "bg_theme": "spring_farm",
        "scenes": [
            {
                "speaker": "Elara",
                "text": "Lihatlah ladang ini... Tanah yang sekian lama tertidur kini kembali bernapas dengan tunas hijau segar dan bit merah ranum!",
                "visual": "sprouts_garden"
            },
            {
                "speaker": "Elara",
                "text": "Pohon purba di Hutan Berbisik seakan berdengung merestui kedatanganmu. Selama kau merawat tanah ini dengan kasih, Aetherwyn tidak akan pernah layu lagi.",
                "visual": "sacred_tree"
            }
        ]
    },
    {
        "id": "chap_02",
        "chapter_number": 2,
        "title": "Babak II: Percikan Bara Abadi (Sparks of the Royal Forge)",
        "subtitle": "Kekuatan Tempa & Semangat Pantang Padam",
        "unlock_desc": "Selesaikan Quest 'Stamina Pandai Besi (5 Bit Merah)' atau Affection Level 3 dengan Rowan",
        "unlock_rule": {"type": "quest_or_affection", "quest_id": "quest_rowan_beetroots", "npc_id": "npc_rowan", "level": 3},
        "bg_theme": "forge_fire",
        "scenes": [
            {
                "speaker": "Rowan",
                "text": "Hahaha! Khasiat bit merah dan bijih besi pilihanmu memberi tenaga luar biasa pada tungku perapian bengkel tempa!",
                "visual": "furnace_blaze"
            },
            {
                "speaker": "Rowan",
                "text": "Dengar denting palu ini, anak muda! Dengan baja hasil tempaan kita, perkakasmu tidak akan pernah patah bahkan saat menembus batu terkeras di Gua Terlupakan!",
                "visual": "anvil_hammer"
            }
        ]
    },
    {
        "id": "chap_03",
        "chapter_number": 3,
        "title": "Babak III: Having Friends with Us! (Harmoni Jiwa Penduduk)",
        "subtitle": "Hangatnya Persahabatan di Bawah Langit Rembulan",
        "unlock_desc": "Selesaikan Quest 'Having Friends with Us!' ATAU capai Affection Level 5 dengan seorang warga",
        "unlock_rule": {"type": "affection_any", "level": 5, "quest_id": "quest_mira_friendship"},
        "bg_theme": "village_festival",
        "scenes": [
            {
                "speaker": "Mira",
                "text": "Lihatlah sekeliling kita! Alun-alun desa kembali bermandikan cahaya tawa dan kehangatan berkat kebaikan hatimu!",
                "visual": "town_square_cheer"
            },
            {
                "speaker": "Elara & Nessa",
                "text": "Dari tabib, pandai besi, hingga penemu... kita semua kini bukan lagi sekadar tetangga, melainkan keluarga sejati Aetherwyn!",
                "visual": "four_friends_toast"
            },
            {
                "speaker": "Rowan",
                "text": "Bersulang untuk sahabat terbaik kita! Bersama kita kuat, bersama kita melangkah ke masa depan!",
                "visual": "cheers_banquet"
            }
        ]
    },
    {
        "id": "chap_04",
        "chapter_number": 4,
        "title": "Babak IV: Gema Inti Kuno (Echoes in the Deep Mines)",
        "subtitle": "Getaran Resonansi di Perut Bumi",
        "unlock_desc": "Capai Affection Level 6 dengan Rowan/Nessa atau selesaikan 6 Quest Penduduk",
        "unlock_rule": {"type": "affection_or_quests", "level": 6, "quests_count": 6},
        "bg_theme": "crystal_cave",
        "scenes": [
            {
                "speaker": "Nessa",
                "text": "Frekuensi ini tidak salah lagi! Inti Kristal Purba di bawah Reruntuhan Kuno mulai bergetar selaras dengan energi ladang kita!",
                "visual": "crystal_core_awakening"
            },
            {
                "speaker": "Rowan",
                "text": "Monster-monster bayangan di kedalaman tambang mulai mundur. Cahaya Aether bangkit kembali menyinari kegelapan!",
                "visual": "ancient_light"
            }
        ]
    },
    {
        "id": "chap_05",
        "chapter_number": 5,
        "title": "Babak V: Fajar Modernitas (The Aether Dawn)",
        "subtitle": "Kelahiran Era Baru: Listrik & Otomasi Magis",
        "unlock_desc": "Buka Era 4 (Modern Fantasy) atau capai Affection Level 8 dengan Nessa/Mira",
        "unlock_rule": {"type": "era_or_affection", "era": 4, "level": 8},
        "bg_theme": "modern_skyline",
        "scenes": [
            {
                "speaker": "Nessa",
                "text": "Lampu LED kristal menyala di seluruh jalan desa! Sprinkler pintar dan automaton pemanen mulai bekerja tanpa lelah siang dan malam!",
                "visual": "electric_street"
            },
            {
                "speaker": "Mira",
                "text": "Kereta dagang modern tiba dari ibukota! Greenvale kini bukan lagi desa terpencil, melainkan pusat peradaban modern termaju di dunia!",
                "visual": "train_modern_city"
            }
        ]
    },
    {
        "id": "chap_06",
        "chapter_number": 6,
        "title": "Epilog: Legenda Evergreen (Eternal Fellowship)",
        "subtitle": "Warisan Abadi Sang Penjaga Lembah Aetherwyn",
        "unlock_desc": "Capai Affection Level 10 (Soulmate of Aetherwyn) dengan salah satu warga desa!",
        "unlock_rule": {"type": "affection_any", "level": 10},
        "bg_theme": "summit_sunrise",
        "scenes": [
            {
                "speaker": "Elara, Rowan, Nessa, Mira",
                "text": "Di puncak Highland Summit ini, di hadapan panorama matahari terbit, kami mendirikan monumen kehormatan abadi untukmu. Sahabat sejati kami selamanya!",
                "visual": "grand_monument_evergreen"
            },
            {
                "speaker": "Narator Evergreen",
                "text": "Dari akar tradisional abad pertengahan menuju puncak peradaban magis modern... Kisah pengelana Aetherwyn kini tertulis abadi dalam legenda Evergreen Chronicles.",
                "visual": "credits_sunset"
            }
        ]
    }
]

game_store = EvergreenGameEngine()
