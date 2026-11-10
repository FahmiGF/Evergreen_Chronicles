# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Underground Mining & Machinery Engine (V4)
10 Underground Zones (60+ Floors), Minerals Catalog, Smelting, Crushing, and Machinery.
"""

from typing import Dict, List, Any, Optional
import random

MINING_ZONES = [
    {"id": "zone_1", "name": "Gua Tambang Terbengkalai (Abandoned Quarry)", "floors": "1-6", "theme": "Batu & Batu Bara", "min_level": 1, "color": "#78716c"},
    {"id": "zone_2", "name": "Urat Tambang Tembaga (Copper Mine)", "floors": "7-12", "theme": "Tembaga & Timah", "min_level": 5, "color": "#b45309"},
    {"id": "zone_3", "name": "Kedalaman Besi Tempa (Iron Mine)", "floors": "13-18", "theme": "Besi & Batu Perak", "min_level": 12, "color": "#64748b"},
    {"id": "zone_4", "name": "Gua Kristal Zamrud (Crystal Caverns)", "floors": "19-24", "theme": "Kuarsa & Zamrud Hijau", "min_level": 20, "color": "#10b981"},
    {"id": "zone_5", "name": "Bawah Tanah Beku (Frozen Underground)", "floors": "25-30", "theme": "Bijih Es & Safir Biru", "min_level": 28, "color": "#0ea5e9"},
    {"id": "zone_6", "name": "Grotto Jamur Menyala (Mushroom Grotto)", "floors": "31-36", "theme": "Emas & Fungi Luminous", "min_level": 36, "color": "#eab308"},
    {"id": "zone_7", "name": "Reruntuhan Peradaban Purba (Ancient Ruins)", "floors": "37-42", "theme": "Ancient Gears & Ruby", "min_level": 45, "color": "#f43f5e"},
    {"id": "zone_8", "name": "Kawah Lahar Magma (Lava Cavern)", "floors": "43-48", "theme": "Obsidian & Intan Berlian", "min_level": 55, "color": "#dc2626"},
    {"id": "zone_9", "name": "Palung Danau Purba (Underground Lake)", "floors": "49-54", "theme": "Mutiara Hitam & Star Crystal", "min_level": 65, "color": "#6366f1"},
    {"id": "zone_10", "name": "Tambang Bintang Angkasa (Celestial Mine)", "floors": "55-60+", "theme": "Ancient Core & Celestial Ore", "min_level": 75, "color": "#a855f7"}
]

MINERALS_CATALOG = [
    {"id": "mat_stone", "name": "Batu Tambang Kasar", "rarity": "Common", "sell_price": 5, "icon": "🪨", "desc": "Material dasar untuk pondasi dan jalan setapak desa."},
    {"id": "mat_coal", "name": "Batu Bara Hitam", "rarity": "Common", "sell_price": 18, "icon": "⬛", "desc": "Bahan bakar tungku peleburan logam dan mesin uap."},
    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "rarity": "Common", "sell_price": 25, "icon": "🟫", "desc": "Bijih mentah tembaga kemerahan siap dilebur."},
    {"id": "mat_iron_ore", "name": "Bijih Besi", "rarity": "Common", "sell_price": 45, "icon": "🔩", "desc": "Besi padat untuk perkakas, traktor, dan roda gerigi."},
    {"id": "mat_silver_ore", "name": "Bijih Perak", "rarity": "Uncommon", "sell_price": 80, "icon": "🪙", "desc": "Logam mulia perak untuk konduktor dan perhiasan."},
    {"id": "mat_gold_ore", "name": "Bijih Emas", "rarity": "Uncommon", "sell_price": 130, "icon": "🥇", "desc": "Emas murni bernilai jual tinggi untuk komponen elit."},
    {"id": "mat_quartz", "name": "Kristal Kuarsa Murni", "rarity": "Uncommon", "sell_price": 95, "icon": "🔮", "desc": "Mineral bening pembias cahaya untuk alat optik dan laboratorium."},
    {"id": "mat_emerald", "name": "Zamrud Hijau", "rarity": "Rare", "sell_price": 260, "icon": "❇️", "desc": "Permata hijau memikat incaran kolektor kerajaan."},
    {"id": "mat_ruby", "name": "Batu Rubi Delima", "rarity": "Rare", "sell_price": 340, "icon": "🔴", "desc": "Batu permata merah pekat kaya elemen api."},
    {"id": "mat_sapphire", "name": "Batu Safir Laut", "rarity": "Rare", "sell_price": 380, "icon": "🔷", "desc": "Permata biru cerah menyimpan dinginnya laut dalam."},
    {"id": "mat_mythril_ore", "name": "Bijih Mythril Biru", "rarity": "Epic", "sell_price": 550, "icon": "💎", "desc": "Logam legendaris berkilau biru, ringan namun tak terhancurkan."},
    {"id": "mat_star_crystal", "name": "Kristal Bintang Jatuh", "rarity": "Legendary", "sell_price": 950, "icon": "⭐", "desc": "Pecahan meteorit kuno bersinar cemerlang di kedalaman gua."},
    {"id": "mat_ancient_core", "name": "Inti Mesin Purba", "rarity": "Legendary", "sell_price": 1400, "icon": "⚙️", "desc": "Reaktor teknologi kuno yang masih berdengung bertenaga."}
]

MACHINERY_RECIPES = [
    {
        "machine": "smelter",
        "name": "Peleburan Bijih Tembaga",
        "inputs": {"mat_copper_ore": 5, "mat_coal": 1},
        "output": {"id": "ingot_copper", "name": "Batangan Tembaga Murni", "count": 1, "sell_price": 160}
    },
    {
        "machine": "smelter",
        "name": "Peleburan Bijih Besi",
        "inputs": {"mat_iron_ore": 5, "mat_coal": 1},
        "output": {"id": "ingot_iron", "name": "Batangan Besi Tempa", "count": 1, "sell_price": 280}
    },
    {
        "machine": "smelter",
        "name": "Peleburan Batangan Emas",
        "inputs": {"mat_gold_ore": 5, "mat_coal": 2},
        "output": {"id": "ingot_gold", "name": "Batangan Emas Murni", "count": 1, "sell_price": 750}
    },
    {
        "machine": "smelter",
        "name": "Peleburan Batangan Mythril",
        "inputs": {"mat_mythril_ore": 5, "mat_coal": 3},
        "output": {"id": "ingot_mythril", "name": "Batangan Mythril Biru", "count": 1, "sell_price": 1800}
    },
    {
        "machine": "crusher",
        "name": "Penghancuran Geode & Mineral Kasar",
        "inputs": {"mat_stone": 20},
        "output": {"id": "mat_quartz", "name": "Kristal Kuarsa Hasil Ayakan", "count": 2, "sell_price": 95}
    },
    {
        "machine": "polisher",
        "name": "Penggosokan Permata Zamrud Mahkota",
        "inputs": {"mat_emerald": 2},
        "output": {"id": "gem_faceted_emerald", "name": "Zamrud Faset Kerajaan", "count": 1, "sell_price": 700}
    }
]

class MiningEngine:
    """Manages floor exploration, vein excavation, elevator shortcuts, and machine processing."""

    @staticmethod
    def initialize_mining(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure mining state, deepest floor unlocked, and machine structures exist."""
        if "mining_data" not in player:
            player["mining_data"] = {
                "current_floor": 1,
                "deepest_floor": 1,
                "elevator_checkpoints": [1],
                "minerals_vault": {
                    "mat_stone": 45,
                    "mat_coal": 12,
                    "mat_copper_ore": 18,
                    "mat_iron_ore": 8
                },
                "machines": {
                    "blast_smelter": {"level": 1, "active_queue": []},
                    "ore_crusher": {"level": 1, "active_queue": []},
                    "gem_polisher": {"level": 1, "active_queue": []},
                    "automated_minecart": {"active": True, "transport_speed": 1.5}
                }
            }
        return player

    @staticmethod
    def excavate_floor(player: Dict[str, Any], floor: int) -> Dict[str, Any]:
        """Excavate resources on a given mining floor, with rewards determined by zone and luck."""
        MiningEngine.initialize_mining(player)
        mdata = player["mining_data"]

        if floor > mdata.get("deepest_floor", 1) + 1:
            return {"success": False, "error": f"Lantai {floor} belum dapat diakses. Selesaikan lantai {mdata.get('deepest_floor', 1)} terlebih dahulu."}

        # Determine zone
        zone_idx = min(9, (floor - 1) // 6)
        current_zone = MINING_ZONES[zone_idx]

        # Calculate drops
        drops = {}
        # Base stone & coal
        drops["mat_stone"] = random.randint(4, 10)
        if random.random() < 0.65:
            drops["mat_coal"] = random.randint(2, 5)

        # Zone-specific ore drops
        if zone_idx == 0:
            if random.random() < 0.5:
                drops["mat_copper_ore"] = random.randint(1, 3)
        elif zone_idx == 1:
            drops["mat_copper_ore"] = random.randint(2, 6)
            if random.random() < 0.3:
                drops["mat_quartz"] = 1
        elif zone_idx == 2:
            drops["mat_iron_ore"] = random.randint(2, 5)
            if random.random() < 0.35:
                drops["mat_silver_ore"] = random.randint(1, 2)
        elif zone_idx == 3:
            drops["mat_quartz"] = random.randint(2, 4)
            if random.random() < 0.4:
                drops["mat_emerald"] = 1
        elif zone_idx >= 4:
            drops["mat_gold_ore"] = random.randint(2, 4)
            if random.random() < 0.25:
                drops["mat_mythril_ore"] = 1
            if zone_idx >= 7 and random.random() < 0.15:
                drops["mat_star_crystal"] = 1
            if zone_idx == 9 and random.random() < 0.20:
                drops["mat_ancient_core"] = 1

        # Add to minerals vault
        vault = mdata["minerals_vault"]
        for mat_id, count in drops.items():
            vault[mat_id] = vault.get(mat_id, 0) + count

        # Advance deepest floor
        new_deepest = max(mdata.get("deepest_floor", 1), floor)
        mdata["deepest_floor"] = new_deepest
        mdata["current_floor"] = floor

        # Elevator checkpoint every 5 floors
        if floor % 5 == 0 and floor not in mdata["elevator_checkpoints"]:
            mdata["elevator_checkpoints"].append(floor)
            mdata["elevator_checkpoints"].sort()

        # Deduct stamina
        player["stamina"] = max(0, player.get("stamina", 100) - 8)

        return {
            "success": True,
            "floor": floor,
            "zone": current_zone["name"],
            "drops": drops,
            "deepest_floor": new_deepest,
            "unlocked_elevators": mdata["elevator_checkpoints"],
            "remaining_stamina": player["stamina"],
            "message": f"Ekskavasi Lantai {floor} ({current_zone['name']}) berhasil! Ditemukan urat mineral melimpah."
        }

    @staticmethod
    def process_machine(player: Dict[str, Any], recipe_name: str) -> Dict[str, Any]:
        """Craft metals and cut gems in machinery (Smelter, Crusher, Polisher)."""
        MiningEngine.initialize_mining(player)
        mdata = player["mining_data"]
        vault = mdata["minerals_vault"]

        recipe = next((r for r in MACHINERY_RECIPES if r["name"] == recipe_name), None)
        if not recipe:
            return {"success": False, "error": f"Resep mesin '{recipe_name}' tidak dikenal."}

        # Check required input materials
        for req_mat, req_count in recipe["inputs"].items():
            if vault.get(req_mat, 0) < req_count:
                mat_meta = next((m for m in MINERALS_CATALOG if m["id"] == req_mat), {"name": req_mat})
                return {"success": False, "error": f"Bahan {mat_meta['name']} kurang! Butuh {req_count}, tersedia {vault.get(req_mat, 0)}."}

        # Deduct materials
        for req_mat, req_count in recipe["inputs"].items():
            vault[req_mat] -= req_count

        out = recipe["output"]
        vault[out["id"]] = vault.get(out["id"], 0) + out["count"]

        return {
            "success": True,
            "recipe": recipe_name,
            "produced": out,
            "vault": vault,
            "message": f"Mesin selesai mengolah! Memperoleh {out['count']}x {out['name']}."
        }
