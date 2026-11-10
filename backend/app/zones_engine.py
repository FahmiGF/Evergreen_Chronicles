# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - World Expansion & Zones Engine (V7)
10 Unique Regions, Environmental Profiles, Landmarks, Fast Travel,
and Balanced Multi-Requirement Progression Unlocks.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

ZONES_CATALOG = [
    {
        "id": "ancient_forest",
        "name": "Whispering Ancient Forest",
        "tier": "Early Game",
        "biome": "Ancient Temperate Rainforest",
        "icon": "🌲",
        "banner_color": "#166534",
        "atmosphere": "Hutan kuno berkabut lembut dengan pohon raksasa ribuan tahun, jamur bercahaya, dan sungai tersembunyi.",
        "lighting": "Emerald Canopy Sunbeams (Lembayung Hijau Zamrud)",
        "soundtrack": "Melodi Bisikan Dahan Rimba (Flute & Acoustic Harp)",
        "resources": [
            {"id": "mat_ancient_wood", "name": "Ancient Wood", "icon": "🪵", "rarity": "rare"},
            {"id": "herb_moonleaf", "name": "Moonleaf Herb", "icon": "🌿", "rarity": "uncommon"},
            {"id": "shroom_spirit", "name": "Spirit Mushroom", "icon": "🍄", "rarity": "rare"}
        ],
        "features": [
            "Restorasi Hutan Leluhur (Forest Restoration)",
            "Pengumpulan Herba Mistis (Rare Herb Gathering)",
            "Kuil Rahasia Rimba (Hidden Shrines)"
        ],
        "boss_id": "boss_grove_guardian",
        "boss_name": "The Ancient Grove Guardian",
        "unlock_rules": {
            "type": "starter",
            "desc": "Terbuka sejak awal perjalanan untuk eksplorasi rimba.",
            "min_level": 1
        },
        "landmarks": [
            {"id": "lm_elder_tree", "name": "Pohon Induk Yggdrasil Kecil", "discovered": True},
            {"id": "lm_moss_altar", "name": "Altar Lumut Purba", "discovered": False},
            {"id": "lm_whispering_falls", "name": "Air Terjun Berbisik", "discovered": False}
        ],
        "fast_travel_cost": 0
    },
    {
        "id": "crystal_caverns",
        "name": "Crystaldeep Caverns",
        "tier": "Early Game",
        "biome": "Subterranean Bioluminescent Geode",
        "icon": "💎",
        "banner_color": "#0284c7",
        "atmosphere": "Jaringan gua bawah tanah berpendar dengan pilar kristal raksasa, danau subterranean, dan relik tambang kuno.",
        "lighting": "Sapphire & Quartz Glow (Pendar Kristal Safir)",
        "soundtrack": "Gema Tetesan Air Stalaktit & Lonceng Kristal",
        "resources": [
            {"id": "gem_star_crystal", "name": "Star Crystal", "icon": "✨", "rarity": "rare"},
            {"id": "mat_deepstone", "name": "Deepstone Mineral", "icon": "🪨", "rarity": "common"},
            {"id": "ore_luminous", "name": "Luminous Ore", "icon": "⛏️", "rarity": "uncommon"}
        ],
        "features": [
            "Ekspedisi Tambang Kedalaman (Mining Expeditions)",
            "Teka-teki Resonansi Kristal (Crystal Puzzles)",
            "Mancing Bawah Tanah (Underground Cave Fishing)"
        ],
        "boss_id": "boss_crystal_colossus",
        "boss_name": "The Crystal Colossus",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "mining",
            "level": 5,
            "desc": "Keahlian Mining mencapai Level 5+ dan memiliki Beliung Besi."
        },
        "landmarks": [
            {"id": "lm_geode_chamber", "name": "Ruang Geoda Raksasa", "discovered": False},
            {"id": "lm_abyssal_lake", "name": "Danau Cermin Subterranean", "discovered": False},
            {"id": "lm_abandoned_rail", "name": "Jalur Lori Tambang Kuno", "discovered": False}
        ],
        "fast_travel_cost": 10
    },
    {
        "id": "frostveil_highlands",
        "name": "Frostveil Highlands",
        "tier": "Mid Game",
        "biome": "Alpine Glacial Tundra",
        "icon": "❄️",
        "banner_color": "#38bdf8",
        "atmosphere": "Pegunungan salju abadi dengan permukiman pondok kayu hangat, danau beku berkilau, dan pemandangan aurora malam.",
        "lighting": "Arctic Aurora Veil (Tirai Cahaya Kutub Biru)",
        "soundtrack": "Balada Angin Gunung & Gesekan Kereta Luncur",
        "resources": [
            {"id": "ore_frost_iron", "name": "Frost Iron", "icon": "🛡️", "rarity": "rare"},
            {"id": "mat_aurora_shard", "name": "Aurora Shards", "icon": "🔮", "rarity": "epic"},
            {"id": "flw_ice_bloom", "name": "Ice Bloom Flower", "icon": "🌸", "rarity": "uncommon"}
        ],
        "features": [
            "Penjelajahan Salju Tebal (Snow Exploration)",
            "Balap Kereta Luncur Sled (Sled Racing)",
            "Mancing Lubang Es (Ice Fishing)"
        ],
        "boss_id": "boss_frostbound_warden",
        "boss_name": "The Frostbound Warden",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "foraging",
            "level": 12,
            "desc": "Keahlian Foraging Level 12+ dan memiliki Pakaian Berinsulasi Hangat."
        },
        "landmarks": [
            {"id": "lm_glacial_citadel", "name": "Observatorium Puncak Es", "discovered": False},
            {"id": "lm_frozen_basin", "name": "Lembah Danau Membeku", "discovered": False},
            {"id": "lm_aurora_plateau", "name": "Dataran Tinggi Cahaya Bintang", "discovered": False}
        ],
        "fast_travel_cost": 25
    },
    {
        "id": "sunscar_desert",
        "name": "Sunscar Desert",
        "tier": "Mid Game",
        "biome": "Arid Sand Dunes & Ancient Oases",
        "icon": "🏜️",
        "banner_color": "#d97706",
        "atmosphere": "Gurun pasir luas bergelombang dengan oasis air zamrud, reruntuhan istana sultan kuno, dan karavan unta berniaga.",
        "lighting": "Golden Mirage Daylight (Kuning Emas Gurun Surya)",
        "soundtrack": "Petikan Gambus Gurun & Gemerincing Lonceng Karavan",
        "resources": [
            {"id": "gem_sunstone", "name": "Sunstone Crystal", "icon": "☀️", "rarity": "rare"},
            {"id": "mat_desert_glass", "name": "Desert Glass", "icon": "🍶", "rarity": "uncommon"},
            {"id": "art_ancient_relics", "name": "Ancient Oasis Relics", "icon": "🏺", "rarity": "epic"}
        ],
        "features": [
            "Perniagaan Karavan Sutra (Caravan Trading)",
            "Ekskavasi Arkeologi Gurun (Desert Archaeology)",
            "Pertanian Irigasi Oasis (Oasis Farming)"
        ],
        "boss_id": "boss_sandstone_sovereign",
        "boss_name": "The Sandstone Sovereign",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "trading",
            "level": 15,
            "desc": "Keahlian Trading Level 15+ atau menyelesaikan Kontrak Pasar Desa."
        },
        "landmarks": [
            {"id": "lm_mirage_oasis", "name": "Oasis Air Zamrud Al-Zahra", "discovered": False},
            {"id": "lm_pharaoh_tomb", "name": "Makam Monolit Pasir", "discovered": False},
            {"id": "lm_bazaar_ruins", "name": "Reruntuhan Pasar Sutra Kuno", "discovered": False}
        ],
        "fast_travel_cost": 30
    },
    {
        "id": "skyreach_archipelago",
        "name": "Skyreach Archipelago",
        "tier": "Advanced",
        "biome": "Floating Celestial Islands",
        "icon": "☁️",
        "banner_color": "#6366f1",
        "atmosphere": "Gugusan kepulauan melayang di atas lapisan awan putih tebal, air terjun jatuh ke angkasa, dan perahu layar terbang.",
        "lighting": "Ethereal Cloud Sunset (Violet & Pink Lembayung Awan)",
        "soundtrack": "Orkestra Angin Angkasa & Koor Khidmat Aether",
        "resources": [
            {"id": "mat_cloudstone", "name": "Cloudstone", "icon": "🪨", "rarity": "rare"},
            {"id": "gem_sky_crystal", "name": "Sky Crystal", "icon": "💎", "rarity": "rare"},
            {"id": "mat_wind_essence", "name": "Wind Essence", "icon": "💨", "rarity": "epic"}
        ],
        "features": [
            "Terbang Paralayang Bebas (Gliding & Wind Currents)",
            "Rute Kapal Udara Zeppelin (Airship Routes)",
            "Petak Kebun Terapung (Floating Farm Plots)"
        ],
        "boss_id": "boss_tempest_architect",
        "boss_name": "The Tempest Architect",
        "unlock_rules": {
            "type": "quest_req",
            "quest_id": "qst_sky_beacon",
            "desc": "Membuat Glider Mekanikal dan mengaktifkan Pylon Navigasi Awan."
        },
        "landmarks": [
            {"id": "lm_aether_waterfall", "name": "Air Terjun Awan Bidadari", "discovered": False},
            {"id": "lm_zephyr_dock", "name": "Dermaga Kapal Udara Kuno", "discovered": False},
            {"id": "lm_storm_altar", "name": "Altar Pengendali Badai", "discovered": False}
        ],
        "fast_travel_cost": 45
    },
    {
        "id": "mycelia_wilds",
        "name": "Mycelia Wilds",
        "tier": "Mid Game",
        "biome": "Giant Luminescent Fungus Bog",
        "icon": "🍄",
        "banner_color": "#a855f7",
        "atmosphere": "Hutan rimbun jamur payung raksasa multiwarna dengan spora bercahaya mengapung, kabut ungu hangat, dan flora responsif.",
        "lighting": "Bioluminescent Neon Violet & Teal",
        "soundtrack": "Ketukan Ritmis Bas Perkusi Alami Hutan Spora",
        "resources": [
            {"id": "mat_mycelium_fiber", "name": "Mycelium Fiber", "icon": "🧵", "rarity": "uncommon"},
            {"id": "shroom_dreamcap", "name": "Dreamcap Mushroom", "icon": "🍄", "rarity": "rare"},
            {"id": "mat_spore_resin", "name": "Spore Resin", "icon": "🧪", "rarity": "rare"}
        ],
        "features": [
            "Kultivasi Jamur Medis (Mushroom Cultivation)",
            "Riset Laboratorium Spora (Spore Research)",
            "Restorasi Ekosistem Rawa (Ecosystem Restoration)"
        ],
        "boss_id": "boss_mycelium_heart",
        "boss_name": "The Mycelium Heart",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "herbalism",
            "level": 14,
            "desc": "Keahlian Herbalism Level 14+ atau memiliki Ramuan Penawar Racun Spora."
        },
        "landmarks": [
            {"id": "lm_great_dreamcap", "name": "Pohon Jamur Raksasa 100 Tahun", "discovered": False},
            {"id": "lm_glow_marsh", "name": "Rawa Pendar Biru Malam", "discovered": False},
            {"id": "lm_symbiosis_well", "name": "Mata Air Simbiosis Spora", "discovered": False}
        ],
        "fast_travel_cost": 25
    },
    {
        "id": "emberfall_caldera",
        "name": "Emberfall Caldera",
        "tier": "Advanced",
        "biome": "Volcanic Magma Basin & Hot Springs",
        "icon": "🌋",
        "banner_color": "#dc2626",
        "atmosphere": "Pulau kawah vulkanik aktif dengan pantai berpasir hitam obsidian, semburan geyser air panas belerang, dan lelehan magma.",
        "lighting": "Magma Crimson & Smoldering Ember",
        "soundtrack": "Gemuruh Denyut Vulkanik & Hembusan Uap Geotermal",
        "resources": [
            {"id": "ore_emberstone", "name": "Emberstone", "icon": "🔥", "rarity": "rare"},
            {"id": "mat_volcanic_glass", "name": "Volcanic Glass", "icon": "🗡️", "rarity": "uncommon"},
            {"id": "core_heat", "name": "Heat Core", "icon": "⚡", "rarity": "epic"}
        ],
        "features": [
            "Pembangkit Energi Geotermal (Geothermal Energy)",
            "Tanaman Tahan Suhu Ekstrem (Heat-Resistant Crops)",
            "Pengolahan Peleburan Logam Suhu Tinggi (Advanced Smelting)"
        ],
        "boss_id": "boss_emberheart_titan",
        "boss_name": "The Emberheart Titan",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "smithing",
            "level": 20,
            "desc": "Keahlian Smithing Level 20+ dan memiliki Pakaian Tahan Panas Lahar."
        },
        "landmarks": [
            {"id": "lm_magma_vent", "name": "Siklus Ventilasi Magma Utama", "discovered": False},
            {"id": "lm_obsidian_beach", "name": "Pantai Hitam Pasir Obsidian", "discovered": False},
            {"id": "lm_sulfur_springs", "name": "Pemandian Air Panas Belerang", "discovered": False}
        ],
        "fast_travel_cost": 40
    },
    {
        "id": "thalassia_deep",
        "name": "Thalassia Deep",
        "tier": "Advanced",
        "biome": "Abyssal Coral Reef & Sunken Kingdom",
        "icon": "🌊",
        "banner_color": "#0d9488",
        "atmosphere": "Kerajaan laut dalam bertabur terumbu karang bercahaya, reruntuhan istana marmer tenggelam, dan biota laut raksasa.",
        "lighting": "Deep Aquamarine Bioluminescence",
        "soundtrack": "Dentingan Sonar Halus & Gemercik Kedalaman Samudra",
        "resources": [
            {"id": "gem_pearlstone", "name": "Pearlstone", "icon": "🦪", "rarity": "rare"},
            {"id": "mat_coral_glass", "name": "Coral Glass", "icon": "🪸", "rarity": "uncommon"},
            {"id": "herb_abyssal_kelp", "name": "Abyssal Kelp", "icon": "🌿", "rarity": "rare"}
        ],
        "features": [
            "Perkebunan Rumput Laut Sub-Akuatik (Underwater Farms)",
            "Ekspedisi Kapal Selam Riset (Submarine Expeditions)",
            "Konservasi Biota Karang Abyssal (Marine Research)"
        ],
        "boss_id": "boss_abyssal_sentinel",
        "boss_name": "The Abyssal Sentinel",
        "unlock_rules": {
            "type": "skill_req",
            "skill": "diving",
            "level": 18,
            "desc": "Keahlian Diving Level 18+ dan memiliki Baju Selam Bertekanan Tinggi."
        },
        "landmarks": [
            {"id": "lm_sunken_throne", "name": "Tahta Raja Mutiara Tenggelam", "discovered": False},
            {"id": "lm_lumina_trench", "name": "Palung Karang Bercahaya", "discovered": False},
            {"id": "lm_submarine_haven", "name": "Pangkalan Palka Bawah Air", "discovered": False}
        ],
        "fast_travel_cost": 45
    },
    {
        "id": "verdant_ruins",
        "name": "Verdant Kingdom Ruins",
        "tier": "Late Game",
        "biome": "Overgrown Classical Citadel",
        "icon": "🏛️",
        "banner_color": "#4b5563",
        "atmosphere": "Bekas ibukota peradaban megah masa lampau yang diselimuti akar pohon raksasa, perpustakaan kuno, dan teknologi automaton tertidur.",
        "lighting": "Golden Hour Sunlight through Broken Arches",
        "soundtrack": "Orkestra Simfoni Nostalgia Masa Keemasan Raja",
        "resources": [
            {"id": "mat_royal_timber", "name": "Royal Timber", "icon": "🪵", "rarity": "epic"},
            {"id": "bp_lost_architect", "name": "Lost Blueprints", "icon": "📜", "rarity": "legendary"},
            {"id": "mat_relic_alloy", "name": "Relic Alloy Ingot", "icon": "🔩", "rarity": "epic"}
        ],
        "features": [
            "Proyek Rekonstruksi Istana (Restoration Projects)",
            "Arsip Sejarah Leluhur (Historical Research)",
            "Rangkaian Misi Mahkota Kerajaan (Royal Quests)"
        ],
        "boss_id": "boss_last_crownkeeper",
        "boss_name": "The Last Crownkeeper",
        "unlock_rules": {
            "type": "restoration_milestone",
            "milestone_count": 3,
            "desc": "Menyelesaikan minimal 3 proyek restorasi peradaban dunia."
        },
        "landmarks": [
            {"id": "lm_royal_library", "name": "Perpustakaan Naskah Kuno Istana", "discovered": False},
            {"id": "lm_grand_cathedral", "name": "Katedral Kolom Granit Terukir", "discovered": False},
            {"id": "lm_vault_of_kings", "name": "Bilik Penyimpanan Rahasia Kerajaan", "discovered": False}
        ],
        "fast_travel_cost": 60
    },
    {
        "id": "astral_frontier",
        "name": "Astral Frontier",
        "tier": "Endgame",
        "biome": "Cosmic Nebular Observatory",
        "icon": "🌌",
        "banner_color": "#581c87",
        "atmosphere": "Observatorium terapung di perbatasan ruang kosmik dengan debu nebula berkilauan, pecahan asteroid kristal, dan rahasia penciptaan semesta.",
        "lighting": "Cosmic Ultraviolet & Starlight Iridescence",
        "soundtrack": "Melodi Sintesis Suara Alam Semesta & Resonansi Aether Murni",
        "resources": [
            {"id": "ore_astral", "name": "Astral Ore", "icon": "🌠", "rarity": "legendary"},
            {"id": "mat_nebula_glass", "name": "Nebula Glass", "icon": "🔮", "rarity": "epic"},
            {"id": "seed_celestial", "name": "Celestial Seeds", "icon": "✨", "rarity": "legendary"}
        ],
        "features": [
            "Riset Astrofisika Lanjutan (Advanced Astral Research)",
            "Pertanian Kosmik di Ruang Hampa (Cosmic Gardening)",
            "Ekspedisi Gerbang Singularitas (Singularity Portal Expeditions)"
        ],
        "boss_id": "boss_astral_paragon",
        "boss_name": "The Astral Paragon",
        "unlock_rules": {
            "type": "mastery_req",
            "desc": "Mencapai Prestige Rank 3+ dan membuka minimal 100 entri Grand Encyclopedia."
        },
        "landmarks": [
            {"id": "lm_astral_observatory", "name": "Observatorium Teleskop Bintang Raksasa", "discovered": False},
            {"id": "lm_singularity_gate", "name": "Pusaran Gerbang Kosmik Purba", "discovered": False},
            {"id": "lm_stardust_greenhouse", "name": "Rumah Kaca Benih Bintang", "discovered": False}
        ],
        "fast_travel_cost": 100
    }
]

class ZonesEngine:
    """Manages 10 world regions, unlock checks, fast travel, landmarks, and atmospheric presets."""

    @staticmethod
    def ensure_zones_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure unlocked zones and discovered landmarks structures exist in player profile."""
        if "unlocked_zones" not in player:
            player["unlocked_zones"] = ["ancient_forest"]
        if "discovered_landmarks" not in player:
            player["discovered_landmarks"] = ["lm_elder_tree"]
        if "current_zone_id" not in player:
            player["current_zone_id"] = "ancient_forest"
        return player

    @staticmethod
    def get_all_zones(player: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Return list of all 10 zones with player unlock status and landmark discoveries."""
        ZonesEngine.ensure_zones_state(player)
        unlocked_set = set(player.get("unlocked_zones", ["ancient_forest"]))
        disc_landmarks = set(player.get("discovered_landmarks", []))

        zones = []
        for z in ZONES_CATALOG:
            z_copy = dict(z)
            z_copy["is_unlocked"] = z["id"] in unlocked_set
            
            # Map discovered landmarks
            landmarks_with_status = []
            for lm in z.get("landmarks", []):
                landmarks_with_status.append({
                    **lm,
                    "discovered": lm["id"] in disc_landmarks
                })
            z_copy["landmarks"] = landmarks_with_status
            zones.append(z_copy)

        return zones

    @staticmethod
    def check_unlock_eligibility(player: Dict[str, Any], zone_id: str) -> Dict[str, Any]:
        """Verify whether player satisfies conditions to unlock a target zone."""
        found_zone = next((z for z in ZONES_CATALOG if z["id"] == zone_id), None)
        if not found_zone:
            return {"eligible": False, "error": f"Zona '{zone_id}' tidak ditemukan di katalog semesta."}

        rule = found_zone.get("unlock_rules", {})
        rule_type = rule.get("type", "starter")

        if rule_type == "starter":
            return {"eligible": True}

        elif rule_type == "skill_req":
            skill_id = rule.get("skill")
            req_lvl = rule.get("level", 1)
            player_skills = player.get("skills", {})
            cur_lvl = player_skills.get(skill_id, {}).get("level", 1)
            if cur_lvl >= req_lvl:
                return {"eligible": True}
            return {
                "eligible": False,
                "error": f"Syarat belum terpenuhi: Butuh keahlian '{skill_id}' Level {req_lvl}+ (Saat ini: Lv. {cur_lvl})."
            }

        elif rule_type == "restoration_milestone":
            req_count = rule.get("milestone_count", 3)
            completed_projects = len(player.get("completed_restoration_projects", []))
            if completed_projects >= req_count:
                return {"eligible": True}
            return {
                "eligible": False,
                "error": f"Syarat belum terpenuhi: Butuh {req_count} Proyek Restorasi Peradaban selesai (Saat ini: {completed_projects})."
            }

        elif rule_type == "mastery_req":
            prestige_rank = player.get("prestige_rank", 1)
            enc_count = len(player.get("encyclopedia_discoveries", {}))
            if prestige_rank >= 3 and enc_count >= 10:
                return {"eligible": True}
            return {
                "eligible": False,
                "error": f"Syarat belum terpenuhi: Butuh Prestige Rank 3+ dan 10+ Entri Ensiklopedia (Saat ini: Rank {prestige_rank}, {enc_count} Entri)."
            }

        return {"eligible": True}

    @staticmethod
    def unlock_zone(player: Dict[str, Any], zone_id: str) -> Dict[str, Any]:
        """Unlock a region for the player if requirements are satisfied."""
        ZonesEngine.ensure_zones_state(player)
        if zone_id in player["unlocked_zones"]:
            return {"success": True, "already_unlocked": True, "message": f"Zona '{zone_id}' sudah terbuka sebelumnya."}

        eligibility = ZonesEngine.check_unlock_eligibility(player, zone_id)
        if not eligibility["eligible"]:
            return {"success": False, "error": eligibility.get("error", "Syarat membuka zona belum terpenuhi.")}

        player["unlocked_zones"].append(zone_id)
        found_zone = next((z for z in ZONES_CATALOG if z["id"] == zone_id), None)
        zone_name = found_zone["name"] if found_zone else zone_id

        return {
            "success": True,
            "zone_id": zone_id,
            "zone_name": zone_name,
            "unlocked_zones": player["unlocked_zones"],
            "message": f"🎉 Wilayah Baru Terbuka: '{zone_name}' kini dapat dijelajahi!"
        }

    @staticmethod
    def fast_travel(player: Dict[str, Any], zone_id: str) -> Dict[str, Any]:
        """Fast travel to an unlocked zone deducting travel costs."""
        ZonesEngine.ensure_zones_state(player)
        if zone_id not in player["unlocked_zones"]:
            return {"success": False, "error": f"Wilayah '{zone_id}' belum terbuka untuk fast travel."}

        found_zone = next((z for z in ZONES_CATALOG if z["id"] == zone_id), None)
        if not found_zone:
            return {"success": False, "error": "Zona tujuan tidak valid."}

        cost = found_zone.get("fast_travel_cost", 0)
        current_gold = player.get("gold", 0)
        if current_gold < cost:
            return {"success": False, "error": f"Koin tidak mencukupi untuk perjalanan. Butuh {cost} koin, tersedia {current_gold} koin."}

        player["gold"] -= cost
        player["current_zone_id"] = zone_id

        return {
            "success": True,
            "zone_id": zone_id,
            "zone_name": found_zone["name"],
            "remaining_gold": player["gold"],
            "atmosphere": found_zone["atmosphere"],
            "lighting": found_zone["lighting"],
            "soundtrack": found_zone["soundtrack"],
            "message": f"Perjalanan berhasil! Anda kini tiba di {found_zone['name']}."
        }

    @staticmethod
    def discover_landmark(player: Dict[str, Any], zone_id: str, landmark_id: str) -> Dict[str, Any]:
        """Record landmark discovery in player's atlas."""
        ZonesEngine.ensure_zones_state(player)
        disc = player.setdefault("discovered_landmarks", [])

        if landmark_id in disc:
            return {"success": True, "already_discovered": True}

        disc.append(landmark_id)
        # Award exploration XP and bonus gold
        player["gold"] = player.get("gold", 0) + 150

        return {
            "success": True,
            "landmark_id": landmark_id,
            "bonus_gold": 150,
            "message": f"Pencapaian Ekplorasi: Titik mercu suar '{landmark_id}' berhasil dipetakan (+150 Koin)!"
        }
