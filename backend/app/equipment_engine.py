# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Equipment & Tools Progression Engine (V4)
10 Tiers (Wooden to Celestial), Durability, Sockets, and Enchantments.
"""

from typing import Dict, List, Any, Optional

TOOL_TIERS = [
    {"tier": 1, "id": "wooden", "name": "Kayu Rimba", "color": "#a16207", "durability": 100, "efficiency": 1.0, "stamina_cost": 3},
    {"tier": 2, "id": "copper", "name": "Tembaga Tempa", "color": "#ea580c", "durability": 250, "efficiency": 1.25, "stamina_cost": 2},
    {"tier": 3, "id": "iron", "name": "Besi Tempa", "color": "#64748b", "durability": 500, "efficiency": 1.5, "stamina_cost": 2},
    {"tier": 4, "id": "silver", "name": "Perak Halus", "color": "#94a3b8", "durability": 850, "efficiency": 1.8, "stamina_cost": 2},
    {"tier": 5, "id": "gold", "name": "Emas Murni", "color": "#eab308", "durability": 1300, "efficiency": 2.2, "stamina_cost": 1},
    {"tier": 6, "id": "platinum", "name": "Platinum Elit", "color": "#38bdf8", "durability": 2000, "efficiency": 2.6, "stamina_cost": 1},
    {"tier": 7, "id": "mythril", "name": "Mythril Biru", "color": "#6366f1", "durability": 3000, "efficiency": 3.2, "stamina_cost": 1},
    {"tier": 8, "id": "crystal", "name": "Kristal Aether", "color": "#a855f7", "durability": 4500, "efficiency": 4.0, "stamina_cost": 1},
    {"tier": 9, "id": "ancient", "name": "Relik Purba", "color": "#ec4899", "durability": 6500, "efficiency": 5.0, "stamina_cost": 1},
    {"tier": 10, "id": "celestial", "name": "Bintang Angkasa", "color": "#f59e0b", "durability": 10000, "efficiency": 6.5, "stamina_cost": 0}
]

TOOL_TYPES = [
    {"type": "pickaxe", "name": "Beliung", "icon": "⛏️", "desc": "Menambang batuan, bijih mineral, dan kristal goyah."},
    {"type": "axe", "name": "Kapak", "icon": "🪓", "desc": "Menebang pohon, membelah kayu gelondongan dan tunggul."},
    {"type": "hoe", "name": "Cangkul", "icon": "🌱", "desc": "Mencangkul tanah menjadi petak siap tanam bibit."},
    {"type": "watering_can", "name": "Gembor Air", "icon": "🚰", "desc": "Menyirami petak tanaman agar tanah tetap lembab."},
    {"type": "fishing_rod", "name": "Joran Pancing", "icon": "🎣", "desc": "Memancing ikan di sungai, danau, dan palung samudra."},
    {"type": "harvest_sickle", "name": "Sabit Panen", "icon": "🌾", "desc": "Memanen rumpun tanaman pangan dan rumput ilalang sekaligus."},
    {"type": "crystal_lantern", "name": "Lentera Kristal", "icon": "🏮", "desc": "Menerangi lorong gua tambang gulita dan mengusir kabut mistis."},
    {"type": "treasure_detector", "name": "Detektor Harta", "icon": "🧭", "desc": "Mendeteksi urat mineral dan peti peninggalan di bawah tanah."}
]

ENCHANTMENTS_CATALOG = [
    {"id": "fortune", "name": "Keberuntungan Tambang (Fortune)", "desc": "Peluang +35% menjatuhkan hasil ganda saat menambang atau panen.", "max_rank": 3},
    {"id": "swift_strike", "name": "Hantaman Kilat (Swift Strike)", "desc": "Mengurangi jeda ayunan dan konsumsi stamina alat sebesar 30%.", "max_rank": 3},
    {"id": "auto_smelt", "name": "Pelebur Api Otomatis (Auto-Smelt)", "desc": "Bijih yang ditambang langsung keluar dalam wujud batangan logam ingot murni.", "max_rank": 1},
    {"id": "multi_tile", "name": "Jangkauan Area Luas (Multi-Tile)", "desc": "Aksi mengenai petak 3x3 sekaligus di sekitar pemain.", "max_rank": 2},
    {"id": "radiance", "name": "Kilau Abadi (Radiance)", "desc": "Memancarkan lingkaran cahaya mistis di sekitar karakter saat dipakai.", "max_rank": 2}
]

class EquipmentEngine:
    """Manages player tool progression, upgrades, durability decay, and repair."""

    @staticmethod
    def initialize_equipment(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure equipment inventory and default tools are initialized with durability."""
        if "equipment" not in player:
            player["equipment"] = {
                "active_tool": "pickaxe",
                "tools": {}
            }
        
        tools = player["equipment"]["tools"]
        for t in TOOL_TYPES:
            t_type = t["type"]
            if t_type not in tools:
                tier_data = TOOL_TIERS[1] if t_type in ["pickaxe", "axe", "hoe", "watering_can"] else TOOL_TIERS[0]
                tools[t_type] = {
                    "type": t_type,
                    "name": f"{t['name']} {tier_data['name']}",
                    "tier": tier_data["tier"],
                    "tier_id": tier_data["id"],
                    "durability": tier_data["durability"],
                    "max_durability": tier_data["durability"],
                    "efficiency": tier_data["efficiency"],
                    "stamina_cost": tier_data["stamina_cost"],
                    "enchantments": []
                }
        return player

    @staticmethod
    def use_tool(player: Dict[str, Any], tool_type: str) -> Dict[str, Any]:
        """Deduct durability and stamina on tool usage."""
        EquipmentEngine.initialize_equipment(player)
        tools = player["equipment"]["tools"]
        if tool_type not in tools:
            return {"error": f"Alat '{tool_type}' tidak ditemukan."}

        tool = tools[tool_type]
        if tool["durability"] <= 0:
            return {
                "success": False,
                "broken": True,
                "message": f"{tool['name']} Anda telah rusak! Perbaiki di Pandai Besi sebelum digunakan kembali."
            }

        # Deduct 1 durability (celestial tier 10 does not decay)
        if tool["tier"] < 10:
            tool["durability"] = max(0, tool["durability"] - 1)

        # Deduct stamina
        stamina_cost = tool.get("stamina_cost", 2)
        has_swift = any(e["id"] == "swift_strike" for e in tool.get("enchantments", []))
        if has_swift:
            stamina_cost = max(0, stamina_cost - 1)
        player["stamina"] = max(0, player.get("stamina", 100) - stamina_cost)

        return {
            "success": True,
            "tool_type": tool_type,
            "current_durability": tool["durability"],
            "max_durability": tool["max_durability"],
            "player_stamina": player["stamina"],
            "broken": tool["durability"] <= 0
        }

    @staticmethod
    def repair_tool(player: Dict[str, Any], tool_type: str) -> Dict[str, Any]:
        """Repair tool to full durability using coins."""
        EquipmentEngine.initialize_equipment(player)
        tools = player["equipment"]["tools"]
        if tool_type not in tools:
            return {"success": False, "error": f"Alat '{tool_type}' tidak valid."}

        tool = tools[tool_type]
        cost = int((tool["max_durability"] - tool["durability"]) * 0.15)
        cost = max(20, cost)

        if player.get("gold", 0) < cost:
            return {"success": False, "error": f"Koin emas tidak cukup untuk perbaikan. Butuh {cost} G."}

        player["gold"] -= cost
        tool["durability"] = tool["max_durability"]

        return {
            "success": True,
            "cost_paid": cost,
            "current_gold": player["gold"],
            "tool": tool,
            "message": f"{tool['name']} berhasil diperbaiki hingga kondisi prima 100%!"
        }

    @staticmethod
    def upgrade_tool_tier(player: Dict[str, Any], tool_type: str) -> Dict[str, Any]:
        """Upgrade tool to next tier (e.g. Copper -> Iron -> Silver -> ... -> Celestial)."""
        EquipmentEngine.initialize_equipment(player)
        tools = player["equipment"]["tools"]
        if tool_type not in tools:
            return {"success": False, "error": f"Alat '{tool_type}' tidak valid."}

        tool = tools[tool_type]
        cur_tier = tool["tier"]
        if cur_tier >= 10:
            return {"success": False, "error": f"{tool['name']} sudah mencapai tier tertinggi (Celestial)!"}

        next_tier_data = TOOL_TIERS[cur_tier]  # 0-indexed
        upgrade_cost = int(250 * math_power_tier(next_tier_data["tier"]))

        if player.get("gold", 0) < upgrade_cost:
            return {"success": False, "error": f"Emas tidak cukup untuk menempa {next_tier_data['name']}. Biaya: {upgrade_cost} G."}

        player["gold"] -= upgrade_cost
        tool["tier"] = next_tier_data["tier"]
        tool["tier_id"] = next_tier_data["id"]
        
        base_name = [t["name"] for t in TOOL_TYPES if t["type"] == tool_type][0]
        tool["name"] = f"{base_name} {next_tier_data['name']}"
        tool["max_durability"] = next_tier_data["durability"]
        tool["durability"] = next_tier_data["durability"]
        tool["efficiency"] = next_tier_data["efficiency"]
        tool["stamina_cost"] = next_tier_data["stamina_cost"]

        return {
            "success": True,
            "upgraded_tool": tool,
            "paid_gold": upgrade_cost,
            "remaining_gold": player["gold"],
            "message": f"Pandai besi berhasil menempa {tool['name']}! Efisiensi dan ketahanan meningkat drastis!"
        }

    @staticmethod
    def apply_enchantment(player: Dict[str, Any], tool_type: str, enchantment_id: str) -> Dict[str, Any]:
        """Infuse a magical enchantment onto a tool using Aether Shards."""
        EquipmentEngine.initialize_equipment(player)
        tools = player["equipment"]["tools"]
        if tool_type not in tools:
            return {"success": False, "error": f"Alat '{tool_type}' tidak valid."}

        ench_meta = next((e for e in ENCHANTMENTS_CATALOG if e["id"] == enchantment_id), None)
        if not ench_meta:
            return {"success": False, "error": f"Enchantment '{enchantment_id}' tidak dikenal."}

        tool = tools[tool_type]
        existing = next((e for e in tool["enchantments"] if e["id"] == enchantment_id), None)
        current_rank = existing["rank"] if existing else 0
        if current_rank >= ench_meta["max_rank"]:
            return {"success": False, "error": f"Enchantment ini sudah berada di tingkat maksimal ({current_rank})."}

        cost_shards = (current_rank + 1) * 8
        if player.get("aether_shards", 0) < cost_shards:
            return {"success": False, "error": f"Aether Shards tidak cukup. Butuh {cost_shards} pecahan Aether."}

        player["aether_shards"] -= cost_shards
        if existing:
            existing["rank"] += 1
        else:
            tool["enchantments"].append({
                "id": enchantment_id,
                "name": ench_meta["name"],
                "rank": 1
            })

        return {
            "success": True,
            "tool": tool,
            "enchantment": ench_meta["name"],
            "rank": current_rank + 1,
            "remaining_shards": player["aether_shards"],
            "message": f"Altar Alkimia sukses memadukan energi {ench_meta['name']} ke dalam {tool['name']}!"
        }

def math_power_tier(tier: int) -> float:
    return float(tier ** 1.35)
