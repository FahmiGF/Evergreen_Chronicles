# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Advanced Tools, Equipment & Crafting Progression Engine (V7)
40 Specialized Tools across Exploration, Farming, Mining, and Magic/Technology categories,
Multi-Tier Upgrades, Durability Management, and 6 Dedicated Equipment Loadouts.
"""

from typing import Dict, List, Any, Optional

ADVANCED_TOOLS_CATALOG: List[Dict[str, Any]] = [
    # 1. Exploration Tools (10)
    {"id": "tool_surveyor_compass", "category": "exploration", "name": "Surveyor Compass", "icon": "🧭", "tier": "Arcane", "desc": "Mendeteksi mercu suar dan relik purba tersembunyi dalam radius 50 petak.", "upgrade_cost_gold": 1200},
    {"id": "tool_relic_scanner", "category": "exploration", "name": "Relic Scanner Quantum", "icon": "📟", "tier": "Astral", "desc": "Memindai lempeng aksara kuno di bawah tanah berpasir atau reruntuhan istana.", "upgrade_cost_gold": 2500},
    {"id": "tool_biome_analyzer", "category": "exploration", "name": "Biome Analyzer AI", "icon": "🌡️", "tier": "Advanced", "desc": "Menganalisis kondisi mikro-klimat dan kelembapan bioma dunia.", "upgrade_cost_gold": 1500},
    {"id": "tool_glider", "category": "exploration", "name": "Aether Glider Skybound", "icon": "🪂", "tier": "Reinforced", "desc": "Meluncur bebas melintasi jurang dan pulau melayang di Skyreach Archipelago.", "upgrade_cost_gold": 1800},
    {"id": "tool_grapple_device", "category": "exploration", "name": "Grapple Hook Titanium", "icon": "⚓", "tier": "Reinforced", "desc": "Menembakkan kait ke tebing curam untuk memanjat cepat.", "upgrade_cost_gold": 1400},
    {"id": "tool_portable_camp", "category": "exploration", "name": "Modular Expedition Camp", "icon": "⛺", "tier": "Basic", "desc": "Mendirikan pos istirahat lapangan instan untuk memulihkan stamina.", "upgrade_cost_gold": 1000},
    {"id": "tool_diving_suit", "category": "exploration", "name": "Deep-Sea Diving Suit", "icon": "🤿", "tier": "Arcane", "desc": "Pakaian selam anti-tekanan untuk menyelami palung laut Thalassia Deep.", "upgrade_cost_gold": 3000},
    {"id": "tool_thermal_suit", "category": "exploration", "name": "Adaptive Thermal Suit", "icon": "🥋", "tier": "Reinforced", "desc": "Melindungi tubuh dari suhu dingin Frostveil dan panas lahar Emberfall.", "upgrade_cost_gold": 2200},
    {"id": "tool_field_notebook", "category": "exploration", "name": "Living Archive Notebook", "icon": "📓", "tier": "Basic", "desc": "Mencatat sketsa flora fauna langka langsung ke Grand Encyclopedia.", "upgrade_cost_gold": 800},
    {"id": "tool_camera_drone", "category": "exploration", "name": "Survey AI Camera Drone", "icon": "📷", "tier": "Astral", "desc": "Drone terbang pemotret panorama lanskap dari ketinggian udara.", "upgrade_cost_gold": 2800},

    # 2. Farming Tools (10)
    {"id": "tool_precision_planter", "category": "farming", "name": "Precision Seed Planter", "icon": "🌱", "tier": "Reinforced", "desc": "Menanam benih dengan formasi presisi tanpa membuang bibit.", "upgrade_cost_gold": 1100},
    {"id": "tool_soil_scanner", "category": "farming", "name": "Soil Nutrient Scanner", "icon": "🧪", "tier": "Advanced", "desc": "Melihat komposisi NPK dan pH tanah kebun secara langsung.", "upgrade_cost_gold": 1300},
    {"id": "tool_smart_irrigator", "category": "farming", "name": "Smart Irrigation Controller", "icon": "💧", "tier": "Arcane", "desc": "Menyiram 16 petak sawah secara otomatis saat fajar tiba.", "upgrade_cost_gold": 2400},
    {"id": "tool_orchard_pruner", "category": "farming", "name": "Orchard Pruning Kit", "icon": "✂️", "tier": "Basic", "desc": "Memangkas ranting pohon buah untuk memicu panen buah ganda.", "upgrade_cost_gold": 900},
    {"id": "tool_pollination_drone", "category": "farming", "name": "Pollination Drone MK-2", "icon": "🐝", "tier": "Astral", "desc": "Drone buatan yang melakukan penyerbukan bunga secara otomatis.", "upgrade_cost_gold": 3200},
    {"id": "tool_greenhouse_climate", "category": "farming", "name": "Greenhouse Climate Console", "icon": "🏡", "tier": "Arcane", "desc": "Menjaga suhu ideal rumah kaca agar tanaman musim apapun dapat tumbuh.", "upgrade_cost_gold": 2600},
    {"id": "tool_crop_analyzer", "category": "farming", "name": "Crop Quality Spectrometer", "icon": "🔍", "tier": "Advanced", "desc": "Mendeteksi potensi tanaman raksasa (Giant Crops) sejak fase tunas.", "upgrade_cost_gold": 1700},
    {"id": "tool_harvest_basket", "category": "farming", "name": "Aether Harvest Basket", "icon": "🧺", "tier": "Basic", "desc": "Keranjang dengan kantong dimensi ringan berkapasitas 50 hasil panen.", "upgrade_cost_gold": 950},
    {"id": "tool_multi_seeder", "category": "farming", "name": "Multi-Plot 3x3 Seeder", "icon": "🌾", "tier": "Reinforced", "desc": "Menyemai 9 petak lahan sekaligus dalam 1 kali ayunan.", "upgrade_cost_gold": 1900},
    {"id": "tool_crop_research_station", "category": "farming", "name": "Advanced Crop Research Station", "icon": "🔬", "tier": "Celestial", "desc": "Meja sintesis benih legendaris hibrida tahan hama.", "upgrade_cost_gold": 4500},

    # 3. Mining & Crafting Tools (10)
    {"id": "tool_geological_hammer", "category": "mining", "name": "Geological Hammer", "icon": "🔨", "tier": "Reinforced", "desc": "Memecah batuan keras dan geoda tambang dengan 1 pukulan bersih.", "upgrade_cost_gold": 1200},
    {"id": "tool_crystal_detector", "category": "mining", "name": "Crystal Resonance Detector", "icon": "📡", "tier": "Arcane", "desc": "Mendeteksi urat bijih mythril dan permata di balik dinding batu gua.", "upgrade_cost_gold": 2100},
    {"id": "tool_mineral_sorter", "category": "mining", "name": "Mineral Sorting Machine", "icon": "⚙️", "tier": "Advanced", "desc": "Menyortir hasil tambang secara otomatis ke peti penyimpanan.", "upgrade_cost_gold": 2000},
    {"id": "tool_portable_smelter", "category": "mining", "name": "Portable Smelting Unit", "icon": "🔥", "tier": "Reinforced", "desc": "Tungku lipat untuk melebur bijih langsung di mulut gua tambang.", "upgrade_cost_gold": 1600},
    {"id": "tool_cavern_lantern", "category": "mining", "name": "Deep-Cavern Glow Lantern", "icon": "🏮", "tier": "Basic", "desc": "Lentera bercahaya abadi yang menembus kegelapan pekat lantai tambang dalam.", "upgrade_cost_gold": 850},
    {"id": "tool_ore_separator", "category": "mining", "name": "Centrifugal Ore Separator", "icon": "🌪️", "tier": "Arcane", "desc": "Memisahkan debu emas murni dari kerikil tambang kasar.", "upgrade_cost_gold": 2700},
    {"id": "tool_relic_brush", "category": "mining", "name": "Relic Excavation Brush", "icon": "🖌️", "tier": "Basic", "desc": "Kuas serat halus arkeologi untuk membersihkan artefak kuno tanpa goresan.", "upgrade_cost_gold": 750},
    {"id": "tool_mining_cart", "category": "mining", "name": "Automated Mining Cart", "icon": "🛒", "tier": "Advanced", "desc": "Gerobak lori cerdas yang mengangkut batuan tambang ke permukaan.", "upgrade_cost_gold": 2300},
    {"id": "tool_blueprint_bench", "category": "mining", "name": "Portable Blueprint Bench", "icon": "📐", "tier": "Reinforced", "desc": "Meja gambar skema arsitektur lapangan untuk konstruksi cepat.", "upgrade_cost_gold": 1400},
    {"id": "tool_modular_fabricator", "category": "mining", "name": "Modular Fabrication Station", "icon": "🏭", "tier": "Celestial", "desc": "Pabrik miniatur untuk mencetak suku cadang mesin berteknologi tinggi.", "upgrade_cost_gold": 5000},

    # 4. Magic & Technology Tools (10)
    {"id": "tool_mana_lantern", "category": "magic_tech", "name": "Aether Mana Lantern", "icon": "✨", "tier": "Arcane", "desc": "Memancarkan aura yang mempercepat regenerasi stamina pemain.", "upgrade_cost_gold": 2200},
    {"id": "tool_rune_engraver", "category": "magic_tech", "name": "Rune Engraving Chisel", "icon": "✒️", "tier": "Reinforced", "desc": "Mengukir rune perlindungan dan keberuntungan pada dinding rumah.", "upgrade_cost_gold": 1700},
    {"id": "tool_arcane_compass", "category": "magic_tech", "name": "Celestial Arcane Compass", "icon": "🧭", "tier": "Astral", "desc": "Menunjuk ke arah koordinat portal dimensi aktif berikutnya.", "upgrade_cost_gold": 3100},
    {"id": "tool_energy_conduit", "category": "magic_tech", "name": "Energy Conduit Kit", "icon": "⚡", "tier": "Advanced", "desc": "Menghubungkan generator listrik kristal ke seluruh mesin desa.", "upgrade_cost_gold": 2400},
    {"id": "tool_teleport_anchor", "category": "magic_tech", "name": "Dimensional Teleport Anchor", "icon": "🌀", "tier": "Celestial", "desc": "Jangkar teleportasi instan langsung kembali ke depan rumah kebun.", "upgrade_cost_gold": 5500},
    {"id": "tool_weather_observatory", "category": "magic_tech", "name": "Atmospheric Weather Pylon", "icon": "🌦️", "tier": "Astral", "desc": "Pylon peredam badai petir untuk melindungi tanaman berharga.", "upgrade_cost_gold": 3800},
    {"id": "tool_robotics_terminal", "category": "magic_tech", "name": "Portable Robotics Terminal", "icon": "💻", "tier": "Advanced", "desc": "Mengirim perintah penjadwalan langsung ke armada robot di kebun.", "upgrade_cost_gold": 2500},
    {"id": "tool_quantum_storage", "category": "magic_tech", "name": "Quantum Storage Link", "icon": "📦", "tier": "Astral", "desc": "Akses peti lumbung desa dari lokasi manapun di dunia.", "upgrade_cost_gold": 4200},
    {"id": "tool_celestial_telescope", "category": "magic_tech", "name": "Celestial Telescope Lens", "icon": "🔭", "tier": "Celestial", "desc": "Mengamati hujan meteor Starfall dan memanen debu bintang.", "upgrade_cost_gold": 6000},
    {"id": "tool_restoration_console", "category": "magic_tech", "name": "World Restoration Console", "icon": "🏛️", "tier": "Celestial", "desc": "Konsol arsitektur pusat untuk mengelola seluruh proyek restorasi dunia.", "upgrade_cost_gold": 6500}
]

LOADOUT_PRESETS = [
    {"id": "loadout_farming", "name": "Agronomi & Kebun (Farming)", "icon": "🌾", "tools": ["tool_precision_planter", "tool_smart_irrigator", "tool_soil_scanner"]},
    {"id": "loadout_mining", "name": "Eksplorasi Tambang (Mining)", "icon": "⛏️", "tools": ["tool_geological_hammer", "tool_crystal_detector", "tool_cavern_lantern"]},
    {"id": "loadout_fishing", "name": "Pelayaran & Mancing (Ocean)", "icon": "🎣", "tools": ["tool_diving_suit", "tool_surveyor_compass", "tool_mana_lantern"]},
    {"id": "loadout_exploration", "name": "Penjelajah Semesta (Exploration)", "icon": "🧭", "tools": ["tool_glider", "tool_grapple_device", "tool_thermal_suit"]},
    {"id": "loadout_crafting", "name": "Arsitek & Bengkel (Crafting)", "icon": "🔨", "tools": ["tool_blueprint_bench", "tool_modular_fabricator", "tool_rune_engraver"]},
    {"id": "loadout_social", "name": "Diplomat Kota (Social)", "icon": "🤝", "tools": ["tool_field_notebook", "tool_camera_drone", "tool_teleport_anchor"]}
]

class ToolsAdvancedEngine:
    """Manages 40 advanced tools, tier progression, durability, and loadout configuration."""

    @staticmethod
    def ensure_tools_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure player profile contains advanced tools inventory and active loadout."""
        if "advanced_tools" not in player:
            player["advanced_tools"] = {
                "tool_surveyor_compass": {"tier": "Arcane", "durability": 100, "upgrades_count": 0},
                "tool_precision_planter": {"tier": "Reinforced", "durability": 100, "upgrades_count": 0},
                "tool_geological_hammer": {"tier": "Reinforced", "durability": 100, "upgrades_count": 0},
                "tool_portable_camp": {"tier": "Basic", "durability": 100, "upgrades_count": 0}
            }
        if "active_loadout" not in player:
            player["active_loadout"] = "loadout_farming"
        return player

    @staticmethod
    def get_tools_catalog(player: Dict[str, Any]) -> Dict[str, Any]:
        """Return catalog of all 40 tools with ownership and upgrade status."""
        ToolsAdvancedEngine.ensure_tools_state(player)
        owned_tools = player.get("advanced_tools", {})

        tools_with_status = []
        for t in ADVANCED_TOOLS_CATALOG:
            is_owned = t["id"] in owned_tools
            t_meta = owned_tools.get(t["id"], {})
            tools_with_status.append({
                **t,
                "is_owned": is_owned,
                "durability": t_meta.get("durability", 100),
                "upgrades_count": t_meta.get("upgrades_count", 0),
                "current_tier": t_meta.get("tier", t["tier"])
            })

        return {
            "tools": tools_with_status,
            "loadouts": LOADOUT_PRESETS,
            "active_loadout": player.get("active_loadout", "loadout_farming")
        }

    @staticmethod
    def upgrade_tool(player: Dict[str, Any], tool_id: str) -> Dict[str, Any]:
        """Upgrade tool tier enhancing durability and efficiency."""
        ToolsAdvancedEngine.ensure_tools_state(player)

        found_tool = next((t for t in ADVANCED_TOOLS_CATALOG if t["id"] == tool_id), None)
        if not found_tool:
            return {"success": False, "error": f"Perkakas '{tool_id}' tidak ditemukan di katalog."}

        cost = found_tool["upgrade_cost_gold"]
        if player.get("gold", 0) < cost:
            return {"success": False, "error": f"Koin tidak cukup! Butuh {cost} koin, tersedia {player.get('gold', 0)} koin."}

        player["gold"] -= cost
        tools = player["advanced_tools"]

        if tool_id not in tools:
            tools[tool_id] = {"tier": found_tool["tier"], "durability": 100, "upgrades_count": 1}
        else:
            tools[tool_id]["upgrades_count"] = tools[tool_id].get("upgrades_count", 0) + 1
            tools[tool_id]["durability"] = 100

        # Tier progression: Basic -> Reinforced -> Advanced -> Arcane -> Astral -> Celestial
        tier_order = ["Basic", "Reinforced", "Advanced", "Arcane", "Astral", "Celestial"]
        cur_tier = tools[tool_id].get("tier", found_tool["tier"])
        try:
            cur_idx = tier_order.index(cur_tier)
            next_tier = tier_order[min(len(tier_order) - 1, cur_idx + 1)]
        except ValueError:
            next_tier = "Celestial"

        tools[tool_id]["tier"] = next_tier

        return {
            "success": True,
            "tool_id": tool_id,
            "tool_name": found_tool["name"],
            "new_tier": next_tier,
            "upgrades_count": tools[tool_id]["upgrades_count"],
            "remaining_gold": player["gold"],
            "message": f"⭐ Perkakas '{found_tool['name']}' berhasil ditingkatkan ke Tingkat {next_tier}!"
        }

    @staticmethod
    def set_active_loadout(player: Dict[str, Any], loadout_id: str) -> Dict[str, Any]:
        """Equip an equipment loadout preset."""
        ToolsAdvancedEngine.ensure_tools_state(player)

        found_preset = next((l for l in LOADOUT_PRESETS if l["id"] == loadout_id), None)
        if not found_preset:
            return {"success": False, "error": f"Preset perlengkapan '{loadout_id}' tidak valid."}

        player["active_loadout"] = loadout_id

        return {
            "success": True,
            "loadout_id": loadout_id,
            "loadout_name": found_preset["name"],
            "equipped_tools": found_preset["tools"],
            "message": f"Set perlengkapan '{found_preset['name']}' berhasil dipasang!"
        }
