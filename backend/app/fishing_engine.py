# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Ocean & Fishing Expansion Engine (V4)
7 Ocean/Water Zones, Fish Behaviors & Rarities, 5 Boat Tiers, and Aquarium Collection.
"""

from typing import Dict, List, Any, Optional
import random

WATER_ZONES = [
    {"id": "zone_lake", "name": "Danau Tenang Greenvale (Peaceful Lake)", "level_req": 1, "boat_req": "Rakit Kayu", "icon": "🏞️"},
    {"id": "zone_river", "name": "Lembah Sungai Aetherwyn (River Valley)", "level_req": 8, "boat_req": "Perahu Nelayan", "icon": "🛶"},
    {"id": "zone_coast", "name": "Pantai Karang Pasir Putih (Coastal Beach)", "level_req": 16, "boat_req": "Perahu Layar", "icon": "🏖️"},
    {"id": "zone_reef", "name": "Taman Terumbu Karang (Coral Reef)", "level_req": 25, "boat_req": "Kapal Layar Bersekat", "icon": "🪸"},
    {"id": "zone_deep_ocean", "name": "Palung Samudra Luas (Deep Ocean)", "level_req": 38, "boat_req": "Kapal Uap Penjelajah", "icon": "🌊"},
    {"id": "zone_sunken", "name": "Gerbang Kerajaan Tenggelam (Sunken Kingdom)", "level_req": 50, "boat_req": "Perahu Magis Arcane", "icon": "🏛️"},
    {"id": "zone_frozen_sea", "name": "Laut Kutub Utara Beku (Frozen Sea)", "level_req": 65, "boat_req": "Perahu Magis Arcane", "icon": "❄️"}
]

BOATS_CATALOG = [
    {"id": "boat_raft", "name": "Rakit Kayu Sederhana", "tier": 1, "cost": 0, "speed": 1.0, "icon": "🪵", "desc": "Rakit bambu untuk perairan danau tenang."},
    {"id": "boat_dinghy", "name": "Perahu Nelayan Dinghy", "tier": 2, "cost": 650, "speed": 1.4, "icon": "🛶", "desc": "Perahu kayu dengan sepasang dayung halus untuk sungai deras."},
    {"id": "boat_sloop", "name": "Kapal Layar Sloop", "tier": 3, "cost": 1800, "speed": 1.8, "icon": "⛵", "desc": "Kapal berlayar kanvas putih lincah menembus ombak pesisir pantai."},
    {"id": "boat_steamer", "name": "Kapal Uap Penjelajah", "tier": 4, "cost": 4200, "speed": 2.2, "icon": "🚢", "desc": "Ditenagai ketel uap Ironhaven untuk pelayaran samudra lepas."},
    {"id": "boat_arcane", "name": "Perahu Magis Arcane Skiff", "tier": 5, "cost": 9500, "speed": 2.8, "icon": "✨", "desc": "Melayang anggun di atas air dengan tolakan esensi kristal eter."}
]

FISH_SPECIES = [
    {"id": "fish_parsnip_minnow", "name": "Minnow Sungai Tenang", "zone": "zone_lake", "rarity": "Common", "season": "All", "base_price": 30, "size_range": (8, 20)},
    {"id": "fish_rainbow_trout", "name": "Trout Pelangi Berkilau", "zone": "zone_river", "rarity": "Common", "season": "Spring", "base_price": 55, "size_range": (25, 60)},
    {"id": "fish_silver_carp", "name": "Gurame Sisik Perak", "zone": "zone_river", "rarity": "Common", "season": "Summer", "base_price": 45, "size_range": (30, 75)},
    {"id": "fish_coastal_mackerel", "name": "Tenggiri Pesisir Putih", "zone": "zone_coast", "rarity": "Uncommon", "season": "All", "base_price": 85, "size_range": (40, 90)},
    {"id": "fish_coral_tang", "name": "Ikan Tang Karang Zamrud", "zone": "zone_reef", "rarity": "Uncommon", "season": "Summer", "base_price": 120, "size_range": (15, 35)},
    {"id": "fish_luminescent_angler", "name": "Ikan Sungut Cahaya Abyssal", "zone": "zone_deep_ocean", "rarity": "Rare", "season": "All", "base_price": 320, "size_range": (50, 110)},
    {"id": "fish_frost_prowler", "name": "Kakap Salju Kutub", "zone": "zone_frozen_sea", "rarity": "Rare", "season": "Winter", "base_price": 450, "size_range": (60, 130)},
    {"id": "fish_sunken_kingfin", "name": "Arwana Emas Istana Tenggelam", "zone": "zone_sunken", "rarity": "Legendary", "season": "Autumn", "base_price": 1100, "size_range": (90, 180)},
    {"id": "fish_leviathan_koi", "name": "Koi Samudra Purba Leviathan", "zone": "zone_deep_ocean", "rarity": "Legendary", "season": "All", "base_price": 1850, "size_range": (150, 320)}
]

class FishingEngine:
    """Manages boat navigation, zone expeditions, fishing minigame outcomes, and aquarium log."""

    @staticmethod
    def initialize_fishing(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure fishing journal, boat inventory, and aquarium structures exist."""
        if "fishing_data" not in player:
            player["fishing_data"] = {
                "active_boat_id": "boat_raft",
                "owned_boats": ["boat_raft"],
                "aquarium": [],
                "caught_records": {
                    "fish_parsnip_minnow": {"count": 4, "max_length": 18.5}
                }
            }
        return player

    @staticmethod
    def cast_line(player: Dict[str, Any], zone_id: str) -> Dict[str, Any]:
        """Simulate casting fishing line in a designated water zone."""
        FishingEngine.initialize_fishing(player)
        fdata = player["fishing_data"]

        zone = next((z for z in WATER_ZONES if z["id"] == zone_id), WATER_ZONES[0])
        avail_fish = [f for f in FISH_SPECIES if f["zone"] == zone_id]
        if not avail_fish:
            avail_fish = FISH_SPECIES[:3]

        caught_fish = random.choice(avail_fish)
        min_sz, max_sz = caught_fish["size_range"]
        caught_len = round(random.uniform(min_sz, max_sz), 1)

        # Quality star based on size roll
        ratio = (caught_len - min_sz) / max(1.0, (max_sz - min_sz))
        if ratio > 0.85:
            quality = "Iridium"
            price_mult = 2.0
        elif ratio > 0.60:
            quality = "Gold"
            price_mult = 1.5
        elif ratio > 0.35:
            quality = "Silver"
            price_mult = 1.2
        else:
            quality = "Normal"
            price_mult = 1.0

        final_price = int(caught_fish["base_price"] * price_mult)

        # Update records
        records = fdata["caught_records"]
        fid = caught_fish["id"]
        if fid not in records:
            records[fid] = {"count": 0, "max_length": 0.0}
        records[fid]["count"] += 1
        records[fid]["max_length"] = max(records[fid]["max_length"], caught_len)

        # Add to aquarium if unique or high quality
        if not any(a["id"] == fid for a in fdata["aquarium"]):
            fdata["aquarium"].append({
                "id": fid,
                "name": caught_fish["name"],
                "length": caught_len,
                "quality": quality,
                "zone": zone["name"]
            })

        # Stamina cost
        player["stamina"] = max(0, player.get("stamina", 100) - 6)

        return {
            "success": True,
            "zone": zone["name"],
            "caught_fish": {
                "id": fid,
                "name": caught_fish["name"],
                "length_cm": caught_len,
                "quality": quality,
                "rarity": caught_fish["rarity"],
                "market_value": final_price
            },
            "total_caught_species": len(records),
            "remaining_stamina": player["stamina"],
            "message": f"Kail ditarik kuat! Anda berhasil menangkap {caught_fish['name']} ({caught_len} cm, Kualitas {quality}) seharga {final_price} G!"
        }

    @staticmethod
    def purchase_boat(player: Dict[str, Any], boat_id: str) -> Dict[str, Any]:
        """Purchase and unlock a new exploration boat."""
        FishingEngine.initialize_fishing(player)
        fdata = player["fishing_data"]

        boat = next((b for b in BOATS_CATALOG if b["id"] == boat_id), None)
        if not boat:
            return {"success": False, "error": f"Perahu '{boat_id}' tidak valid."}

        if boat_id in fdata["owned_boats"]:
            return {"success": False, "error": f"Anda sudah memiliki armada {boat['name']}!"}

        if player.get("gold", 0) < boat["cost"]:
            return {"success": False, "error": f"Koin emas tidak mencukupi untuk membeli {boat['name']}. Biaya: {boat['cost']} G."}

        player["gold"] -= boat["cost"]
        fdata["owned_boats"].append(boat_id)
        fdata["active_boat_id"] = boat_id

        return {
            "success": True,
            "purchased_boat": boat,
            "active_boat_id": boat_id,
            "remaining_gold": player["gold"],
            "message": f"Selamat! Armada kapal baru {boat['name']} siap berlayar mengarungi samudra!"
        }
