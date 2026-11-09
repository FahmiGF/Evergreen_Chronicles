"""Civilization Engine, Dynamic Economy, and Living NPC Simulation for Evergreen Chronicles.
Implements the 7-layer simulation, Era progression, market supply/demand, and NPC Brain.
"""

import time
import math
import random
from typing import Dict, Any, List, Optional

# ==========================================
# 1. CIVILIZATION ERAS CATALOG
# ==========================================
CIVILIZATION_ERAS = {
    "medieval": {
        "id": "medieval",
        "name": "Era I — Kerajaan Abad Pertengahan",
        "description": "Pertanian tradisional, bengkel pandai besi, bangunan batu dan kayu, perkumpulan pengrajin guild.",
        "icon": "🏰",
        "order": 1,
        "req_prosperity": 0,
        "next_era": "industrial",
        "required_advance_costs": {
            "wood": 60,
            "stone": 45,
            "iron_ore": 20,
            "gold": 1200
        },
        "perks": [
            "🌾 Hasil panen gandum & sayur +15%",
            "🔨 Biaya perkakas dasar besi -20%",
            "🐴 Gerobak kayu pengangkut hasil tani aktif"
        ]
    },
    "industrial": {
        "id": "industrial",
        "name": "Era II — Revolusi Industri & Mesin Uap",
        "description": "Mesin traktor mekanis, saluran uap bertekanan, pabrik pengolahan, dan jaringan rel angkut.",
        "icon": "⚙️",
        "order": 2,
        "req_prosperity": 600,
        "next_era": "modern",
        "required_advance_costs": {
            "wood": 120,
            "stone": 100,
            "iron_ore": 80,
            "gold": 4500
        },
        "perks": [
            "🚜 Kecepatan traktor bertambah +50%",
            "📦 Kapasitas penyimpanan pasar 2x lipat",
            "💧 Jaringan pipa irigasi otomatis bertekanan"
        ]
    },
    "modern": {
        "id": "modern",
        "name": "Era III — Metropolis Modern & Elektrifikasi",
        "description": "Jaringan listrik terpadu, rumah kaca iklim terkontrol, stasiun ekspres, perkotaan tertata rapi.",
        "icon": "⚡",
        "order": 3,
        "req_prosperity": 1800,
        "next_era": "arcane",
        "required_advance_costs": {
            "stone": 150,
            "iron_ore": 120,
            "aether_shards": 40,
            "gold": 12000
        },
        "perks": [
            "🌱 Rumah kaca aktif menanam di semua musim",
            "📈 Nilai ekspor komoditas kota +25%",
            "💡 Lampu penerangan jalan otomatis bertenaga listrik"
        ]
    },
    "arcane": {
        "id": "arcane",
        "name": "Era IV — Peradaban Arkana & Kristal Aether",
        "description": "Otomasi kristal aether, arsitektur levitasi magis, teleportasi instan, dan keselarasan abadi semesta.",
        "icon": "🔮",
        "order": 4,
        "req_prosperity": 4000,
        "next_era": None,
        "required_advance_costs": {},
        "perks": [
            "✨ Regenerasi energi stamina petualang 2x lebih cepat",
            "🌀 Gerbang teleportasi antar-zona tanpa jeda",
            "💎 Seluruh panen menghasilkan butiran Aether Shards"
        ]
    }
}

# ==========================================
# 2. COMMODITIES & DYNAMIC MARKET CATALOG
# ==========================================
DEFAULT_MARKET_COMMODITIES = {
    "wood": {
        "name": "Kayu Rimba",
        "icon": "🪵",
        "base_price": 6,
        "min_price": 3,
        "max_price": 18,
        "supply": 140,
        "demand": 160
    },
    "stone": {
        "name": "Batu Gunung",
        "icon": "🪨",
        "base_price": 5,
        "min_price": 2,
        "max_price": 15,
        "supply": 180,
        "demand": 170
    },
    "wheat": {
        "name": "Gandum Emas",
        "icon": "🌾",
        "base_price": 8,
        "min_price": 4,
        "max_price": 22,
        "supply": 90,
        "demand": 150
    },
    "parsnip": {
        "name": "Wortel Parsnip",
        "icon": "🥕",
        "base_price": 12,
        "min_price": 6,
        "max_price": 30,
        "supply": 70,
        "demand": 110
    },
    "strawberry": {
        "name": "Stroberi Manis",
        "icon": "🍓",
        "base_price": 26,
        "min_price": 14,
        "max_price": 65,
        "supply": 40,
        "demand": 95
    },
    "iron_ore": {
        "name": "Bijih Besi Tempa",
        "icon": "⛏️",
        "base_price": 22,
        "min_price": 12,
        "max_price": 55,
        "supply": 35,
        "demand": 80
    },
    "bread": {
        "name": "Roti Gandum Hangat",
        "icon": "🍞",
        "base_price": 16,
        "min_price": 8,
        "max_price": 38,
        "supply": 50,
        "demand": 85
    },
    "fish": {
        "name": "Ikan Danau Aether",
        "icon": "🐟",
        "base_price": 15,
        "min_price": 8,
        "max_price": 40,
        "supply": 45,
        "demand": 70
    }
}

# ==========================================
# 3. LIVING TOWN BUSINESSES
# ==========================================
TOWN_BUSINESSES = [
    {
        "id": "biz_bakery",
        "name": "Toko Roti & Pastri Cedric",
        "icon": "🥐",
        "owner_npc": "npc_cedric",
        "profession": "Baker & Chef",
        "workplace": "Dapur Roti Evergreen",
        "inputs": ["wheat", "strawberry"],
        "outputs": ["bread"],
        "daily_revenue": 160,
        "status": "Memanggang roti brioche hangat setiap pagi"
    },
    {
        "id": "biz_blacksmith",
        "name": "Bengkel Tempa Rowan",
        "icon": "🔨",
        "owner_npc": "npc_rowan",
        "profession": "Master Blacksmith",
        "workplace": "Bengkel Tempa Rowan",
        "inputs": ["iron_ore", "wood"],
        "outputs": ["tools", "nails"],
        "daily_revenue": 240,
        "status": "Memproduksi beliung dan paku konstruksi"
    },
    {
        "id": "biz_herbalist",
        "name": "Sanggar Botani & Obat Rimba Elara",
        "icon": "🌿",
        "owner_npc": "npc_elara",
        "profession": "Botanist & Herbalist",
        "workplace": "Kebun Obat Rimba",
        "inputs": ["parsnip", "strawberry"],
        "outputs": ["fertilizer", "potion"],
        "daily_revenue": 180,
        "status": "Meracik pupuk penyubur cepat dan obat herbal"
    },
    {
        "id": "biz_engineer",
        "name": "Laboratorium Teknologi Nessa",
        "icon": "⚡",
        "owner_npc": "npc_nessa",
        "profession": "Aether Engineer",
        "workplace": "Bengkel Rekayasa Aether",
        "inputs": ["iron_ore", "stone"],
        "outputs": ["sprinkler_parts"],
        "daily_revenue": 290,
        "status": "Mengembangkan cetak biru irigasi bertekanan tinggi"
    }
]

# ==========================================
# 4. LIVING NPCS BRAIN & ROUTINES
# ==========================================
LIVING_NPCS_BRAIN = {
    "npc_elara": {
        "id": "npc_elara",
        "name": "Elara",
        "race": "sylph",
        "title": "Ahli Botani & Penjaga Rimba",
        "avatar_icon": "🌿",
        "personality": "Kind & Curious",
        "workplace": "Kebun Botani Rimba",
        "home": "Pondok Angin Lembut",
        "relationships": {
            "trust": 75,
            "respect": 80,
            "friendship": 68,
            "familiarity": 70,
            "cooperation": 85
        },
        "schedules": [
            {"start": 5, "end": 7, "location": "Pondok Angin Lembut", "activity": "Merawat tanaman jendela dan menyeduh teh daun min", "x": 12, "y": 6},
            {"start": 7, "end": 12, "location": "Kebun Botani Rimba", "activity": "Mempelajari pertumbuhan benih dan memanen herba", "x": 10, "y": 9},
            {"start": 12, "end": 14, "location": "Alun-Alun Lembah", "activity": "Makan siang bersama warga di bawah naungan pohon tua", "x": 8, "y": 8},
            {"start": 14, "end": 18, "location": "Tepi Kolam Ikan", "activity": "Mengambil sampel air dan mengamati kupu-kupu", "x": 3, "y": 3},
            {"start": 18, "end": 22, "location": "Pondok Angin Lembut", "activity": "Menyusun herbarium dan mencatat taksonomi bunga", "x": 12, "y": 6},
            {"start": 22, "end": 5, "location": "Pondok Angin Lembut", "activity": "Tertidur lelap diiringi semilir angin malam", "x": 12, "y": 6}
        ],
        "dialogues": {
            "casual": "Tanah di lembah ini memiliki getaran magis yang kaya. Tanamanmu pasti akan tumbuh subur jika disiram penuh kasih!",
            "weather_rain": "Hujan ini berkah bagi benih-benih muda! Aku bisa mengistirahatkan gembor penyiram hari ini.",
            "low_supply_wheat": "Dapur Cedric membutuhkan gandum. Jika kamu punya sisa panen, bantulah dia agar toko rotinya tetap mengepul.",
            "gift_thanks": "Terima kasih banyak! Ini sungguh wangi dan menenangkan jiwaku."
        },
        "memories": [
            {
                "event_id": "mem_elara_intro",
                "summary": "Menyambut kedatangan petualang baru di kebun lembah Evergreen.",
                "timestamp": time.time() - 86400 * 2,
                "importance": "high"
            }
        ]
    },
    "npc_rowan": {
        "id": "npc_rowan",
        "name": "Rowan",
        "race": "dwarf",
        "title": "Empu Pandai Besi & Konstruksi",
        "avatar_icon": "🔨",
        "personality": "Brave & Practical",
        "workplace": "Bengkel Tempa Rowan",
        "home": "Rumah Batu Granit",
        "relationships": {
            "trust": 65,
            "respect": 78,
            "friendship": 55,
            "familiarity": 60,
            "cooperation": 75
        },
        "schedules": [
            {"start": 5, "end": 7, "location": "Rumah Batu Granit", "activity": "Mengasah beliung tempa dan menyalakan tungku arang", "x": 14, "y": 7},
            {"start": 7, "end": 12, "location": "Bengkel Tempa Rowan", "activity": "Menempa baja di atas paron membara dengan irama teratur", "x": 13, "y": 8},
            {"start": 12, "end": 14, "location": "Kedai Roti Cedric", "activity": "Santap siang sepotong roti tebal dan segelas madu segar", "x": 9, "y": 9},
            {"start": 14, "end": 18, "location": "Bengkel Tempa Rowan", "activity": "Memasang pegangan kayu pada kapak dan sekop pesanan warga", "x": 13, "y": 8},
            {"start": 18, "end": 22, "location": "Alun-Alun Lembah", "activity": "Mengobrol santai mengenai kualitas batu tambang bersama Thorne", "x": 8, "y": 8},
            {"start": 22, "end": 5, "location": "Rumah Batu Granit", "activity": "Istirahat mendengkur di ranjang kayu kokoh", "x": 14, "y": 7}
        ],
        "dialogues": {
            "casual": "Baja yang baik butuh panas membara dan pukulan palu yang sabar. Sama seperti membangun peradaban!",
            "weather_rain": "Hujan deras mendinginkan tungku terlalu cepat. Aku harus menyalakan arang cadangan di bengkel.",
            "low_supply_iron": "Persediaan bijih besi menipis! Jika kamu menjelajah ke goa tambang, bawakan beberapa bongkah padaku.",
            "gift_thanks": "Bahan tempa pilihan! Kamu punya mata yang jeli terhadap benda berkualitas, kawan!"
        },
        "memories": [
            {
                "event_id": "mem_rowan_forge",
                "summary": "Memperbaiki beliung pertama milik petualang dengan baja tahan uji.",
                "timestamp": time.time() - 86400 * 3,
                "importance": "high"
            }
        ]
    },
    "npc_nessa": {
        "id": "npc_nessa",
        "name": "Nessa",
        "race": "human",
        "title": "Insinyur Mesin & Peneliti Aether",
        "avatar_icon": "⚡",
        "personality": "Scholarly & Ambitious",
        "workplace": "Laboratorium Rekayasa",
        "home": "Rumah Observatorium Jam",
        "relationships": {
            "trust": 70,
            "respect": 85,
            "friendship": 60,
            "familiarity": 62,
            "cooperation": 80
        },
        "schedules": [
            {"start": 6, "end": 8, "location": "Rumah Observatorium Jam", "activity": "Mencatat pergerakan jarum barometer dan densitas aether", "x": 7, "y": 3},
            {"start": 8, "end": 13, "location": "Laboratorium Rekayasa", "activity": "Menguji gir mekanis dan sistem transmisi traktor otomatis", "x": 8, "y": 4},
            {"start": 13, "end": 14, "location": "Laboratorium Rekayasa", "activity": "Makan siang cepat sambil membaca jurnal ilmiah terbitan ibu kota", "x": 8, "y": 4},
            {"start": 14, "end": 19, "location": "Lahan Pertanian", "activity": "Mengukur debit air pada jaringan sprinkler dan pipa bawah tanah", "x": 6, "y": 7},
            {"start": 19, "end": 23, "location": "Alun-Alun Lembah", "activity": "Memeriksa pencahayaan lentera aether bersama warga", "x": 8, "y": 8},
            {"start": 23, "end": 6, "location": "Rumah Observatorium Jam", "activity": "Tidur di kamar loteng bertabur bintang", "x": 7, "y": 3}
        ],
        "dialogues": {
            "casual": "Sains dan sihir bukan dua hal yang bertolak belakang, kawan. Keduanya adalah dua sisi mata uang peradaban maju!",
            "weather_rain": "Kondensasi udara meningkat 42%. Sempurna untuk menguji tangki penampung air hidrolik kita!",
            "low_supply_stone": "Fondasi bengkel butuh tambahan batu gunung bermutu. Ayo kita kembangkan jalur rel tambang!",
            "gift_thanks": "Komponen yang sangat menarik! Ini akan mempermudah kalkulasi proyek kita berikutnya."
        },
        "memories": [
            {
                "event_id": "mem_nessa_machinery",
                "summary": "Membahas cetak biru traktor bio-aether bersama petualang.",
                "timestamp": time.time() - 86400 * 1,
                "importance": "high"
            }
        ]
    },
    "npc_cedric": {
        "id": "npc_cedric",
        "name": "Cedric",
        "race": "beastfolk",
        "title": "Koki Utama & Pembuat Roti Desa",
        "avatar_icon": "🥐",
        "personality": "Outgoing & Creative",
        "workplace": "Dapur Roti Evergreen",
        "home": "Lantai Atas Kedai Roti",
        "relationships": {
            "trust": 72,
            "respect": 74,
            "friendship": 80,
            "familiarity": 78,
            "cooperation": 82
        },
        "schedules": [
            {"start": 4, "end": 6, "location": "Dapur Roti Evergreen", "activity": "Menguleni adonan gandum dan menyalakan oven bata tanah liat", "x": 9, "y": 9},
            {"start": 6, "end": 12, "location": "Dapur Roti Evergreen", "activity": "Melayani antrean warga yang membeli roti hangat segar", "x": 9, "y": 9},
            {"start": 12, "end": 14, "location": "Kedai Roti Cedric", "activity": "Mencicipi resep selai stroberi baru sambil bercanda tawa", "x": 9, "y": 9},
            {"start": 14, "end": 17, "location": "Pasar Lembah", "activity": "Mencari buah segar dan telur unggas dari peternak lokal", "x": 7, "y": 8},
            {"start": 17, "end": 21, "location": "Alun-Alun Lembah", "activity": "Membagikan roti kering sisa kepada anak-anak dan satwa jinak", "x": 8, "y": 8},
            {"start": 21, "end": 4, "location": "Lantai Atas Kedai Roti", "activity": "Tidur nyaman beralaskan bantal wol beraroma ragi", "x": 9, "y": 9}
        ],
        "dialogues": {
            "casual": "Aroma roti yang baru keluar dari pemanggang adalah definisi kedamaian sejati di Evergreen Chronicles!",
            "weather_rain": "Cuaca mendung paling nikmat ditemani roti kayu manis hangat dan secangkir teh panas, bukan?",
            "low_supply_wheat": "Stok tepung gandumku hampir habis! Petani hebat, bisakah kamu memasok hasil panenmu ke kedai?",
            "gift_thanks": "Wah, bahan kuliner istimewa! Tunggu sampai kamu mencicipi pai buatanku nanti!"
        },
        "memories": [
            {
                "event_id": "mem_cedric_bake",
                "summary": "Berbagi roti gandum hangat perdana musim ini.",
                "timestamp": time.time() - 86400 * 2,
                "importance": "medium"
            }
        ]
    }
}

# ==========================================
# 5. CIVILIZATION SIMULATION CONTROLLER
# ==========================================
class CivilizationEngine:
    """Manages the 7 simulation layers, dynamic market pricing, and NPC decisions."""

    @staticmethod
    def calculate_market_price(base: float, supply: int, demand: int, min_p: float, max_p: float) -> int:
        """Calculates dynamic price using supply-demand smoothing."""
        ratio = (demand - supply) / max(10, (supply + 10))
        raw_price = base * (1.0 + ratio * 0.65)
        clamped = max(min_p, min(max_p, raw_price))
        return int(round(clamped))

    @staticmethod
    def get_current_npc_schedule(npc_id: str, hour: int) -> Dict[str, Any]:
        """Returns the active routine for an NPC based on current in-game hour."""
        npc = LIVING_NPCS_BRAIN.get(npc_id)
        if not npc:
            return {"location": "Alun-Alun Lembah", "activity": "Berkelana di sekitar desa", "x": 8, "y": 8}

        schedules = npc.get("schedules", [])
        for entry in schedules:
            start = entry["start"]
            end = entry["end"]
            if start <= end:
                if start <= hour < end:
                    return entry
            else:
                # Wraps around midnight (e.g. 22 to 5)
                if hour >= start or hour < end:
                    return entry

        return schedules[0] if schedules else {"location": "Lembah", "activity": "Santai", "x": 8, "y": 8}

    @staticmethod
    def generate_dynamic_quests(world_save: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generates dynamic quests driven by real economic shortages or community needs."""
        quests = []
        market = world_save.get("market", {}).get("commodities", DEFAULT_MARKET_COMMODITIES)
        civ = world_save.get("civilization", {})
        current_era = civ.get("current_era", "medieval")

        # 1. Economic Shortage Quest (Wheat for Bakery)
        wheat_info = market.get("wheat", {})
        if wheat_info.get("supply", 100) < wheat_info.get("demand", 100):
            quests.append({
                "id": "quest_dyn_wheat_shortage",
                "issuer_npc": "npc_cedric",
                "title": "Pasokan Gandum Kedai Roti",
                "description": "Pasokan gandum desa sedang menipis. Cedric membutuhkan 5 ikat gandum untuk memenuhi pesanan roti warga.",
                "required_item": "crop_wheat",
                "required_amount": 5,
                "reward_gold": 120,
                "reward_prosperity": 25,
                "reward_affection_npc": "npc_cedric",
                "category": "economy",
                "status": "available"
            })

        # 2. Blacksmith Iron Quest
        iron_info = market.get("iron_ore", {})
        if iron_info.get("supply", 100) < 50:
            quests.append({
                "id": "quest_dyn_iron_forge",
                "issuer_npc": "npc_rowan",
                "title": "Bahan Baja Tungku Rowan",
                "description": "Rowan membutuhkan 3 bongkah bijih besi untuk merestorasi alat bajak dan gerigi penggiling desa.",
                "required_item": "ore_iron",
                "required_amount": 3,
                "reward_gold": 150,
                "reward_prosperity": 35,
                "reward_affection_npc": "npc_rowan",
                "category": "infrastructure",
                "status": "available"
            })

        # 3. Botanical Research Quest
        quests.append({
            "id": "quest_dyn_herbal_sample",
            "issuer_npc": "npc_elara",
            "title": "Ekstrak Herba Musim Lembah",
            "description": "Elara sedang meneliti pupuk organik percepat tumbuh. Kumpulkan 4 buah stroberi atau wortel segar.",
            "required_item": "crop_parsnip",
            "required_amount": 4,
            "reward_gold": 90,
            "reward_prosperity": 20,
            "reward_affection_npc": "npc_elara",
            "category": "environment",
            "status": "available"
        })

        return quests

    @staticmethod
    def advance_civilization_era(save_data: Dict[str, Any]) -> Dict[str, Any]:
        """Attempts to upgrade the world to the next civilization era if requirements are met."""
        civ = save_data.setdefault("civilization", {})
        player = save_data.setdefault("player", {})
        current_era_id = civ.get("current_era", "medieval")
        era_meta = CIVILIZATION_ERAS.get(current_era_id)

        if not era_meta or not era_meta.get("next_era"):
            return {"success": False, "message": "Peradaban telah mencapai era tertinggi (Arcane Future)!"}

        next_era_id = era_meta["next_era"]
        next_era_meta = CIVILIZATION_ERAS[next_era_id]
        required_costs = era_meta.get("required_advance_costs", {})
        player_gold = player.get("gold", 0)

        # Check gold
        gold_req = required_costs.get("gold", 0)
        if player_gold < gold_req:
            return {
                "success": False,
                "message": f"Emas tidak mencukupi untuk memajukan era (butuh {gold_req:,} G, dimiliki {player_gold:,} G)"
            }

        # Deduct gold and apply new era
        player["gold"] -= gold_req
        civ["current_era"] = next_era_id
        civ["prosperity_score"] = civ.get("prosperity_score", 0) + 350
        
        # Increase population and layers
        layers = civ.setdefault("layers", {})
        for layer_key in ["population", "economy", "infrastructure", "social", "governance", "environment", "culture"]:
            layer = layers.setdefault(layer_key, {})
            layer["score"] = min(100, layer.get("score", 70) + 8)

        return {
            "success": True,
            "message": f"🎉 Selamat! Dunia berhasil maju ke {next_era_meta['name']}! {next_era_meta['icon']}",
            "new_era": next_era_meta,
            "prosperity_score": civ["prosperity_score"]
        }

civ_engine = CivilizationEngine()
