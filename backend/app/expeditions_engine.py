# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Expedition Planning & Field Dispatch Engine (V7)
Destination Selection, Supply Checklists, NPC Companion Invites,
Live Objective Tracking, and Automated Expedition Log Reports.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import time
import uuid

AVAILABLE_COMPANIONS = [
    {"id": "comp_elara", "name": "Tabib Elara", "role": "Ahli Herbal & Medis", "bonus": "+30% Pemulihan Stamina Ekspedisi", "icon": "🌿"},
    {"id": "comp_rowan", "name": "Pandai Besi Rowan", "role": "Mekanik & Ketahanan Alat", "bonus": "+25% Ketahanan Perkakas Ekspedisi", "icon": "🔨"},
    {"id": "comp_nessa", "name": "Insinyur Nessa", "role": "Teknisi Navigasi Aether", "bonus": "+35% Efisiensi Baterai & Scanner", "icon": "⚡"},
    {"id": "comp_elena", "name": "Elena sang Botanis", "role": "Pencari Flora Langka", "bonus": "+40% Peluang Menemukan Benih Kuno", "icon": "🌸"},
    {"id": "comp_pierre", "name": "Chef Pierre", "role": "Logistik Pangan Ransum", "bonus": "Ransum Hangat Meningkatkan Kecepatan +20%", "icon": "🍳"}
]

REQUIRED_SUPPLIES_CATALOG = [
    {"id": "sup_portable_camp", "name": "Tenda Ekspedisi Lapangan", "category": "shelter", "icon": "⛺", "cost_gold": 120},
    {"id": "sup_trail_rations", "name": "Paket Ransum Kering Bergizi", "category": "food", "icon": "🍞", "cost_gold": 60},
    {"id": "sup_climbing_rope", "name": "Tali Panjat Tebing Nilon", "category": "gear", "icon": "🪢", "cost_gold": 80},
    {"id": "sup_aether_lantern", "name": "Lentera Kristal Aether", "category": "light", "icon": "🏮", "cost_gold": 150},
    {"id": "sup_med_kit", "name": "Kotak Pertolongan Pertama Herbal", "category": "medical", "icon": "🩹", "cost_gold": 90}
]

ACTIVE_EXPEDITIONS: Dict[str, Dict[str, Any]] = {}

class ExpeditionsEngine:
    """Manages expedition planning, supply loadouts, companion buffs, and field report generation."""

    @staticmethod
    def ensure_expedition_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure expedition log structures exist in player state."""
        if "expeditions_history" not in player:
            player["expeditions_history"] = []
        if "active_expedition_id" not in player:
            player["active_expedition_id"] = None
        return player

    @staticmethod
    def get_expedition_metadata() -> Dict[str, Any]:
        """Return companions, required supplies catalog, and active expedition if any."""
        return {
            "companions": AVAILABLE_COMPANIONS,
            "supplies": REQUIRED_SUPPLIES_CATALOG
        }

    @staticmethod
    def create_and_dispatch_expedition(
        player: Dict[str, Any],
        destination_zone_id: str,
        destination_name: str,
        companion_ids: List[str],
        supplies_selected: List[str]
    ) -> Dict[str, Any]:
        """Validate supply checklist, companion assignments, and launch an expedition."""
        ExpeditionsEngine.ensure_expedition_state(player)

        if len(companion_ids) == 0:
            return {"success": False, "error": "Pilih minimal 1 rekan pendamping untuk ekspedisi."}

        # Calculate supplies cost
        total_supply_cost = 0
        for sup_id in supplies_selected:
            found_sup = next((s for s in REQUIRED_SUPPLIES_CATALOG if s["id"] == sup_id), None)
            if found_sup:
                total_supply_cost += found_sup["cost_gold"]

        current_gold = player.get("gold", 0)
        if current_gold < total_supply_cost:
            return {
                "success": False,
                "error": f"Koin tidak cukup untuk perbekalan ekspedisi! Butuh {total_supply_cost} koin, tersedia {current_gold} koin."
            }

        # Deduct gold for supplies
        player["gold"] -= total_supply_cost

        expedition_id = f"exp_{str(uuid.uuid4())[:8]}"
        objectives = [
            {"id": "obj_survey", "desc": f"Memetakan topografi {destination_name}", "target": 2, "progress": 0, "completed": False},
            {"id": "obj_harvest", "desc": "Mengumpulkan sampel material geologis", "target": 3, "progress": 0, "completed": False},
            {"id": "obj_camp", "desc": "Mendirikan pos tenda penelitian lapangan", "target": 1, "progress": 0, "completed": False}
        ]

        exp_data = {
            "id": expedition_id,
            "destination_zone_id": destination_zone_id,
            "destination_name": destination_name,
            "companions": [c for c in AVAILABLE_COMPANIONS if c["id"] in companion_ids],
            "supplies": supplies_selected,
            "supply_cost": total_supply_cost,
            "status": "in_progress",
            "dispatched_at": datetime.utcnow().isoformat(),
            "start_timestamp": time.time(),
            "objectives": objectives,
            "rewards": {
                "gold": 2500 + total_supply_cost,
                "pp": 3,
                "relic_fragments": 2,
                "title": f"Penjelajah {destination_name}"
            }
        }

        ACTIVE_EXPEDITIONS[expedition_id] = exp_data
        player["active_expedition_id"] = expedition_id

        return {
            "success": True,
            "expedition": exp_data,
            "remaining_gold": player["gold"],
            "message": f"🚩 Ekspedisi ke {destination_name} resmi diberangkatkan bersama {len(companion_ids)} rekan pendamping!"
        }

    @staticmethod
    def progress_expedition_objective(player: Dict[str, Any], expedition_id: str, objective_index: int = 0) -> Dict[str, Any]:
        """Advance objective step in an ongoing expedition."""
        if expedition_id not in ACTIVE_EXPEDITIONS:
            return {"success": False, "error": "Ekspedisi tidak ditemukan di arsip lapangan."}

        exp = ACTIVE_EXPEDITIONS[expedition_id]
        if exp["status"] != "in_progress":
            return {"success": False, "error": f"Ekspedisi berstatus '{exp['status']}'."}

        objs = exp["objectives"]
        if 0 <= objective_index < len(objs):
            target_obj = objs[objective_index]
            target_obj["progress"] = min(target_obj["target"], target_obj["progress"] + 1)
            if target_obj["progress"] >= target_obj["target"]:
                target_obj["completed"] = True

        all_done = all(o["completed"] for o in objs)
        if all_done:
            exp["status"] = "ready_to_return"

        return {
            "success": True,
            "expedition": exp,
            "all_objectives_completed": all_done,
            "message": "Semua objektif ekspedisi selesai! Tim siap kembali ke perkemahan induk." if all_done else "Kemajuan objektif ekspedisi tercatat."
        }

    @staticmethod
    def complete_expedition_and_generate_report(player: Dict[str, Any], expedition_id: str) -> Dict[str, Any]:
        """Finalize expedition, distribute rewards, and archive return report in player journal."""
        ExpeditionsEngine.ensure_expedition_state(player)

        if expedition_id not in ACTIVE_EXPEDITIONS:
            return {"success": False, "error": "Sesi ekspedisi tidak ditemukan."}

        exp = ACTIVE_EXPEDITIONS[expedition_id]
        reward = exp["rewards"]

        # Grant rewards
        player["gold"] = player.get("gold", 0) + reward["gold"]
        player["prestige_points"] = player.get("prestige_points", 0) + reward["pp"]

        exp["status"] = "completed"
        duration_min = round((time.time() - exp["start_timestamp"]) / 60.0, 1)
        exp["duration_minutes"] = max(0.5, duration_min)
        exp["completed_at"] = datetime.utcnow().isoformat()

        # Archive to journal
        player["expeditions_history"].insert(0, {
            "id": exp["id"],
            "destination": exp["destination_name"],
            "companions": [c["name"] for c in exp["companions"]],
            "duration": f"{exp['duration_minutes']} menit",
            "gold_earned": reward["gold"],
            "pp_earned": reward["pp"],
            "completed_at": exp["completed_at"]
        })

        player["active_expedition_id"] = None

        return {
            "success": True,
            "report": exp,
            "reward": reward,
            "new_gold": player["gold"],
            "new_pp": player["prestige_points"],
            "message": f"🎉 Ekspedisi {exp['destination_name']} sukses besar! Laporan resmi telah diterbitkan ke Jurnal Ekspedisi (+{reward['gold']} Koin, +{reward['pp']} PP)!"
        }
