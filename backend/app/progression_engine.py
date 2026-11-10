# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Player Progression & Skill Engine (V4)
Comprehensive 12-Skill progression, XP milestones, branching skill trees, and prestige system.
"""

from typing import Dict, List, Any, Optional
import math

SKILLS_CATALOG = [
    {"id": "farming", "name": "Bercocok Tanam", "icon": "🌱", "desc": "Keahlian mengolah tanah, menanam, merawat, dan memanen hasil bumi melimpah."},
    {"id": "mining", "name": "Pertambangan", "icon": "⛏️", "desc": "Keahlian menggali batuan, menambang bijih mineral, dan memecahkan kristal kuno."},
    {"id": "fishing", "name": "Perikanan", "icon": "🎣", "desc": "Keahlian memancing ikan air tawar, biota laut dalam, dan monster perairan legendaris."},
    {"id": "foraging", "name": "Penjelajahan Hutan", "icon": "🍄", "desc": "Keahlian mengumpulkan tanaman liar, menebang pohon, dan getah rimba."},
    {"id": "crafting", "name": "Kerajinan & Tempa", "icon": "⚒️", "desc": "Keahlian menempa peralatan, membuat perkakas, dan merakit mesin peradaban."},
    {"id": "combat", "name": "Pertarungan Dungeon", "icon": "⚔️", "desc": "Keahlian membasmi monster goa, menangkis serangan, dan menaklukkan bos dunia."},
    {"id": "cooking", "name": "Kuliner & Resep", "icon": "🍳", "desc": "Keahlian mengolah bahan mentah menjadi hidangan bergizi dan peningkat stamina."},
    {"id": "social", "name": "Sosial & Diplomasi", "icon": "💬", "desc": "Keahlian berinteraksi dengan NPC, menjalin persahabatan, dan memahami gosip kota."},
    {"id": "exploration", "name": "Eksplorasi Dimensi", "icon": "🗺️", "desc": "Keahlian memetakan pulau terapung, bertahan di portal dimensi, dan menemukan rahasia."},
    {"id": "animal_care", "name": "Peternakan & Satwa", "icon": "🐾", "desc": "Keahlian memelihara hewan ternak, melatih satwa pendamping, dan menunggangi mount."},
    {"id": "building", "name": "Konstruksi Arsitektur", "icon": "🏛️", "desc": "Keahlian mendirikan bangunan kota, pabrik otomatis, dan merancang lanskap."},
    {"id": "magic", "name": "Sihir & Alkimia", "icon": "🔮", "desc": "Keahlian memanipulasi energi Aether, meracik ramuan gaib, dan menstabilkan portal."}
]

MILESTONES = [
    {"min_level": 1, "max_level": 10, "tier": "Beginner", "title": "Pemula", "color": "#94a3b8"},
    {"min_level": 11, "max_level": 20, "tier": "Apprentice", "title": "Magang", "color": "#60a5fa"},
    {"min_level": 21, "max_level": 30, "tier": "Skilled", "title": "Terampil", "color": "#34d399"},
    {"min_level": 31, "max_level": 40, "tier": "Expert", "title": "Ahli", "color": "#fbbf24"},
    {"min_level": 41, "max_level": 50, "tier": "Master", "title": "Master", "color": "#f87171"},
    {"min_level": 51, "max_level": 75, "tier": "Grandmaster", "title": "Grandmaster", "color": "#c084fc"},
    {"min_level": 76, "max_level": 100, "tier": "Legendary", "title": "Legendaris", "color": "#f43f5e"}
]

# 3 Branching trees per skill with 5 progressive perks each
SKILL_TREES_DATA: Dict[str, List[Dict[str, Any]]] = {
    "farming": [
        {
            "branch_id": "crop_mastery",
            "branch_name": "Penguasaan Tanaman (Crop Mastery)",
            "icon": "🌾",
            "perks": [
                {"id": "farm_swift_sprout", "name": "Tunas Gesit", "desc": "Pertumbuhan tanaman +15% lebih cepat.", "cost": 1, "level_req": 5},
                {"id": "farm_emerald_quality", "name": "Kualitas Zamrud", "desc": "Peluang mendapatkan panen kualitas Emas naik 25%.", "cost": 1, "level_req": 15},
                {"id": "farm_rare_seeder", "name": "Penemu Bibit Langka", "desc": "Peluang menemukan bibit kuno saat panen.", "cost": 2, "level_req": 25},
                {"id": "farm_bountiful_basket", "name": "Keranjang Melimpah", "desc": "Hasil panen gandum, bit, dan stroberi berpotensi 2x lipat.", "cost": 2, "level_req": 40},
                {"id": "farm_twin_harvest", "name": "Panen Kembar Mistis", "desc": "Setiap panen memiliki 35% peluang tidak mencabut bibit.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "land_mastery",
            "branch_name": "Penguasaan Lahan (Land Mastery)",
            "icon": "🏞️",
            "perks": [
                {"id": "farm_wide_tilling", "name": "Cangkul Lebar", "desc": "Mencangkul tanah membajak area 3x1 petak sekaligus.", "cost": 1, "level_req": 5},
                {"id": "farm_moisture_lock", "name": "Kunci Kelembapan", "desc": "Tanah yang disiram tetap basah selama 2 hari berturut-turut.", "cost": 1, "level_req": 15},
                {"id": "farm_hydro_sprinkler", "name": "Irigasi Presisi", "desc": "Sprinkler menghemat 50% jangkauan pipa air.", "cost": 2, "level_req": 25},
                {"id": "farm_micro_irrigation", "name": "Otomasi Kabut Embun", "desc": "Tanaman dalam radius greenhouse mendapat bonus kesuburan +30%.", "cost": 2, "level_req": 40},
                {"id": "farm_greenhouse_aura", "name": "Aura Rumah Kaca Abadi", "desc": "Tanaman musim apa pun dapat tumbuh subur di semua lahan pertanian.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "nature_harmony",
            "branch_name": "Harmoni Alam (Nature Harmony)",
            "icon": "🌸",
            "perks": [
                {"id": "farm_wild_bloom", "name": "Bunga Liar Harum", "desc": "Meningkatkan daya pikat lebah madu madu hutan +40%.", "cost": 1, "level_req": 5},
                {"id": "farm_pollinator_kin", "name": "Sahabat Penyerbuk", "desc": "Kupu-kupu meningkatkan kecepatan pembuahan pohon buah.", "cost": 1, "level_req": 15},
                {"id": "farm_star_season", "name": "Berkah Bintang Jatuh", "desc": "Tanaman yang dipanen saat malam hari memancarkan esensi Aether.", "cost": 2, "level_req": 25},
                {"id": "farm_moonlight_flora", "name": "Flora Sinar Bulan", "desc": "Membuka kultivasi bunga Moonflower dan Lumina Rose bernilai tinggi.", "cost": 2, "level_req": 40},
                {"id": "farm_eternal_fertility", "name": "Kesuburan Abadi", "desc": "Lahan tidak pernah kehilangan nutrisi pupuk alami.", "cost": 3, "level_req": 60}
            ]
        }
    ],
    "mining": [
        {
            "branch_id": "vein_breaker",
            "branch_name": "Pemecah Urat Bijih (Vein Breaker)",
            "icon": "💥",
            "perks": [
                {"id": "mine_solid_strike", "name": "Hantaman Padat", "desc": "Menghemat stamina menambang sebesar 20%.", "cost": 1, "level_req": 5},
                {"id": "mine_double_ore", "name": "Bijih Ganda", "desc": "25% peluang memperoleh 2 bijih tembaga/besi dari satu batu.", "cost": 1, "level_req": 15},
                {"id": "mine_gem_scent", "name": "Insting Permata", "desc": "Mendeteksi urat permata tersembunyi di dinding gua.", "cost": 2, "level_req": 25},
                {"id": "mine_deep_seam", "name": "Lapisan Purba", "desc": "Peluang menemukan Mythril dan Star Crystal meningkat 40%.", "cost": 2, "level_req": 40},
                {"id": "mine_bedrock_cleaver", "name": "Pembelah Batuan Dasar", "desc": "Bisa menghancurkan obsidian hitam dalam sekali tebas.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "geologist",
            "branch_name": "Ahli Geologi (Geologist)",
            "icon": "💎",
            "perks": [
                {"id": "mine_geode_cracker", "name": "Pemecah Geode", "desc": "Membuka geode gratis tanpa bantuan pandai besi.", "cost": 1, "level_req": 5},
                {"id": "mine_crystal_sight", "name": "Penglihatan Kristal", "desc": "Kristal menyala terang memberi penerangan alami di gua.", "cost": 1, "level_req": 15},
                {"id": "mine_rare_isotope", "name": "Isotop Murni", "desc": "Nilai jual batu mulia dan mineral olahan bertambah 35%.", "cost": 2, "level_req": 25},
                {"id": "mine_core_extractor", "name": "Ekstraktor Inti Purba", "desc": "Mampu mengekstrak Ancient Core dari puing-puing reruntuhan.", "cost": 2, "level_req": 40},
                {"id": "mine_diamond_heart", "name": "Jantung Berlian", "desc": "Menambang memberi regenerasi HP instan saat di bawah tanah.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "deep_delver",
            "branch_name": "Penjelajah Kedalaman (Deep Delver)",
            "icon": "🕯️",
            "perks": [
                {"id": "mine_torch_mastery", "name": "Obor Tahan Angin", "desc": "Radius lentera tambang bertambah 50%.", "cost": 1, "level_req": 5},
                {"id": "mine_cave_runner", "name": "Pelari Goa", "desc": "Kecepatan jalan di area tambang +25%.", "cost": 1, "level_req": 15},
                {"id": "mine_stalactite_shield", "name": "Perisai Stalaktit", "desc": "Kebal terhadap runtuhan batu gua sebesar 50%.", "cost": 2, "level_req": 25},
                {"id": "mine_echo_location", "name": "Gema Kedalaman", "desc": "Pintu tangga menuju lantai berikutnya selalu terlihat di peta goa.", "cost": 2, "level_req": 40},
                {"id": "mine_underdark_ward", "name": "Kekebalan Kegelapan Abadi", "desc": "Kebal gas beracun dan lava panas di lantai tambang ekstrem.", "cost": 3, "level_req": 60}
            ]
        }
    ],
    "fishing": [
        {
            "branch_id": "angler_technique",
            "branch_name": "Teknik Pemancing (Angler Technique)",
            "icon": "🎣",
            "perks": [
                {"id": "fish_smooth_cast", "name": "Lemparan Presisi", "desc": "Jarak lemparan joran pancing +30%.", "cost": 1, "level_req": 5},
                {"id": "fish_swift_hook", "name": "Kait Kilat", "desc": "Ikan menyambar umpan 40% lebih cepat.", "cost": 1, "level_req": 15},
                {"id": "fish_iron_grip", "name": "Cengkeraman Kuat", "desc": "Jarum tarikan pancing lebih stabil saat melawan ikan agresif.", "cost": 2, "level_req": 25},
                {"id": "fish_sea_master", "name": "Penakluk Lautan", "desc": "Tangkapan ikan kualitas Iridium meningkat 30%.", "cost": 2, "level_req": 40},
                {"id": "fish_legend_lure", "name": "Pemikat Monster Purba", "desc": "Mampu memancing ikan purba dan monster kraken kecil.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "oceanographer",
            "branch_name": "Biologi Laut (Oceanographer)",
            "icon": "🌊",
            "perks": [
                {"id": "fish_treasure_finder", "name": "Peti Harta Karun Laut", "desc": "Peluang menemukan peti harta karun saat memancing naik 35%.", "cost": 1, "level_req": 5},
                {"id": "fish_bait_crafter", "name": "Pakar Umpan Aromatik", "desc": "Membuat umpan menghasilkan 3x jumlah lebih banyak.", "cost": 1, "level_req": 15},
                {"id": "fish_crab_pot_king", "name": "Raja Bubu Kepiting", "desc": "Bubu kepiting tidak pernah menangkap sampah laut.", "cost": 2, "level_req": 25},
                {"id": "fish_pearl_diver", "name": "Penyelam Mutiara", "desc": "Tiram dan kerang laut selalu menghasilkan mutiara berkilau.", "cost": 2, "level_req": 40},
                {"id": "fish_abyssal_communion", "name": "Komuni Samudra Dalam", "desc": "Biota laut dalam tidak memberontak saat didekati kapal selam/perahu.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "tide_sailor",
            "branch_name": "Pelaut Ombak (Tide Sailor)",
            "icon": "⛵",
            "perks": [
                {"id": "fish_swift_rowing", "name": "Dayung Laju", "desc": "Kecepatan kapal dan perahu meningkat 25%.", "cost": 1, "level_req": 5},
                {"id": "fish_weather_seer", "name": "Pelihat Badai", "desc": "Mendeteksi ikan langka yang hanya muncul saat badai petir.", "cost": 1, "level_req": 15},
                {"id": "fish_cargo_hold", "name": "Palka Kapal Luas", "desc": "Kapasitas penyimpanan ikan di perahu bertambah 20 slot.", "cost": 2, "level_req": 25},
                {"id": "fish_coral_compass", "name": "Kompas Karang", "desc": "Menemukan kepulauan rahasia tak terpetakan di samudra.", "cost": 2, "level_req": 40},
                {"id": "fish_sunken_sovereign", "name": "Penguasa Kerajaan Tenggelam", "desc": "Membuka akses ke gerbang Sunken Kingdom di dasar palung laut.", "cost": 3, "level_req": 60}
            ]
        }
    ],
    "foraging": [
        {
            "branch_id": "woodcutter",
            "branch_name": "Penebang Kayu (Woodcutter)",
            "icon": "🪓",
            "perks": [
                {"id": "forage_keen_axe", "name": "Kapak Tajam", "desc": "Menebang pohon membutuhkan 25% lebih sedikit tebasan.", "cost": 1, "level_req": 5},
                {"id": "forage_hardwood_gatherer", "name": "Pencari Kayu Keras", "desc": "Semua pohon berpotensi menjatuhkan Kayu Keras berharga.", "cost": 1, "level_req": 15},
                {"id": "forage_sap_collector", "name": "Penyadap Getah Murni", "desc": "Pohon yang dipasangi tapper menghasilkan 2x getah damar.", "cost": 2, "level_req": 25},
                {"id": "forage_lumber_tycoon", "name": "Saudagar Kayu", "desc": "Harga jual segala jenis kayu dan olahan papan +30%.", "cost": 2, "level_req": 40},
                {"id": "forage_ancient_timber", "name": "Kayu Rimba Purba", "desc": "Menebang pohon memberi bibit sapling legendaris Golden Apple & Ironbark.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "botanist",
            "branch_name": "Ahli Botani (Botanist)",
            "icon": "🌿",
            "perks": [
                {"id": "forage_sharp_eye", "name": "Mata Jeli", "desc": "Tanaman liar yang dipungut selalu berkualitas tinggi.", "cost": 1, "level_req": 5},
                {"id": "forage_double_gather", "name": "Pemetik Ganda", "desc": "20% peluang memungut 2 buah berry atau jamur sekaligus.", "cost": 1, "level_req": 15},
                {"id": "forage_truffle_hound", "name": "Pencari Jamur Truffle", "desc": "Mendeteksi jamur truffle hitam langka di bawah pepohonan.", "cost": 2, "level_req": 25},
                {"id": "forage_wild_herbalist", "name": "Herbalis Liar", "desc": "Tanaman liar memulihkan 50% stamina lebih banyak jika dikonsumsi.", "cost": 2, "level_req": 40},
                {"id": "forage_flora_miracle", "name": "Mukjizat Alam Liar", "desc": "Tanaman liar tumbuh kembali 2x lebih cepat di seluruh peta.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "ranger",
            "branch_name": "Ranger Rimba (Ranger)",
            "icon": "🏹",
            "perks": [
                {"id": "forage_trail_blazer", "name": "Perintis Jalan", "desc": "Kecepatan lari di area hutan lebat bertambah 20%.", "cost": 1, "level_req": 5},
                {"id": "forage_foraging_tracker", "name": "Pelacak Jejak", "desc": "Ikon jamur dan bahan liar muncul di minimap.", "cost": 1, "level_req": 15},
                {"id": "forage_wild_honey", "name": "Pemanen Madu Liar", "desc": "Sarang lebah liar di hutan dapat dipanen tanpa tersengat.", "cost": 2, "level_req": 25},
                {"id": "forage_forest_sanctuary", "name": "Suaka Rimba", "desc": "Hewan hutan liar bersahabat dan memberikan hadiah acak.", "cost": 2, "level_req": 40},
                {"id": "forage_spirit_whisper", "name": "Bisikan Roh Hutan", "desc": "Membuka rahasia dan jalan pintas tersembunyi di Whispering Forest.", "cost": 3, "level_req": 60}
            ]
        }
    ]
}

def calculate_level_from_xp(xp: int) -> int:
    """Calculate skill level (1-100) based on accumulated XP."""
    if xp <= 0:
        return 1
    # Exponential progression curve: Level = int((xp / 100) ** (1 / 1.65)) + 1
    level = int(math.pow(max(0, xp) / 100.0, 1.0 / 1.65)) + 1
    return max(1, min(100, level))

def calculate_xp_for_level(level: int) -> int:
    """Calculate the cumulative XP required to reach a specific level."""
    if level <= 1:
        return 0
    return int(100.0 * math.pow(level - 1, 1.65))

def get_milestone_info(level: int) -> Dict[str, Any]:
    """Retrieve tier milestone info for a given skill level."""
    for m in MILESTONES:
        if m["min_level"] <= level <= m["max_level"]:
            return m
    return MILESTONES[-1]

class ProgressionEngine:
    """Manages player skill trees, global level, prestige, and XP awards."""

    @staticmethod
    def ensure_progression_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure all 12 skills and progression structures exist in player dictionary."""
        if "skills" not in player:
            player["skills"] = {}
        
        skills = player["skills"]
        for cat in SKILLS_CATALOG:
            s_id = cat["id"]
            if s_id not in skills:
                # migrate from legacy profession_levels if available
                legacy_prof = player.get("profession_levels", {})
                legacy_lvl = 1
                if s_id == "farming":
                    legacy_lvl = legacy_prof.get("farmer", 2)
                elif s_id == "mining":
                    legacy_lvl = legacy_prof.get("miner", 1)
                elif s_id == "combat":
                    legacy_lvl = legacy_prof.get("warrior", 1)
                elif s_id == "crafting":
                    legacy_lvl = legacy_prof.get("engineer", 1)
                
                initial_xp = calculate_xp_for_level(legacy_lvl)
                skills[s_id] = {
                    "id": s_id,
                    "name": cat["name"],
                    "icon": cat["icon"],
                    "level": legacy_lvl,
                    "xp": initial_xp,
                    "next_level_xp": calculate_xp_for_level(legacy_lvl + 1),
                    "milestone": get_milestone_info(legacy_lvl)["title"],
                    "perk_points": legacy_lvl - 1,
                    "unlocked_perks": [],
                    "prestige_level": 0,
                    "prestige_title": None
                }
            else:
                # sanitize fields
                sk = skills[s_id]
                lvl = calculate_level_from_xp(sk.get("xp", 0))
                sk["level"] = lvl
                sk["next_level_xp"] = calculate_xp_for_level(lvl + 1)
                sk["milestone"] = get_milestone_info(lvl)["title"]
                if "perk_points" not in sk:
                    sk["perk_points"] = max(0, lvl - 1 - len(sk.get("unlocked_perks", [])))
                if "unlocked_perks" not in sk:
                    sk["unlocked_perks"] = []
                if "prestige_level" not in sk:
                    sk["prestige_level"] = 0
                if "prestige_title" not in sk:
                    sk["prestige_title"] = None

        # Calculate Global Player Level
        total_lvls = sum(sk["level"] for sk in skills.values())
        player["global_level"] = max(1, total_lvls // 12)
        player["total_skill_levels"] = total_lvls
        
        return player

    @staticmethod
    def add_skill_xp(player: Dict[str, Any], skill_id: str, amount: int) -> Dict[str, Any]:
        """Award XP to a specific skill, handle level-up events, and calculate milestones."""
        ProgressionEngine.ensure_progression_state(player)
        if skill_id not in player["skills"]:
            return {"error": f"Skill '{skill_id}' tidak ditemukan."}

        sk = player["skills"][skill_id]
        old_level = sk["level"]
        sk["xp"] = max(0, sk["xp"] + amount)
        new_level = calculate_level_from_xp(sk["xp"])
        
        level_up = new_level > old_level
        levels_gained = max(0, new_level - old_level)
        if level_up:
            sk["level"] = new_level
            sk["perk_points"] = sk.get("perk_points", 0) + levels_gained
            sk["milestone"] = get_milestone_info(new_level)["title"]

        sk["next_level_xp"] = calculate_xp_for_level(new_level + 1)
        
        # update global level
        total_lvls = sum(s["level"] for s in player["skills"].values())
        player["global_level"] = max(1, total_lvls // 12)
        player["total_skill_levels"] = total_lvls

        return {
            "skill_id": skill_id,
            "xp_added": amount,
            "current_xp": sk["xp"],
            "level": new_level,
            "level_up": level_up,
            "levels_gained": levels_gained,
            "milestone": sk["milestone"],
            "perk_points": sk["perk_points"],
            "global_level": player["global_level"]
        }

    @staticmethod
    def unlock_skill_perk(player: Dict[str, Any], skill_id: str, perk_id: str) -> Dict[str, Any]:
        """Unlock a skill tree perk node by spending available perk points."""
        ProgressionEngine.ensure_progression_state(player)
        if skill_id not in player["skills"]:
            return {"success": False, "error": f"Skill '{skill_id}' tidak valid."}

        sk = player["skills"][skill_id]
        if perk_id in sk.get("unlocked_perks", []):
            return {"success": False, "error": "Perk ini sudah pernah diaktifkan."}

        # Find perk in trees
        branches = SKILL_TREES_DATA.get(skill_id, [])
        found_perk = None
        for b in branches:
            for p in b.get("perks", []):
                if p["id"] == perk_id:
                    found_perk = p
                    break
            if found_perk:
                break

        if not found_perk:
            # Fallback for other skills without detailed trees yet
            found_perk = {"id": perk_id, "name": perk_id.replace("_", " ").title(), "cost": 1, "level_req": 5}

        # Validate level requirement and cost
        if sk["level"] < found_perk.get("level_req", 1):
            return {"success": False, "error": f"Memerlukan Level {found_perk.get('level_req')} untuk membuka perk ini."}

        cost = found_perk.get("cost", 1)
        if sk.get("perk_points", 0) < cost:
            return {"success": False, "error": f"Poin perk tidak cukup. Membutuhkan {cost} poin."}

        sk["perk_points"] -= cost
        sk["unlocked_perks"].append(perk_id)

        return {
            "success": True,
            "skill_id": skill_id,
            "perk": found_perk,
            "remaining_points": sk["perk_points"],
            "unlocked_perks": sk["unlocked_perks"]
        }

    @staticmethod
    def activate_prestige(player: Dict[str, Any], skill_id: str) -> Dict[str, Any]:
        """Activate Prestige for a skill that reached max/mastery level (Lv 50+ or 100)."""
        ProgressionEngine.ensure_progression_state(player)
        if skill_id not in player["skills"]:
            return {"success": False, "error": f"Skill '{skill_id}' tidak valid."}

        sk = player["skills"][skill_id]
        if sk["level"] < 50:
            return {"success": False, "error": f"Syarat aktivasi Prestige adalah Level 50+. Level saat ini: {sk['level']}."}

        sk["prestige_level"] = sk.get("prestige_level", 0) + 1
        title_name = f"Grandmaster {sk['name']} Presisi"
        sk["prestige_title"] = title_name

        # Reward prestige bonus without wiping user's items or level
        if "prestige_badges" not in player:
            player["prestige_badges"] = []
        badge = {"skill_id": skill_id, "tier": sk["prestige_level"], "title": title_name}
        player["prestige_badges"].append(badge)

        return {
            "success": True,
            "skill_id": skill_id,
            "prestige_level": sk["prestige_level"],
            "prestige_title": title_name,
            "message": f"Selamat! Anda berhasil mencapai Prestige Tingkat {sk['prestige_level']} untuk {sk['name']}!"
        }
