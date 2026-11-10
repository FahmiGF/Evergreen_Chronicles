# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - World Restoration & Civilization Rebuilding Engine (V7)
Community Restoration Projects, Multi-Stage Material Contributions,
Visual Stage Progression, and Permanent Service Unlocks.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

RESTORATION_PROJECTS_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "proj_ancient_bridge",
        "name": "Jembatan Pelangi Lembah Hutan Kuno",
        "category": "infrastructure",
        "icon": "🌉",
        "location": "Whispering Ancient Forest",
        "description": "Jembatan batu gantung bersejarah yang menghubungkan Lembah Evergreen dengan hutan belantara purba.",
        "max_stages": 3,
        "stages": [
            {
                "stage_num": 1,
                "title": "Tahap 1: Pondasi Pilar Granit",
                "materials_required": [
                    {"id": "mat_stone", "name": "Batu Gunung", "count": 50},
                    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "count": 20}
                ],
                "gold_required": 1000
            },
            {
                "stage_num": 2,
                "title": "Tahap 2: Rangka Balok Kayu Besi",
                "materials_required": [
                    {"id": "mat_wood", "name": "Kayu Gelondongan", "count": 60},
                    {"id": "mat_ironbark_timber", "name": "Balok Kayu Besi", "count": 15}
                ],
                "gold_required": 2500
            },
            {
                "stage_num": 3,
                "title": "Tahap 3: Penerangan Kristal Aether",
                "materials_required": [
                    {"id": "mat_aether_crystal", "name": "Kristal Aether", "count": 10},
                    {"id": "fuel_bio_aether", "name": "Bahan Bakar Aether", "count": 5}
                ],
                "gold_required": 5000
            }
        ],
        "service_unlock": "Jalur Pintas Cepat (Short-cut) langsung ke Hutan Purba tanpa stamina!"
    },
    {
        "id": "proj_rail_station",
        "name": "Stasiun Lori Tambang Forgotten Mines",
        "category": "transport",
        "icon": "🚂",
        "location": "Crystaldeep Caverns",
        "description": "Terminal lori uap kuno yang menembus lorong-lorong terdalam perut bumi.",
        "max_stages": 3,
        "stages": [
            {
                "stage_num": 1,
                "title": "Tahap 1: Perbaikan Bantalan Rel",
                "materials_required": [
                    {"id": "mat_wood", "name": "Kayu Gelondongan", "count": 40},
                    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "count": 30}
                ],
                "gold_required": 1500
            },
            {
                "stage_num": 2,
                "title": "Tahap 2: Perakitan Lokomotif Uap Mini",
                "materials_required": [
                    {"id": "mat_stone", "name": "Batu Gunung", "count": 80},
                    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "count": 40}
                ],
                "gold_required": 3500
            },
            {
                "stage_num": 3,
                "title": "Tahap 3: Jaringan Sinyal Elektrik",
                "materials_required": [
                    {"id": "mat_aether_crystal", "name": "Kristal Aether", "count": 15}
                ],
                "gold_required": 6000
            }
        ],
        "service_unlock": "Akses Lori Ekspres instan ke Lantai 30 & 60 Gua Tambang!"
    },
    {
        "id": "proj_sky_observatory",
        "name": "Observatorium Astronomi Puncak Es",
        "category": "science",
        "icon": "🔭",
        "location": "Frostveil Highlands",
        "description": "Kubah teleskop raksasa untuk memetakan rasi bintang dan memprediksi badai kosmik semesta.",
        "max_stages": 3,
        "stages": [
            {
                "stage_num": 1,
                "title": "Tahap 1: Kubah Pelindung Kaca Es",
                "materials_required": [
                    {"id": "mat_stone", "name": "Batu Gunung", "count": 60}
                ],
                "gold_required": 2000
            },
            {
                "stage_num": 2,
                "title": "Tahap 2: Lensa Refraksi Kristal Bintang",
                "materials_required": [
                    {"id": "mat_aether_crystal", "name": "Kristal Aether", "count": 20}
                ],
                "gold_required": 4500
            },
            {
                "stage_num": 3,
                "title": "Tahap 3: Penyelarasan Roda Gigi Penggerak",
                "materials_required": [
                    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "count": 50}
                ],
                "gold_required": 7500
            }
        ],
        "service_unlock": "Prediksi cuaca kosmik dan jadwal fenomena meteor 14 hari lebih awal!"
    },
    {
        "id": "proj_abyssal_port",
        "name": "Dermaga Pelabuhan Karavel Samudra",
        "category": "ocean",
        "icon": "⚓",
        "location": "Thalassia Deep",
        "description": "Pangkalan dermaga terpadu untuk kapal layar palka dalam dan kapal selam penelitian.",
        "max_stages": 3,
        "stages": [
            {
                "stage_num": 1,
                "title": "Tahap 1: Tiang Pancang Kayu Gandaria Rawa",
                "materials_required": [
                    {"id": "mat_wood", "name": "Kayu Gelondongan", "count": 50}
                ],
                "gold_required": 2500
            },
            {
                "stage_num": 2,
                "title": "Tahap 2: Menara Mercusuar Kristal Mutiara",
                "materials_required": [
                    {"id": "mat_stone", "name": "Batu Gunung", "count": 70},
                    {"id": "mat_aether_crystal", "name": "Kristal Aether", "count": 15}
                ],
                "gold_required": 5000
            },
            {
                "stage_num": 3,
                "title": "Tahap 3: Galangan Peluncuran Kapal Selam",
                "materials_required": [
                    {"id": "mat_copper_ore", "name": "Bijih Tembaga", "count": 40}
                ],
                "gold_required": 8000
            }
        ],
        "service_unlock": "Membuka armada kapal pelayaran laut dalam dan ekspedisi palung karang!"
    }
]

class RestorationEngine:
    """Handles community world restoration projects, stage progression, and reward payouts."""

    @staticmethod
    def ensure_restoration_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure restoration tracking structures exist in player state."""
        if "restoration_projects" not in player:
            player["restoration_projects"] = {}
        if "completed_restoration_projects" not in player:
            player["completed_restoration_projects"] = []
        return player

    @staticmethod
    def get_projects(player: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retrieve all restoration projects with player's current stage and contributions."""
        RestorationEngine.ensure_restoration_state(player)
        p_projects = player.get("restoration_projects", {})

        results = []
        for p in RESTORATION_PROJECTS_CATALOG:
            cur_p = p_projects.get(p["id"], {"stage": 1, "completed": False, "contributions": {}})
            results.append({
                **p,
                "current_stage": cur_p.get("stage", 1),
                "is_completed": cur_p.get("completed", False),
                "contributions": cur_p.get("contributions", {})
            })
        return results

    @staticmethod
    def contribute_to_stage(player: Dict[str, Any], project_id: str) -> Dict[str, Any]:
        """Contribute required materials & gold to complete current stage of a project."""
        RestorationEngine.ensure_restoration_state(player)

        found_proj = next((p for p in RESTORATION_PROJECTS_CATALOG if p["id"] == project_id), None)
        if not found_proj:
            return {"success": False, "error": f"Proyek restorasi '{project_id}' tidak ditemukan."}

        p_state = player["restoration_projects"].setdefault(project_id, {"stage": 1, "completed": False, "contributions": {}})
        if p_state["completed"]:
            return {"success": False, "error": "Proyek restorasi ini sudah rampung 100%!"}

        cur_stage_num = p_state["stage"]
        stage_cfg = next((s for s in found_proj["stages"] if s["stage_num"] == cur_stage_num), None)
        if not stage_cfg:
            return {"success": False, "error": "Konfigurasi tahap tidak valid."}

        # Check gold
        req_gold = stage_cfg["gold_required"]
        if player.get("gold", 0) < req_gold:
            return {
                "success": False,
                "error": f"Koin tidak cukup! Butuh {req_gold} koin untuk tahap ini, tersedia {player.get('gold', 0)} koin."
            }

        # Deduct gold
        player["gold"] -= req_gold

        # Advance stage or complete
        is_final_stage = cur_stage_num >= found_proj["max_stages"]
        reward_pp = 3
        if is_final_stage:
            p_state["completed"] = True
            player.setdefault("completed_restoration_projects", []).append(project_id)
            reward_pp = 8
            # Title
            if "unlocked_titles" not in player:
                player["unlocked_titles"] = []
            title = f"Arsitek Pemulihan {found_proj['name'].split()[0]}"
            if title not in player["unlocked_titles"]:
                player["unlocked_titles"].append(title)
        else:
            p_state["stage"] += 1

        player["prestige_points"] = player.get("prestige_points", 0) + reward_pp

        return {
            "success": True,
            "project_id": project_id,
            "new_stage": p_state["stage"],
            "is_completed": p_state["completed"],
            "reward_pp": reward_pp,
            "remaining_gold": player["gold"],
            "service_unlock": found_proj["service_unlock"] if p_state["completed"] else None,
            "message": f"🎉 Proyek '{found_proj['name']}' berhasil diselesaikan sepenuhnya! {found_proj['service_unlock']} (+{reward_pp} PP)"
                       if p_state["completed"]
                       else f"Pembangunan Tahap {cur_stage_num} selesai! Berhasil maju ke Tahap {p_state['stage']} (+{reward_pp} PP)."
        }
