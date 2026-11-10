# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Mounts & Riding Engine (V4)
10 Mount types, Riding mechanics, Stables, Bonding activities, and Speed modifiers.
"""

from typing import Dict, List, Any, Optional

MOUNTS_CATALOG = [
    {
        "id": "horse",
        "name": "Kuda Padang Rumput",
        "category": "plains",
        "icon": "🐎",
        "color": "#854d0e",
        "speed_mult": 1.6,
        "max_stamina": 140,
        "ability": "Trot Dash — Terobosan laju cepat di jalan setapak",
        "source": "Dibeli dari Kandang Greenvale",
        "unlocked_default": True
    },
    {
        "id": "pony",
        "name": "Poni Lembah Ramah",
        "category": "beginner",
        "icon": "🐴",
        "color": "#a16207",
        "speed_mult": 1.4,
        "max_stamina": 110,
        "ability": "Gentle Step — Konsumsi stamina lambat",
        "source": "Quest Peternakan Rowan",
        "unlocked_default": True
    },
    {
        "id": "deer",
        "name": "Rusa Rimba Suci",
        "category": "forest",
        "icon": "🦌",
        "color": "#b45309",
        "speed_mult": 1.75,
        "max_stamina": 150,
        "ability": "Forest Leap — Melompati pagar dan bebatuan kecil",
        "source": "Quest Penjaga Whispering Forest",
        "unlocked_default": False
    },
    {
        "id": "giant_rabbit",
        "name": "Kelinci Raksasa Padang",
        "category": "seasonal",
        "icon": "🐇",
        "color": "#f1f5f9",
        "speed_mult": 1.65,
        "max_stamina": 130,
        "ability": "High Bounce — Lompatan pegas gembira",
        "source": "Event Musiman Easter / Spring Blossom",
        "unlocked_default": False
    },
    {
        "id": "alpaca",
        "name": "Alpaca Awan Berbulu",
        "category": "ranch",
        "icon": "🦙",
        "color": "#fef08a",
        "speed_mult": 1.5,
        "max_stamina": 160,
        "ability": "Cozy Warmth — Memberi aura hangat di musim dingin",
        "source": "Ternak Suaka Hewan",
        "unlocked_default": False
    },
    {
        "id": "wolf_mount",
        "name": "Serigala Rimba Salju",
        "category": "wilderness",
        "icon": "🐺",
        "color": "#64748b",
        "speed_mult": 1.9,
        "max_stamina": 175,
        "ability": "Wild Sprint — Lari kencang tanpa terhalang semak",
        "source": "Dungeon Tundra Frostpeak",
        "unlocked_default": False
    },
    {
        "id": "crystal_fox",
        "name": "Rubah Kristal Aether",
        "category": "magical",
        "icon": "🦊",
        "color": "#38bdf8",
        "speed_mult": 2.0,
        "max_stamina": 190,
        "ability": "Ether Blink — Teleportasi jarak pendek ke depan",
        "source": "Portal Dimensi Crystal Caverns",
        "unlocked_default": False
    },
    {
        "id": "unicorn",
        "name": "Unicorn Cahaya Fajar",
        "category": "legendary",
        "icon": "🦄",
        "color": "#f472b6",
        "speed_mult": 2.2,
        "max_stamina": 220,
        "ability": "Purifying Light — Memancarkan cahaya dan menyembuhkan stamina",
        "source": "Kuil Moonlight Valley",
        "unlocked_default": False
    },
    {
        "id": "griffin",
        "name": "Grifon Penjaga Langit",
        "category": "aerial",
        "icon": "🦅",
        "color": "#f59e0b",
        "speed_mult": 2.4,
        "max_stamina": 240,
        "ability": "Sky Glide — Melayang di atas air dan jurang",
        "source": "Ekspedisi Pulau Terapung (Floating Islands)",
        "unlocked_default": False
    },
    {
        "id": "dragon",
        "name": "Naga Aetherwyn Purba",
        "category": "celestial",
        "icon": "🐉",
        "color": "#ef4444",
        "speed_mult": 2.75,
        "max_stamina": 280,
        "ability": "Apex Flight — Kecepatan puncak penjelajahan antar-bioma",
        "source": "Sanctuary Bintang Starfall",
        "unlocked_default": False
    }
]

STABLE_TIERS = [
    {"tier": 1, "name": "Kandang Sederhana", "capacity": 2, "cost": 0, "desc": "Kandang kayu kecil cukup untuk 2 tunggangan."},
    {"tier": 2, "name": "Kandang Kayu Solid", "capacity": 4, "cost": 450, "desc": "Kandang berbahan papan kayu jati tebal untuk 4 tunggangan."},
    {"tier": 3, "name": "Kandang Luas Peternak", "capacity": 6, "cost": 1200, "desc": "Lumbung jerami bersih dengan palung makan otomatis."},
    {"tier": 4, "name": "Kandang Kerajaan Royal", "capacity": 8, "cost": 2800, "desc": "Kandang marmer dengan fasilitas penyisiran dan perawatan mewah."},
    {"tier": 5, "name": "Kandang Magis Aether", "capacity": 10, "cost": 5500, "desc": "Diresapi kristal pemulih stamina pasif setiap pergantian hari."},
    {"tier": 6, "name": "Sanctuary Angkasa Surgawi", "capacity": 12, "cost": 12000, "desc": "Kapasitas penuh dengan pemulihan kilat dan pelana bintang."}
]

class MountsEngine:
    """Manages player stable, mounts collection, bonding activities, and active mount state."""

    @staticmethod
    def initialize_mounts(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure mounts and stable structures exist in player state."""
        if "mounts_data" not in player:
            # Initialize with default unlocked horse
            player["mounts_data"] = {
                "active_mount_id": "horse",
                "is_mounted": False,
                "stable_tier": 1,
                "owned_mounts": [
                    {
                        "id": "horse",
                        "name": "Suryakencana (Kuda)",
                        "level": 3,
                        "bonding": 45,
                        "happiness": 90,
                        "stamina": 140,
                        "max_stamina": 140,
                        "equipped_saddle": "Pelana Kulit Sederhana",
                        "last_fed_day": 4
                    },
                    {
                        "id": "pony",
                        "name": "Boni (Poni)",
                        "level": 1,
                        "bonding": 20,
                        "happiness": 80,
                        "stamina": 110,
                        "max_stamina": 110,
                        "equipped_saddle": "Pelana Kain",
                        "last_fed_day": 3
                    }
                ]
            }
        return player

    @staticmethod
    def get_mount_catalog() -> List[Dict[str, Any]]:
        return MOUNTS_CATALOG

    @staticmethod
    def toggle_mount(player: Dict[str, Any], mount_id: Optional[str] = None) -> Dict[str, Any]:
        """Toggle riding on/off. If mount_id provided, equip and ride that mount."""
        MountsEngine.initialize_mounts(player)
        mdata = player["mounts_data"]

        if mount_id:
            owned = next((m for m in mdata["owned_mounts"] if m["id"] == mount_id), None)
            if not owned:
                return {"success": False, "error": f"Tunggangan '{mount_id}' belum Anda miliki."}
            mdata["active_mount_id"] = mount_id
            mdata["is_mounted"] = True
        else:
            # Toggle current active
            mdata["is_mounted"] = not mdata.get("is_mounted", False)

        active_id = mdata["active_mount_id"]
        meta = next((c for c in MOUNTS_CATALOG if c["id"] == active_id), MOUNTS_CATALOG[0])

        return {
            "success": True,
            "is_mounted": mdata["is_mounted"],
            "active_mount_id": active_id,
            "mount_name": meta["name"],
            "speed_mult": meta["speed_mult"] if mdata["is_mounted"] else 1.0,
            "ability": meta["ability"]
        }

    @staticmethod
    def interact_mount(player: Dict[str, Any], mount_id: str, action: str) -> Dict[str, Any]:
        """Perform bonding interactions: 'feed', 'groom', 'play', 'train'."""
        MountsEngine.initialize_mounts(player)
        mdata = player["mounts_data"]
        mount = next((m for m in mdata["owned_mounts"] if m["id"] == mount_id), None)
        if not mount:
            return {"success": False, "error": f"Tunggangan '{mount_id}' tidak ditemukan di kandang."}

        meta = next((c for c in MOUNTS_CATALOG if c["id"] == mount_id), MOUNTS_CATALOG[0])

        if action == "feed":
            mount["happiness"] = min(100, mount.get("happiness", 80) + 15)
            mount["bonding"] = min(100, mount.get("bonding", 10) + 8)
            msg = f"Anda memberi makan wortel dan jerami segar kepada {mount['name']}. Hubungan bonding meningkat!"
        elif action == "groom":
            mount["happiness"] = min(100, mount.get("happiness", 80) + 10)
            mount["bonding"] = min(100, mount.get("bonding", 10) + 6)
            msg = f"Anda menyisir bulu {mount['name']} hingga bersih berkilau!"
        elif action == "play":
            mount["happiness"] = 100
            mount["bonding"] = min(100, mount.get("bonding", 10) + 12)
            msg = f"{mount['name']} melompat gembira saat Anda mengajaknya bermain di padang rumput!"
        elif action == "train":
            mount["level"] = mount.get("level", 1) + 1
            mount["bonding"] = min(100, mount.get("bonding", 10) + 10)
            mount["max_stamina"] += 10
            mount["stamina"] = mount["max_stamina"]
            msg = f"Latihan intensif sukses! {mount['name']} naik ke Level {mount['level']}!"
        else:
            return {"success": False, "error": f"Aksi '{action}' tidak valid."}

        return {
            "success": True,
            "action": action,
            "mount": mount,
            "message": msg
        }

    @staticmethod
    def unlock_mount(player: Dict[str, Any], mount_id: str, custom_name: Optional[str] = None) -> Dict[str, Any]:
        """Acquire a new mount and register it in stable."""
        MountsEngine.initialize_mounts(player)
        mdata = player["mounts_data"]
        meta = next((c for c in MOUNTS_CATALOG if c["id"] == mount_id), None)
        if not meta:
            return {"success": False, "error": f"Mount '{mount_id}' tidak dikenal."}

        already_owned = any(m["id"] == mount_id for m in mdata["owned_mounts"])
        if already_owned:
            return {"success": False, "error": f"Anda sudah memiliki tunggangan {meta['name']}!"}

        cur_tier = mdata.get("stable_tier", 1)
        capacity = STABLE_TIERS[cur_tier - 1]["capacity"]
        if len(mdata["owned_mounts"]) >= capacity:
            return {"success": False, "error": f"Kandang penuh ({len(mdata['owned_mounts'])}/{capacity}). Tingkatkan kapasitas kandang terlebih dahulu."}

        new_mount = {
            "id": mount_id,
            "name": custom_name or meta["name"],
            "level": 1,
            "bonding": 15,
            "happiness": 90,
            "stamina": meta["max_stamina"],
            "max_stamina": meta["max_stamina"],
            "equipped_saddle": "Pelana Standar",
            "last_fed_day": 1
        }
        mdata["owned_mounts"].append(new_mount)

        return {
            "success": True,
            "unlocked_mount": new_mount,
            "message": f"Selamat! {new_mount['name']} telah resmi bergabung ke kandang Anda!"
        }

    @staticmethod
    def upgrade_stable(player: Dict[str, Any]) -> Dict[str, Any]:
        """Upgrade stable building tier."""
        MountsEngine.initialize_mounts(player)
        mdata = player["mounts_data"]
        cur_tier = mdata.get("stable_tier", 1)
        if cur_tier >= len(STABLE_TIERS):
            return {"success": False, "error": "Kandang sudah berada di tingkat arsitektur tertinggi!"}

        next_tier = STABLE_TIERS[cur_tier]
        cost = next_tier["cost"]
        if player.get("gold", 0) < cost:
            return {"success": False, "error": f"Koin emas tidak mencukupi untuk renovasi kandang. Biaya: {cost} G."}

        player["gold"] -= cost
        mdata["stable_tier"] = next_tier["tier"]

        return {
            "success": True,
            "stable_tier": next_tier["tier"],
            "stable_name": next_tier["name"],
            "new_capacity": next_tier["capacity"],
            "remaining_gold": player["gold"],
            "message": f"Tukang kayu selesai merenovasi kandang menjadi {next_tier['name']}! Kapasitas bertambah menjadi {next_tier['capacity']} tunggangan."
        }
