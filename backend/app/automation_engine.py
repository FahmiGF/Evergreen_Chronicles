# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Building, Factory & Automation Expansion Engine (V4)
13 Production Buildings, Processing Queues, Sprinklers & Automated Machinery.
"""

from typing import Dict, List, Any, Optional

BUILDINGS_CATALOG = [
    {"id": "greenhouse", "name": "Rumah Kaca Empat Musim (Greenhouse)", "icon": "🏡", "function": "Menanam segala tanaman lintas musim tanpa terpengaruh cuaca.", "cost": 1500, "built_default": True},
    {"id": "bakery", "name": "Toko Roti & Dapur Gandum (Bakery)", "icon": "🥖", "function": "Mengolah gandum menjadi tepung dan memanggang roti hangat.", "cost": 850, "built_default": True},
    {"id": "dairy", "name": "Pabrik Pengolahan Susu (Dairy)", "icon": "🧀", "function": "Memfermentasi susu segar menjadi mentega lembut dan keju artisan.", "cost": 950, "built_default": False},
    {"id": "winery", "name": "Lumbung Jus & Sari Buah (Juice House)", "icon": "🍷", "function": "Memeras beri dan anggur menjadi sari buah menyegarkan.", "cost": 1200, "built_default": False},
    {"id": "textile_workshop", "name": "Bengkel Tekstil & Tenun (Textile Workshop)", "icon": "🧵", "function": "Memintal wol alpaca dan kapas menjadi kain sutra dan pakaian modis.", "cost": 1400, "built_default": False},
    {"id": "carpenter_workshop", "name": "Bengkel Kayu Jati (Carpenter Workshop)", "icon": "🪚", "function": "Merakit perabot rumah tangga, lemari, dan pagar dekorasi desa.", "cost": 1100, "built_default": True},
    {"id": "blacksmith", "name": "Bengkel Pandai Besi (Blacksmith)", "icon": "⚒️", "function": "Menempa perkakas logam, memperbaiki alat, dan upgrade tier senjata.", "cost": 1600, "built_default": True},
    {"id": "alchemy_lab", "name": "Laboratorium Alkimia Gaib (Alchemy Lab)", "icon": "⚗️", "function": "Meramu tonik pemulih stamina, minyak eliksir, dan esensi kristal.", "cost": 2200, "built_default": False},
    {"id": "gem_workshop", "name": "Studio Pemotong Permata (Gem Workshop)", "icon": "💎", "function": "Mengasah batu mulia kasar menjadi perhiasan permata berkilau.", "cost": 2500, "built_default": False},
    {"id": "factory", "name": "Pabrik Perakitan Mesin (Automated Factory)", "icon": "🏭", "function": "Memproduksi roda gigi, piston uap, dan komponen konveyor otomatis.", "cost": 3800, "built_default": False},
    {"id": "research_center", "name": "Pusat Riset Teknologi (Research Center)", "icon": "🔬", "function": "Membuka cetak biru modern, efisiensi energi, dan formula pupuk ajaib.", "cost": 4200, "built_default": False},
    {"id": "trading_post", "name": "Pos Perdagangan Regional (Trading Post)", "icon": "⚖️", "function": "Menerima kontrak ekspor komoditas berskala besar ke kota metropolitan.", "cost": 3200, "built_default": False},
    {"id": "warehouse", "name": "Gudang Logistik Otomatis (Central Warehouse)", "icon": "📦", "function": "Menyortir hasil panen dan mineral ke peti penyimpanan secara otomatis.", "cost": 2000, "built_default": True}
]

PRODUCTION_RECIPES = [
    {"building_id": "bakery", "name": "Roti Gandum Hangat", "inputs": {"seed_wheat": 3}, "output": "Roti Gandum Panggang", "value": 140, "energy": 50},
    {"building_id": "dairy", "name": "Keju Cheddar Artisan", "inputs": {"milk": 2}, "output": "Keju Batangan Matang", "value": 260, "energy": 65},
    {"building_id": "winery", "name": "Sari Buah Moonberry", "inputs": {"crop_strawberry": 2}, "output": "Sirup Stroberi Manis", "value": 310, "energy": 75},
    {"building_id": "factory", "name": "Sprinkler Otomatis Tier 2", "inputs": {"mat_iron_ore": 4, "mat_copper_ore": 4}, "output": "Sprinkler Tekanan Tinggi", "value": 550, "energy": 0}
]

class AutomationEngine:
    """Manages player buildings, automated factory queues, and daily automation processing."""

    @staticmethod
    def initialize_automation(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure buildings and automation structures exist."""
        if "automation_data" not in player:
            player["automation_data"] = {
                "built_buildings": ["greenhouse", "bakery", "carpenter_workshop", "blacksmith", "warehouse"],
                "active_queues": [
                    {"id": "q1", "building_id": "bakery", "recipe": "Roti Gandum Hangat", "progress": 100, "ready": True}
                ],
                "sprinkler_coverage_tiles": 24,
                "conveyor_network_active": True
            }
        return player

    @staticmethod
    def construct_building(player: Dict[str, Any], building_id: str) -> Dict[str, Any]:
        """Construct a new functional building."""
        AutomationEngine.initialize_automation(player)
        adata = player["automation_data"]

        b_meta = next((b for b in BUILDINGS_CATALOG if b["id"] == building_id), None)
        if not b_meta:
            return {"success": False, "error": f"Bangunan '{building_id}' tidak valid."}

        if building_id in adata["built_buildings"]:
            return {"success": False, "error": f"Bangunan {b_meta['name']} sudah berhasil didirikan!"}

        if player.get("gold", 0) < b_meta["cost"]:
            return {"success": False, "error": f"Dana kas tidak mencukupi untuk konstruksi {b_meta['name']}. Biaya: {b_meta['cost']} G."}

        player["gold"] -= b_meta["cost"]
        adata["built_buildings"].append(building_id)

        return {
            "success": True,
            "building": b_meta,
            "built_buildings": adata["built_buildings"],
            "remaining_gold": player["gold"],
            "message": f"Pembangunan {b_meta['name']} selesai! Fasilitas kini aktif melayani produksi pertanian."
        }

    @staticmethod
    def queue_production(player: Dict[str, Any], recipe_name: str) -> Dict[str, Any]:
        """Queue an item for production in a workshop/factory."""
        AutomationEngine.initialize_automation(player)
        adata = player["automation_data"]

        recipe = next((r for r in PRODUCTION_RECIPES if r["name"] == recipe_name), None)
        if not recipe:
            return {"success": False, "error": f"Resep produksi '{recipe_name}' tidak dikenal."}

        if recipe["building_id"] not in adata["built_buildings"]:
            b_meta = next(b for b in BUILDINGS_CATALOG if b["id"] == recipe["building_id"])
            return {"success": False, "error": f"Bangunan {b_meta['name']} belum dibangun!"}

        # Add queue
        new_q = {
            "id": f"q_{len(adata['active_queues']) + 1}",
            "building_id": recipe["building_id"],
            "recipe": recipe_name,
            "progress": 100,
            "ready": True
        }
        adata["active_queues"].append(new_q)

        return {
            "success": True,
            "queued": new_q,
            "message": f"Antrean produksi '{recipe_name}' berhasil diproses di lini pabrik!"
        }

    @staticmethod
    def collect_production(player: Dict[str, Any], queue_id: str) -> Dict[str, Any]:
        """Collect finished processed goods from production queue."""
        AutomationEngine.initialize_automation(player)
        adata = player["automation_data"]

        q = next((item for item in adata["active_queues"] if item["id"] == queue_id), None)
        if not q or not q.get("ready", False):
            return {"success": False, "error": "Hasil produksi belum siap diambil atau antrean tidak valid."}

        recipe = next((r for r in PRODUCTION_RECIPES if r["name"] == q["recipe"]), None)
        adata["active_queues"].remove(q)

        val = recipe["value"] if recipe else 100
        player["gold"] = player.get("gold", 0) + val

        return {
            "success": True,
            "collected_item": q["recipe"],
            "earned_gold": val,
            "current_gold": player["gold"],
            "message": f"Hasil olahan '{q['recipe']}' berhasil dipanen dan terjual seharga {val} G!"
        }
