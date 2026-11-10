# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Timed Portals & Seasonal Events Framework (V4)
Centralized Event Lifecycle, 8 Timed Dimensional Portals, and full Halloween Madness seasonal event.
"""

from typing import Dict, List, Any, Optional
import random

PORTAL_DIMENSIONS = [
    {
        "id": "portal_forest",
        "name": "Portal Rimba Purba (Ancient Forest)",
        "theme": "Nature & Spirits",
        "icon": "🌲",
        "color": "#16a34a",
        "min_level": 1,
        "active_duration_minutes": 45,
        "resources": ["Verdant Timber", "Fairy Blossoms", "Spirit Dew"],
        "reward_preview": "Bibit Pohon Lumina & Pelana Rusa Suci"
    },
    {
        "id": "portal_crystal",
        "name": "Portal Gua Kristal (Crystal Caverns)",
        "theme": "Minerals & Radiance",
        "icon": "💎",
        "color": "#0284c7",
        "min_level": 12,
        "active_duration_minutes": 60,
        "resources": ["Star Quartz", "Prismatic Shards", "Lapis Lazuli"],
        "reward_preview": "Rubah Kristal Aether (Mount) & Beliung Kristal"
    },
    {
        "id": "portal_sky",
        "name": "Portal Kepulauan Awan (Floating Islands)",
        "theme": "Sky & Wind",
        "icon": "☁️",
        "color": "#38bdf8",
        "min_level": 20,
        "active_duration_minutes": 50,
        "resources": ["Cloud Feathers", "Zephyr Core", "Aether Crystal"],
        "reward_preview": "Telur Grifon Penjaga Langit (Mount)"
    },
    {
        "id": "portal_ocean",
        "name": "Portal Samudra Abyssal (Sunken Kingdom)",
        "theme": "Deep Waters & Coral",
        "icon": "🌊",
        "color": "#0d9488",
        "min_level": 30,
        "active_duration_minutes": 60,
        "resources": ["Abyssal Coral", "Siren Pearls", "Ancient Amphora"],
        "reward_preview": "Arwana Istana Emas & Perahu Magis"
    },
    {
        "id": "portal_shadow",
        "name": "Portal Alam Senja (Twilight Realm)",
        "theme": "Shadow & Mystery",
        "icon": "🌘",
        "color": "#7c3aed",
        "min_level": 40,
        "active_duration_minutes": 40,
        "resources": ["Shadow Essence", "Midnight Orchid", "Dusk Ore"],
        "reward_preview": "Jubah Bayangan Gaib & Kostum Malam"
    },
    {
        "id": "portal_ancient",
        "name": "Portal Peradaban Terlupakan (Forgotten Ruins)",
        "theme": "Ancient Technology",
        "icon": "🏛️",
        "color": "#d97706",
        "min_level": 50,
        "active_duration_minutes": 90,
        "resources": ["Chrono Gears", "Titan Core", "Rune Ingot"],
        "reward_preview": "Cetak Biru Pabrik Otomatis Purba"
    },
    {
        "id": "portal_seasonal",
        "name": "Portal Taman Musim (Seasonal Sanctuary)",
        "theme": "Endless Blossom & Harvest",
        "icon": "🍂",
        "color": "#ea580c",
        "min_level": 10,
        "active_duration_minutes": 120,
        "resources": ["Ghost Pumpkins", "Spooky Candies", "Spectral Vines"],
        "reward_preview": "Benih Labu Hantu Musiman & Mahkota Festival"
    },
    {
        "id": "portal_celestial",
        "name": "Portal Bintang Jatuh (Starfall Sanctuary)",
        "theme": "Endgame Astral",
        "icon": "⭐",
        "color": "#ec4899",
        "min_level": 60,
        "active_duration_minutes": 180,
        "resources": ["Astral Dust", "Nova Fragment", "Celestial Core"],
        "reward_preview": "Naga Aetherwyn Purba (Apex Flying Mount)"
    }
]

HALLOWEEN_SHOP_ITEMS = [
    {"id": "spooky_hat", "name": "Topi Penyihir Malam (Witch Hat)", "cost_tokens": 15, "cost_gold": 250, "icon": "🧙‍♀️", "desc": "Topi kerucut misterius berhias pita ungu berbintang."},
    {"id": "vampire_cape", "name": "Jubah Drakula Beludru (Vampire Cape)", "cost_tokens": 25, "cost_gold": 450, "icon": "🧛", "desc": "Jubah merah hitam elegan khas bangsawan malam."},
    {"id": "ghost_lantern", "name": "Lentera Roh Labu Menyala", "cost_tokens": 20, "cost_gold": 300, "icon": "🎃", "desc": "Lentera berukir wajah senyum ramah yang menerangi malam desa."},
    {"id": "skeletal_saddle", "name": "Pelana Kuda Tulang Berkilau", "cost_tokens": 40, "cost_gold": 800, "icon": "💀", "desc": "Pelana unik untuk tunggangan kuda bertema Halloween Madness."},
    {"id": "spooky_recipe_pie", "name": "Resep Pai Labu Berhantu", "cost_tokens": 10, "cost_gold": 150, "icon": "🥧", "desc": "Resep kuliner lezat yang mengembalikan stamina penuh seketika."}
]

class EventsEngine:
    """Manages active live events, timed portal schedules, and seasonal interactions."""

    @staticmethod
    def initialize_events(world: Dict[str, Any], player: Dict[str, Any]) -> None:
        """Ensure world active portals and player seasonal event tokens are set up."""
        if "active_portals" not in world:
            world["active_portals"] = [
                {
                    "portal_id": "portal_forest",
                    "remaining_seconds": 1840,
                    "location": "Utara Whispering Forest",
                    "status": "active"
                },
                {
                    "portal_id": "portal_crystal",
                    "remaining_seconds": 3210,
                    "location": "Pintu Barat Crystal Caverns",
                    "status": "active"
                },
                {
                    "portal_id": "portal_seasonal",
                    "remaining_seconds": 5400,
                    "location": "Alun-alun Desa Greenvale",
                    "status": "active"
                }
            ]

        if "seasonal_events" not in world:
            world["seasonal_events"] = {
                "active_event_id": "halloween_madness",
                "name": "Halloween Madness — Festival Roh Lembah (Moonlight Hollow)",
                "status": "active",
                "days_remaining": 7,
                "is_haunted_transformation": True,
                "featured_crops": ["seed_ghost_pumpkin", "crop_ghost_pumpkin"],
                "haunted_mansion_unlocked": True
            }

        if "event_inventory" not in player:
            player["event_inventory"] = {
                "spooky_tokens": 38,
                "candies": 12,
                "trick_or_treat_npcs": ["Rowan", "Elara"],
                "mansion_floors_cleared": 2,
                "unlocked_event_items": ["ghost_lantern"]
            }

    @staticmethod
    def enter_portal(player: Dict[str, Any], world: Dict[str, Any], portal_id: str) -> Dict[str, Any]:
        """Explore a timed portal dimension and retrieve dimensional relics."""
        EventsEngine.initialize_events(world, player)
        
        portal_meta = next((p for p in PORTAL_DIMENSIONS if p["id"] == portal_id), None)
        if not portal_meta:
            return {"success": False, "error": f"Portal '{portal_id}' tidak ditemukan di register dimensi."}

        # Check global/exploration level
        cur_lvl = max(player.get("global_level", 1), player.get("skills", {}).get("exploration", {}).get("level", 1))
        req_lvl = portal_meta["min_level"]
        if cur_lvl < req_lvl:
            return {"success": False, "error": f"Level karakter Anda ({cur_lvl}) belum mencukupi untuk menembus portal ini. Butuh Level {req_lvl}."}

        # Rewards roll
        rewards_gained = {}
        for res in portal_meta["resources"]:
            count = random.randint(1, 4)
            rewards_gained[res] = count

        gold_reward = random.randint(150, 400)
        shards_reward = random.randint(2, 6)
        player["gold"] = player.get("gold", 0) + gold_reward
        player["aether_shards"] = player.get("aether_shards", 0) + shards_reward

        # Deduct stamina
        player["stamina"] = max(0, player.get("stamina", 100) - 15)

        return {
            "success": True,
            "portal": portal_meta["name"],
            "theme": portal_meta["theme"],
            "resources_collected": rewards_gained,
            "gold_found": gold_reward,
            "shards_found": shards_reward,
            "remaining_stamina": player["stamina"],
            "message": f"Anda melangkah ke dalam {portal_meta['name']}! Ekspedisi dimensi sukses membawa pulang material langka dan {gold_reward} G."
        }

    @staticmethod
    def trick_or_treat(player: Dict[str, Any], world: Dict[str, Any], npc_name: str) -> Dict[str, Any]:
        """Visit an NPC during Halloween event for trick-or-treat treats and spooky tokens."""
        EventsEngine.initialize_events(world, player)
        einv = player["event_inventory"]

        if npc_name in einv["trick_or_treat_npcs"]:
            return {"success": False, "error": f"{npc_name} sudah memberikan permen Halloween hari ini. Datang kembali besok!"}

        candies_gained = random.randint(2, 4)
        tokens_gained = random.randint(5, 10)
        einv["trick_or_treat_npcs"].append(npc_name)
        einv["candies"] = einv.get("candies", 0) + candies_gained
        einv["spooky_tokens"] = einv.get("spooky_tokens", 0) + tokens_gained

        dialogues = [
            f"'{npc_name} tersenyum ramah memakai kostum labu: \"Trick or treat! Ini permen karamel manis dan koin roh festival untukmu!\"'",
            f"'{npc_name} tertawa terkejut: \"Haha, kostummu keren sekali! Ambil permen lezat dan koin festival ini!\"'"
        ]

        return {
            "success": True,
            "npc_name": npc_name,
            "candies_gained": candies_gained,
            "tokens_gained": tokens_gained,
            "total_tokens": einv["spooky_tokens"],
            "message": random.choice(dialogues)
        }

    @staticmethod
    def purchase_halloween_item(player: Dict[str, Any], world: Dict[str, Any], item_id: str) -> Dict[str, Any]:
        """Buy exclusive Halloween cosmetic or recipe from seasonal shop."""
        EventsEngine.initialize_events(world, player)
        einv = player["event_inventory"]

        item = next((i for i in HALLOWEEN_SHOP_ITEMS if i["id"] == item_id), None)
        if not item:
            return {"success": False, "error": f"Item Halloween '{item_id}' tidak valid."}

        if item_id in einv.get("unlocked_event_items", []):
            return {"success": False, "error": f"Anda sudah memiliki {item['name']}!"}

        if einv.get("spooky_tokens", 0) < item["cost_tokens"]:
            return {"success": False, "error": f"Token Roh Labu tidak cukup! Butuh {item['cost_tokens']} Token, Anda memiliki {einv.get('spooky_tokens', 0)}."}

        if player.get("gold", 0) < item["cost_gold"]:
            return {"success": False, "error": f"Emas tidak cukup! Butuh {item['cost_gold']} G."}

        einv["spooky_tokens"] -= item["cost_tokens"]
        player["gold"] -= item["cost_gold"]
        einv["unlocked_event_items"].append(item_id)

        return {
            "success": True,
            "purchased_item": item,
            "remaining_tokens": einv["spooky_tokens"],
            "remaining_gold": player["gold"],
            "message": f"Transaksi berhasil! Anda mengenakan {item['name']} untuk memeriahkan Halloween Madness!"
        }
