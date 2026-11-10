# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Pets, Companions & Ranch Engine (V4)
10 Companion Pets, Animal Ranch Husbandry, Happiness, Products, and Traits.
"""

from typing import Dict, List, Any, Optional

PETS_CATALOG = [
    {"id": "pet_cat", "name": "Kucing Belang Beludru", "icon": "🐱", "trait": "Cozy Purr — Memulihkan +15 stamina saat bersantai di ranjang rumah.", "cost": 300},
    {"id": "pet_dog", "name": "Anjing Gembala Setia", "icon": "🐶", "trait": "Treasure Sniffer — Peluang +20% menggali umbi atau koin saat mencangkul.", "cost": 300},
    {"id": "pet_bunny", "name": "Kelinci Telinga Panjang", "icon": "🐰", "trait": "Clover Luck — Memperbesar peluang panen tanaman bintang empat.", "cost": 450},
    {"id": "pet_fox", "name": "Rubah Senja Merah", "icon": "🦊", "trait": "Forest Forager — Menemukan jamur liar langka secara otomatis di pagi hari.", "cost": 650},
    {"id": "pet_owl", "name": "Burung Hantu Bijak", "icon": "🦉", "trait": "Night Scout — Menerangi jalan setapak dan mendeteksi bahaya malam.", "cost": 850},
    {"id": "pet_turtle", "name": "Kura-kura Lumut Kuno", "icon": "🐢", "trait": "Enduring Shell — Mengurangi konsumsi stamina saat bekerja di kebun sebesar 15%.", "cost": 950},
    {"id": "pet_tiny_dragon", "name": "Naga Mungil Api Nyala", "icon": "🐲", "trait": "Warm Hearth — Melindungi seluruh petak tanaman dari cuaca beku musim dingin.", "cost": 1800},
    {"id": "pet_spirit", "name": "Roh Cahaya Lumina", "icon": "✨", "trait": "Aether Resonance — Meningkatkan perolehan Aether Shards dari dungeon sebesar +25%.", "cost": 2200},
    {"id": "pet_slime", "name": "Slime Puding Hijau", "icon": "🟢", "trait": "Jelly Secretion — Menghasilkan getah slime alkimia tiap 3 hari sekali.", "cost": 1200},
    {"id": "pet_butterfly", "name": "Kupu-kupu Kristal Pelangi", "icon": "🦋", "trait": "Flower Kiss — Mempercepat penyerbukan taman bunga dan produksi madu lebah.", "cost": 1500}
]

RANCH_FACILITIES = [
    {"id": "coop", "name": "Kandang Ayam & Bebek", "capacity": 6, "cost": 500, "animals": ["Ayam Petelur", "Bebek Salju"], "product": "Telur Segar & Bulu Halus"},
    {"id": "barn", "name": "Lumbung Sapi & Kambing", "capacity": 6, "cost": 1200, "animals": ["Sapi Perah Aether", "Kambing Gunung"], "product": "Susu Murni & Keju Gurih"},
    {"id": "alpaca_sanctuary", "name": "Suaka Alpaca Berbulu", "capacity": 4, "cost": 2200, "animals": ["Alpaca Awan"], "product": "Wol Alpaca Lembut"},
    {"id": "apiary", "name": "Rumah Lebah Madu", "capacity": 8, "cost": 800, "animals": ["Koloni Lebah Madu Hutan"], "product": "Madu Liar Segar & Sarang Madu"}
]

class PetsEngine:
    """Manages player companion pets, pet bonding, follow behavior, and ranch animal yields."""

    @staticmethod
    def initialize_pets(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure pets and ranch structures exist in player state."""
        if "pets_data" not in player:
            player["pets_data"] = {
                "active_companion_id": "pet_dog",
                "owned_pets": [
                    {
                        "id": "pet_dog",
                        "name": "Milo (Anjing Gembala)",
                        "level": 2,
                        "bonding": 50,
                        "happiness": 95,
                        "hunger": 20,
                        "accessory": "Kalung Lonceng Tembaga"
                    }
                ],
                "ranch": {
                    "coop_owned": True,
                    "barn_owned": True,
                    "alpaca_sanctuary_owned": False,
                    "apiary_owned": True,
                    "animals": [
                        {"id": "hen_1", "type": "chicken", "name": "Bintik", "happiness": 90, "fed": True, "ready_harvest": True},
                        {"id": "cow_1", "type": "cow", "name": "Moli", "happiness": 85, "fed": True, "ready_harvest": True}
                    ]
                }
            }
        return player

    @staticmethod
    def pet_action(player: Dict[str, Any], pet_id: str, action: str) -> Dict[str, Any]:
        """Interact with a pet: 'pet', 'feed', 'groom', 'play', 'set_active'."""
        PetsEngine.initialize_pets(player)
        pdata = player["pets_data"]
        pet = next((p for p in pdata["owned_pets"] if p["id"] == pet_id), None)
        if not pet:
            return {"success": False, "error": f"Hewan peliharaan '{pet_id}' tidak ditemukan."}

        meta = next((c for c in PETS_CATALOG if c["id"] == pet_id), PETS_CATALOG[0])

        if action == "set_active":
            pdata["active_companion_id"] = pet_id
            return {"success": True, "active_companion_id": pet_id, "message": f"{pet['name']} kini berjalan menemani Anda ke mana pun melangkah!"}

        if action == "feed":
            pet["hunger"] = 0
            pet["happiness"] = min(100, pet["happiness"] + 15)
            pet["bonding"] = min(100, pet["bonding"] + 8)
            msg = f"Anda memberi semangkuk camilan lezat untuk {pet['name']}! Ekornya bergoyang gembira."
        elif action == "pet":
            pet["happiness"] = min(100, pet["happiness"] + 10)
            pet["bonding"] = min(100, pet["bonding"] + 5)
            msg = f"Anda mengelus lembut kepala {pet['name']}."
        elif action == "groom":
            pet["happiness"] = min(100, pet["happiness"] + 12)
            pet["bonding"] = min(100, pet["bonding"] + 10)
            msg = f"Bulu halus {pet['name']} disisir rapi dan wangi segar!"
        elif action == "play":
            pet["level"] += 1
            pet["happiness"] = 100
            pet["bonding"] = min(100, pet["bonding"] + 15)
            msg = f"{pet['name']} melompat lincah bermain lempar tangkap! Naik ke Level {pet['level']}!"
        else:
            return {"success": False, "error": f"Aksi '{action}' tidak valid."}

        return {
            "success": True,
            "pet": pet,
            "trait": meta["trait"],
            "message": msg
        }

    @staticmethod
    def harvest_ranch(player: Dict[str, Any]) -> Dict[str, Any]:
        """Harvest daily milk, eggs, honey from ranch animals."""
        PetsEngine.initialize_pets(player)
        ranch = player["pets_data"]["ranch"]
        harvested = []
        gold_gain = 0

        for animal in ranch.get("animals", []):
            if animal.get("ready_harvest", False):
                animal["ready_harvest"] = False
                if animal["type"] == "chicken":
                    harvested.append({"item": "Telur Segar Berkualitas", "count": 2, "gold": 90})
                    gold_gain += 90
                elif animal["type"] == "cow":
                    harvested.append({"item": "Susu Sapi Murni Aether", "count": 1, "gold": 160})
                    gold_gain += 160

        if ranch.get("apiary_owned", False):
            harvested.append({"item": "Madu Liar Hutan Aetherwyn", "count": 1, "gold": 220})
            gold_gain += 220

        player["gold"] = player.get("gold", 0) + gold_gain

        return {
            "success": True,
            "harvested_items": harvested,
            "gold_earned": gold_gain,
            "current_gold": player["gold"],
            "message": f"Panen peternakan selesai! Memperoleh {gold_gain} G dari produk hewani segar!"
        }
