# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Quests, Collections & Guilds Expansion Engine (V4)
Comprehensive Collection Journal, 25+ Achievements, and 7 Guilds System.
"""

from typing import Dict, List, Any, Optional

COLLECTIONS_CATALOG = {
    "crops": [
        {"id": "crop_parsnip", "name": "Parsnip Segar", "category": "Pertanian", "season": "Spring", "rarity": "Common", "value": 45},
        {"id": "crop_potato", "name": "Kentang Aetherwyn", "category": "Pertanian", "season": "Spring", "rarity": "Common", "value": 70},
        {"id": "crop_strawberry", "name": "Stroberi Manis", "category": "Pertanian", "season": "Spring", "rarity": "Uncommon", "value": 120},
        {"id": "crop_beetroot", "name": "Bit Merah", "category": "Pertanian", "season": "Spring", "rarity": "Common", "value": 60},
        {"id": "crop_corn", "name": "Jagung Emas", "category": "Pertanian", "season": "Summer/Fall", "rarity": "Common", "value": 80},
        {"id": "crop_tomato", "name": "Tomat Segar", "category": "Pertanian", "season": "Summer", "rarity": "Common", "value": 55},
        {"id": "crop_moonberry", "name": "Moonberry Ajaib", "category": "Pertanian", "season": "All", "rarity": "Rare", "value": 240},
        {"id": "crop_wheat", "name": "Gandum Emas", "category": "Pertanian", "season": "Fall", "rarity": "Common", "value": 50},
        {"id": "crop_golden_pumpkin", "name": "Labu Emas Raksasa", "category": "Pertanian", "season": "Fall", "rarity": "Epic", "value": 450},
        {"id": "crop_ghost_pumpkin", "name": "Labu Hantu Halloween", "category": "Musiman", "season": "Autumn", "rarity": "Epic", "value": 350}
    ],
    "minerals": [
        {"id": "mat_stone", "name": "Batu Tambang Kasar", "category": "Mineral", "rarity": "Common", "value": 5},
        {"id": "mat_coal", "name": "Batu Bara Hitam", "category": "Mineral", "rarity": "Common", "value": 18},
        {"id": "mat_copper_ore", "name": "Bijih Tembaga", "category": "Mineral", "rarity": "Common", "value": 25},
        {"id": "mat_iron_ore", "name": "Bijih Besi", "category": "Mineral", "rarity": "Common", "value": 45},
        {"id": "mat_silver_ore", "name": "Bijih Perak", "category": "Mineral", "rarity": "Uncommon", "value": 80},
        {"id": "mat_gold_ore", "name": "Bijih Emas", "category": "Mineral", "rarity": "Uncommon", "value": 130},
        {"id": "mat_quartz", "name": "Kristal Kuarsa Murni", "category": "Permata", "rarity": "Uncommon", "value": 95},
        {"id": "mat_emerald", "name": "Zamrud Hijau", "category": "Permata", "rarity": "Rare", "value": 260},
        {"id": "mat_ruby", "name": "Batu Rubi Delima", "category": "Permata", "rarity": "Rare", "value": 340},
        {"id": "mat_sapphire", "name": "Batu Safir Laut", "category": "Permata", "rarity": "Rare", "value": 380},
        {"id": "mat_mythril_ore", "name": "Bijih Mythril Biru", "category": "Logam Langka", "rarity": "Epic", "value": 550},
        {"id": "mat_star_crystal", "name": "Kristal Bintang Jatuh", "category": "Relik Bintang", "rarity": "Legendary", "value": 950},
        {"id": "mat_ancient_core", "name": "Inti Mesin Purba", "category": "Teknologi", "rarity": "Legendary", "value": 1400}
    ],
    "fish": [
        {"id": "fish_parsnip_minnow", "name": "Minnow Sungai Tenang", "category": "Ikan Air Tawar", "rarity": "Common", "value": 30},
        {"id": "fish_rainbow_trout", "name": "Trout Pelangi Berkilau", "category": "Ikan Air Tawar", "rarity": "Common", "value": 55},
        {"id": "fish_silver_carp", "name": "Gurame Sisik Perak", "category": "Ikan Air Tawar", "rarity": "Common", "value": 45},
        {"id": "fish_coastal_mackerel", "name": "Tenggiri Pesisir Putih", "category": "Ikan Laut", "rarity": "Uncommon", "value": 85},
        {"id": "fish_coral_tang", "name": "Ikan Tang Karang Zamrud", "category": "Ikan Karang", "rarity": "Uncommon", "value": 120},
        {"id": "fish_luminescent_angler", "name": "Ikan Sungut Cahaya Abyssal", "category": "Ikan Palung Laut", "rarity": "Rare", "value": 320},
        {"id": "fish_frost_prowler", "name": "Kakap Salju Kutub", "category": "Ikan Laut Es", "rarity": "Rare", "value": 450},
        {"id": "fish_sunken_kingfin", "name": "Arwana Emas Istana Tenggelam", "category": "Ikan Legendaris", "rarity": "Legendary", "value": 1100},
        {"id": "fish_leviathan_koi", "name": "Koi Samudra Purba Leviathan", "category": "Ikan Legendaris", "rarity": "Legendary", "value": 1850}
    ]
}

ACHIEVEMENTS_CATALOG = [
    {"id": "ach_first_harvest", "name": "Panen Perdana", "desc": "Panen tanaman pertama Anda di ladang Aetherwyn.", "reward_gold": 100, "category": "Farming"},
    {"id": "ach_master_harvester", "name": "Raja Pertanian", "desc": "Capai keahlian Bertani Tingkat 20.", "reward_gold": 500, "category": "Farming"},
    {"id": "ach_mine_delver", "name": "Penjelajah Lapisan Goa", "desc": "Capai Lantai 10 di Goa Tambang.", "reward_gold": 300, "category": "Mining"},
    {"id": "ach_gem_collector", "name": "Kolektor Batu Mulia", "desc": "Kumpulkan zamrud, rubi, dan safir.", "reward_gold": 600, "category": "Mining"},
    {"id": "ach_first_fish", "name": "Tangkapan Pertama", "desc": "Pancing ikan pertama dari danau atau sungai.", "reward_gold": 100, "category": "Fishing"},
    {"id": "ach_ocean_voyager", "name": "Penjelajah Samudra Lepas", "desc": "Miliki kapal penjelajah laut.", "reward_gold": 800, "category": "Fishing"},
    {"id": "ach_mount_rider", "name": "Penunggang Sejati", "desc": "Kendarai tunggangan kuda atau rusa suci.", "reward_gold": 250, "category": "Mounts"},
    {"id": "ach_portal_explorer", "name": "Pelintas Dimensi", "desc": "Masuki portal dimensional timed.", "reward_gold": 400, "category": "Portals"},
    {"id": "ach_halloween_spirit", "name": "Semangat Labu Hantu", "desc": "Selesaikan trick-or-treat bersama warga.", "reward_gold": 350, "category": "Events"},
    {"id": "ach_industrial_builder", "name": "Arsitek Peradaban", "desc": "Bangun sedikitnya 4 fasilitas pabrik.", "reward_gold": 750, "category": "Building"}
]

GUILDS_CATALOG = [
    {"id": "guild_farmer", "name": "Guild Petani Aetherwyn (Farmer Guild)", "icon": "🌱", "perk": "+15% harga jual panen komoditas", "leader": "Rowan"},
    {"id": "guild_miner", "name": "Guild Penambang Besi (Miner Guild)", "icon": "⛏️", "perk": "-20% konsumsi stamina di tambang", "leader": "Brogun"},
    {"id": "guild_fisher", "name": "Guild Pelaut Samudra (Fisher Guild)", "icon": "🎣", "perk": "+25% peluang ikan kualitas emas", "leader": "Finneas"},
    {"id": "guild_explorer", "name": "Guild Penjelajah Dimensi (Explorer Guild)", "icon": "🧭", "perk": "Melihat sisa waktu portal lebih akurat", "leader": "Lysandra"},
    {"id": "guild_merchant", "name": "Guild Saudagar Kota (Merchant Guild)", "icon": "⚖️", "perk": "Diskon 10% untuk semua pembelian barang", "leader": "Cornelius"},
    {"id": "guild_builder", "name": "Guild Arsitek & Tukang (Builder Guild)", "icon": "🏛️", "perk": "-15% biaya material konstruksi gedung", "leader": "Magnus"},
    {"id": "guild_adventurer", "name": "Guild Petualang Rimba (Adventurer Guild)", "icon": "⚔️", "perk": "+20% perolehan EXP dari pertempuran", "leader": "Kael"}
]

class JournalEngine:
    """Manages collection encyclopedia tracking, achievement claims, and player guild affiliations."""

    @staticmethod
    def initialize_journal(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure collection journal, achievements, and guild data exist in player state."""
        if "journal_data" not in player:
            player["journal_data"] = {
                "discovered_items": ["crop_parsnip", "crop_potato", "crop_beetroot", "mat_stone", "mat_coal", "mat_copper_ore", "fish_parsnip_minnow"],
                "completed_achievements": ["ach_first_harvest", "ach_first_fish"],
                "claimed_achievements": ["ach_first_harvest"],
                "active_guild_id": "guild_farmer",
                "guild_rank": "Adept",
                "guild_reputation": 280
            }
        return player

    @staticmethod
    def get_collection_summary(player: Dict[str, Any]) -> Dict[str, Any]:
        """Return catalog categories, item discovery states, and completion percentage."""
        JournalEngine.initialize_journal(player)
        jdata = player["journal_data"]
        discovered = set(jdata.get("discovered_items", []))

        total_catalog = 0
        total_discovered = 0
        categories_data = {}

        for cat_key, items in COLLECTIONS_CATALOG.items():
            cat_list = []
            for item in items:
                total_catalog += 1
                is_disc = item["id"] in discovered
                if is_disc:
                    total_discovered += 1
                cat_list.append({
                    **item,
                    "discovered": is_disc
                })
            categories_data[cat_key] = cat_list

        pct = round((total_discovered / max(1, total_catalog)) * 100, 1)

        return {
            "total_items": total_catalog,
            "discovered_count": total_discovered,
            "completion_percentage": pct,
            "categories": categories_data
        }

    @staticmethod
    def claim_achievement(player: Dict[str, Any], achievement_id: str) -> Dict[str, Any]:
        """Claim gold reward for an achieved milestone."""
        JournalEngine.initialize_journal(player)
        jdata = player["journal_data"]

        ach = next((a for a in ACHIEVEMENTS_CATALOG if a["id"] == achievement_id), None)
        if not ach:
            return {"success": False, "error": f"Pencapaian '{achievement_id}' tidak valid."}

        if achievement_id in jdata.get("claimed_achievements", []):
            return {"success": False, "error": f"Hadiah untuk pencapaian '{ach['name']}' sudah pernah Anda klaim."}

        # Auto-mark as completed if claiming
        if achievement_id not in jdata.get("completed_achievements", []):
            jdata.setdefault("completed_achievements", []).append(achievement_id)

        jdata.setdefault("claimed_achievements", []).append(achievement_id)
        reward = ach["reward_gold"]
        player["gold"] = player.get("gold", 0) + reward

        return {
            "success": True,
            "achievement": ach,
            "claimed_gold": reward,
            "current_gold": player["gold"],
            "message": f"Pencapaian '{ach['name']}' berhasil diklaim! Memperoleh +{reward} Koin Emas!"
        }

    @staticmethod
    def join_guild(player: Dict[str, Any], guild_id: str) -> Dict[str, Any]:
        """Switch or join a player guild."""
        JournalEngine.initialize_journal(player)
        jdata = player["journal_data"]

        guild = next((g for g in GUILDS_CATALOG if g["id"] == guild_id), None)
        if not guild:
            return {"success": False, "error": f"Guild '{guild_id}' tidak valid."}

        jdata["active_guild_id"] = guild_id
        return {
            "success": True,
            "active_guild": guild,
            "guild_rank": jdata.get("guild_rank", "Adept"),
            "message": f"Selamat datang di {guild['name']}! Anda kini menikmati keuntungan: {guild['perk']}."
        }
