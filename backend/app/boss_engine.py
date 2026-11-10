# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Boss Encounter & Multi-Phase Puzzle Engine (V7)
10 Thematic World Bosses, 3-Phase Non-Violent Puzzle/Environmental Encounters,
Server-Authoritative State Machines, and Idempotent Anti-Duplicate Rewards.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import time

BOSSES_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "boss_grove_guardian",
        "name": "The Ancient Grove Guardian",
        "zone_id": "ancient_forest",
        "zone_name": "Whispering Ancient Forest",
        "icon": "🌳",
        "description": "Penjaga purba hutan belantara berwujud pohon titan mistis yang tertidur akibat polusi tanaman parasit.",
        "difficulty": "Normal",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Forest Awakening (Kebangkitan Rimba)",
                "objective_desc": "Bersihkan 4 parasit akar beracun di sekeliling pelindung pohon tua.",
                "target_count": 4,
                "puzzle_hint": "Gunakan herba moonleaf untuk melarutkan getah parasit hitam."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Rootbound Trial (Ujian Akar Melilit)",
                "objective_desc": "Hubungkan 3 titik simpul energi tanah gembur dalam arena.",
                "target_count": 3,
                "puzzle_hint": "Langkahi lempengan lumut bercahaya secara berurutan sesuai arah jarum jam."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Heart of the Grove (Jantung Hutan Lestari)",
                "objective_desc": "Alirkan getah murni spirit mushroom ke dalam inti altar utama.",
                "target_count": 1,
                "puzzle_hint": "Posisikan bejana air suci tepat di bawah sinar matahari kanopi."
            }
        ],
        "rewards": {
            "gold": 3500,
            "pp": 5,
            "items": ["mat_ancient_wood", "shroom_spirit"],
            "title": "Penjaga Rimba Purba",
            "blueprint": "bp_guardian_shrine"
        }
    },
    {
        "id": "boss_crystal_colossus",
        "name": "The Crystal Colossus",
        "zone_id": "crystal_caverns",
        "zone_name": "Crystaldeep Caverns",
        "icon": "💎",
        "description": "Golem geoda kristal bawah tanah yang kehilangan sinkronisasi resonansi akibat gempa tektonik.",
        "difficulty": "Hard",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Harmonic Resonance (Resonansi Kristal)",
                "objective_desc": "Pukul 4 kristal pilar dengan Beliung sesuai tangga nada pendar safir.",
                "target_count": 4,
                "puzzle_hint": "Dengarkan dentingan nada dari rendah ke tinggi (Do - Mi - Sol - Si)."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Shattered Hall (Prisma Cahaya)",
                "objective_desc": "Putar 3 prisma cermin untuk memantulkan berkas cahaya ke dada golem.",
                "target_count": 3,
                "puzzle_hint": "Arahkan pantulan cahaya kuning dan biru hingga membentuk spektrum hijau."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Crystal Heart Stabilization (Stabilisasi Inti)",
                "objective_desc": "Masukkan Star Crystal ke dalam inti geoda yang berdenyut stabil.",
                "target_count": 1,
                "puzzle_hint": "Tunggu hingga denyut frekuensi berada di angka resonansi 432 Hz."
            }
        ],
        "rewards": {
            "gold": 4000,
            "pp": 6,
            "items": ["gem_star_crystal", "ore_luminous"],
            "title": "Penakluk Palung Kristal",
            "blueprint": "bp_crystal_polisher_v7"
        }
    },
    {
        "id": "boss_frostbound_warden",
        "name": "The Frostbound Warden",
        "zone_id": "frostveil_highlands",
        "zone_name": "Frostveil Highlands",
        "icon": "❄️",
        "description": "Pelindung gletser es kutub yang membeku dalam badai salju abadi.",
        "difficulty": "Hard",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Frozen Observatory (Pemanasan Observatorium)",
                "objective_desc": "Nyalakan 4 tungku api pemanas arang di sekeliling menara pengamat.",
                "target_count": 4,
                "puzzle_hint": "Gunakan minyak pinus kering untuk menyalakan bara di tengah hembusan angin."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Aurora Labyrinth (Labirin Cahaya Kutub)",
                "objective_desc": "Temukan jalan menembus 3 dinding kabut es menggunakan petunjuk aurora.",
                "target_count": 3,
                "puzzle_hint": "Ikuti alur pendaran warna ungu aurora di langit utara."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Winter's Balance (Keseimbangan Musim Dingin)",
                "objective_desc": "Letakkan bunga Ice Bloom di atas singgasana kristal gletser.",
                "target_count": 1,
                "puzzle_hint": "Jaga kestabilan suhu agar kelopak es tidak meleleh saat penyerahan."
            }
        ],
        "rewards": {
            "gold": 5000,
            "pp": 7,
            "items": ["mat_aurora_shard", "ore_frost_iron"],
            "title": "Ksatria Aurora Salju Abadi",
            "blueprint": "bp_ice_racing_sled"
        }
    },
    {
        "id": "boss_sandstone_sovereign",
        "name": "The Sandstone Sovereign",
        "zone_id": "sunscar_desert",
        "zone_name": "Sunscar Desert",
        "icon": "🏜️",
        "description": "Penguasa monolit gurun pasir yang menjaga pintu air bawah tanah peradaban oasis purba.",
        "difficulty": "Hard",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Lost Archive (Aksara Gurun Pasir)",
                "objective_desc": "Kumpulkan 3 fragmen tablet hieroglif yang tersapu badai pasir.",
                "target_count": 3,
                "puzzle_hint": "Gunakan kuas ekskavasi halus pada gundukan pasir di balik pilar obelisk."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Royal Trial (Keseimbangan Platform Monolit)",
                "objective_desc": "Imbangi 3 timbangan bebatuan pasir tanpa memicu runtuhan debu.",
                "target_count": 3,
                "puzzle_hint": "Sesuaikan berat batu pasir di mangkuk kiri dan kanan secara presisi."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Oasis Restoration (Pengaliran Saluran Air)",
                "objective_desc": "Putar tuas katup air bawah tanah untuk mengisi kembali kolam oasis Al-Zahra.",
                "target_count": 1,
                "puzzle_hint": "Sejajarkan saluran pipa tembaga purba hingga indikator tekanan hijau menyala."
            }
        ],
        "rewards": {
            "gold": 6000,
            "pp": 8,
            "items": ["gem_sunstone", "art_ancient_relics"],
            "title": "Sultan Penjaga Lembah Pasir",
            "blueprint": "bp_oasis_hydro_pump"
        }
    },
    {
        "id": "boss_tempest_architect",
        "name": "The Tempest Architect",
        "zone_id": "skyreach_archipelago",
        "zone_name": "Skyreach Archipelago",
        "icon": "⚡",
        "description": "Automaton arsitek langit purba yang mengontrol stabilitas gravitasi pulau-pulau melayang.",
        "difficulty": "Master",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Sky Routes (Menara Suar Navigasi)",
                "objective_desc": "Aktifkan 3 suar navigasi awan menggunakan Paralayang Aether.",
                "target_count": 3,
                "puzzle_hint": "Manfaatkan hembusan arus angin ke atas (updrafts) untuk mencapai suar tertinggi."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Storm Observatory (Sakelar Platform Angkasa)",
                "objective_desc": "Kordinasikan penekanan 4 sakelar listrik badai secara berurutan.",
                "target_count": 4,
                "puzzle_hint": "Perhatikan kedipan lampu kilat petir untuk mengetahui urutan nomor sakelar."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Sky Engine Stabilization (Turbin Cuaca)",
                "objective_desc": "Kalibrasi putaran turbin angin raksasa ke frekuensi harmonis netral.",
                "target_count": 1,
                "puzzle_hint": "Gunakan Wind Essence untuk meredam putaran rotor yang berlebih."
            }
        ],
        "rewards": {
            "gold": 7500,
            "pp": 9,
            "items": ["mat_wind_essence", "mat_cloudstone"],
            "title": "Arsitek Angkasa Agung",
            "blueprint": "bp_celestial_glider_mk2"
        }
    },
    {
        "id": "boss_mycelium_heart",
        "name": "The Mycelium Heart",
        "zone_id": "mycelia_wilds",
        "zone_name": "Mycelia Wilds",
        "icon": "🍄",
        "description": "Entitas spora purba pengendali jaringan komunikasi bawah tanah seluruh spesies flora Evergreen.",
        "difficulty": "Hard",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Spore Garden (Taman Spora Penawar)",
                "objective_desc": "Kultivasikan 3 bibit jamur Dreamcap untuk menetralkan kabut halusinasi.",
                "target_count": 3,
                "puzzle_hint": "Taburkan pupuk organik spora di petak tanah gambut lembap."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Root Network (Jaringan Simbiosis Hifa)",
                "objective_desc": "Sambungkan 4 jalur serat benang hifa bercahaya ke batang induk.",
                "target_count": 4,
                "puzzle_hint": "Sambungkan warna serat yang identik (Merah muda ke merah muda, cyan ke cyan)."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Ecosystem Balance (Detoksifikasi Inti Jamur)",
                "objective_desc": "Tuangkan larutan getah spora murni ke pusat kubah jantung jamur.",
                "target_count": 1,
                "puzzle_hint": "Tunggu hingga katup ventilasi melepaskan uap oksigen murni."
            }
        ],
        "rewards": {
            "gold": 5500,
            "pp": 7,
            "items": ["shroom_dreamcap", "mat_spore_resin"],
            "title": "Sahabat Simbiosis Spora",
            "blueprint": "bp_spore_incubation_chamber"
        }
    },
    {
        "id": "boss_emberheart_titan",
        "name": "The Emberheart Titan",
        "zone_id": "emberfall_caldera",
        "zone_name": "Emberfall Caldera",
        "icon": "🌋",
        "description": "Raksasa magma berzirah batuan basal yang mengalirkan energi panas bumi ke perapian pulau.",
        "difficulty": "Master",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Caldera Mapping (Pemetaan Titik Panas)",
                "objective_desc": "Pasang 3 sensor termal di bibir ventilasi semburan geyser magma.",
                "target_count": 3,
                "puzzle_hint": "Hindari uap belerang tebal dengan mendekati sisi angin tenang."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Forge Restoration (Katup Pendingin Lava)",
                "objective_desc": "Tarik 4 tuas air pendingin laut untuk menghentikan luapan lahar panas.",
                "target_count": 4,
                "puzzle_hint": "Tarik tuas secara diagonal silang untuk meratakan tekanan hidrolik."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Emberheart Equilibrium (Penstabilan Inti Termal)",
                "objective_desc": "Kunci Heat Core ke dalam tungku reaktor geotermal utama.",
                "target_count": 1,
                "puzzle_hint": "Gunakan penjepit tempa baja titanium untuk mencegah percikan api."
            }
        ],
        "rewards": {
            "gold": 7000,
            "pp": 8,
            "items": ["core_heat", "ore_emberstone"],
            "title": "Penakluk Kawah Lahar",
            "blueprint": "bp_geothermal_generator"
        }
    },
    {
        "id": "boss_abyssal_sentinel",
        "name": "The Abyssal Sentinel",
        "zone_id": "thalassia_deep",
        "zone_name": "Thalassia Deep",
        "icon": "🌊",
        "description": "Monster laut mekanik bercangkang mutiara yang menjaga gerbang istana palung terdalam.",
        "difficulty": "Master",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Coral Archive (Pemulihan Terumbu Karang)",
                "objective_desc": "Bersihkan 4 polip karang purba dari endapan sedimen beracun.",
                "target_count": 4,
                "puzzle_hint": "Gunakan gelembung sonar kapal selam untuk mengangkat debu palung."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Sunken Library (Prasasti Mutiara Samudra)",
                "objective_desc": "Pecahkan sandi 3 lempeng marmer beraksara gelombang air.",
                "target_count": 3,
                "puzzle_hint": "Hitung jumlah sirip pada ukiran ikan lumba-lumba di samping prasasti."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Tidal Engine Balance (Penyeimbangan Arus Laut)",
                "objective_desc": "Sisipkan Pearlstone ke dalam cincin konduktor arus samudra.",
                "target_count": 1,
                "puzzle_hint": "Luncurkan mutiara tepat saat arus air tenang berputar searah jarum jam."
            }
        ],
        "rewards": {
            "gold": 8000,
            "pp": 9,
            "items": ["gem_pearlstone", "herb_abyssal_kelp"],
            "title": "Penyelam Samudra Abyssal",
            "blueprint": "bp_abyssal_submarine_mk2"
        }
    },
    {
        "id": "boss_last_crownkeeper",
        "name": "The Last Crownkeeper",
        "zone_id": "verdant_ruins",
        "zone_name": "Verdant Kingdom Ruins",
        "icon": "👑",
        "description": "Ksatria automaton agung berlapis emas yang tetap berjaga menanti kebangkitan kembali mahkota peradaban.",
        "difficulty": "Legendary",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Royal Timeline (Rekonstruksi Sejarah Raja)",
                "objective_desc": "Susun kembali 4 lukisan mozaik silsilah dinasti kerajaan Evergreen.",
                "target_count": 4,
                "puzzle_hint": "Urutkan mulai dari Era Pertanian Kuno hingga Era Modern Aether."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Forgotten Court (Ruang Ujian Ksatria)",
                "objective_desc": "Selesaikan 3 tantangan teka-teki mekanik di sayap istana megah.",
                "target_count": 3,
                "puzzle_hint": "Gunakan pedang Aether untuk memantulkan energi ke 3 lambang perisai."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: Crown of Renewal (Pemberian Mahkota Pembaharuan)",
                "objective_desc": "Persembahkan Mahkota Bunga Aether di atas altar penyucian raja.",
                "target_count": 1,
                "puzzle_hint": "Tundukkan kepala dalam rasa hormat di depan singgasana emas leluhur."
            }
        ],
        "rewards": {
            "gold": 10000,
            "pp": 12,
            "items": ["mat_royal_timber", "mat_relic_alloy"],
            "title": "Pewaris Takhta Kerajaan Evergreen",
            "blueprint": "bp_grand_castle_architecture"
        }
    },
    {
        "id": "boss_astral_paragon",
        "name": "The Astral Paragon",
        "zone_id": "astral_frontier",
        "zone_name": "Astral Frontier",
        "icon": "🌌",
        "description": "Wujud kesadaran murni alam semesta yang menguji kelayakan peradaban petani mencapai pencerahan bintang.",
        "difficulty": "Endgame Mythic",
        "phases": [
            {
                "phase_num": 1,
                "title": "Tahap 1: Constellation Archive (Konstelasi Bintang Jatuh)",
                "objective_desc": "Hubungkan 5 gugusan bintang membentuk rasi Plow (Bajak Langit).",
                "target_count": 5,
                "puzzle_hint": "Tarik garis spektrum cahaya dari Polaris menuju bintang Aether Alpha."
            },
            {
                "phase_num": 2,
                "title": "Tahap 2: Astral Observatory (Prisma Kosmik Berotasi)",
                "objective_desc": "Selaraskan 4 cincin rotasi prisma debu nebula di ruang hampa.",
                "target_count": 4,
                "puzzle_hint": "Cocokkan kecepatan orbit cincin dalam dan cincin luar secara sinkron."
            },
            {
                "phase_num": 3,
                "title": "Tahap 3: The Great Alignment (Penyelarasan Agung Semesta)",
                "objective_desc": "Tanamkan Celestial Seed di pusat orbit galaksi buatan.",
                "target_count": 1,
                "puzzle_hint": "Siram dengan embun galaksi murni pada momen gerhana bintang kembar."
            }
        ],
        "rewards": {
            "gold": 20000,
            "pp": 20,
            "items": ["ore_astral", "seed_celestial"],
            "title": "Penguasa Galaksi & Semesta Abadi",
            "blueprint": "bp_astral_portal_sanctuary"
        }
    }
]

# Server-Authoritative Active Encounter State Memory
ACTIVE_ENCOUNTERS: Dict[str, Dict[str, Any]] = {}

class BossEngine:
    """Server-authoritative multi-phase puzzle boss encounter engine with idempotent rewards."""

    @staticmethod
    def ensure_boss_records(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure boss codex history structures exist in player state."""
        if "boss_records" not in player:
            player["boss_records"] = {}
        if "claimed_boss_rewards" not in player:
            player["claimed_boss_rewards"] = []
        return player

    @staticmethod
    def get_boss_catalog(player: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Return catalog of all 10 bosses with player's victory records and codex entries."""
        BossEngine.ensure_boss_records(player)
        records = player.get("boss_records", {})

        catalog = []
        for b in BOSSES_CATALOG:
            rec = records.get(b["id"], {})
            catalog.append({
                **b,
                "victories": rec.get("victories", 0),
                "best_time_sec": rec.get("best_time_sec", None),
                "last_victory": rec.get("last_victory", None),
                "unlocked_codex": rec.get("victories", 0) > 0
            })
        return catalog

    @staticmethod
    def start_encounter(player: Dict[str, Any], boss_id: str, mode: str = "standard") -> Dict[str, Any]:
        """Initialize an active boss puzzle encounter state machine."""
        found_boss = next((b for b in BOSSES_CATALOG if b["id"] == boss_id), None)
        if not found_boss:
            return {"success": False, "error": f"Boss '{boss_id}' tidak ditemukan di arsip dunia."}

        encounter_id = f"enc_{boss_id}_{int(time.time())}"
        first_phase = found_boss["phases"][0]

        encounter_state = {
            "encounter_id": encounter_id,
            "boss_id": boss_id,
            "boss_name": found_boss["name"],
            "mode": mode,
            "status": "active",
            "current_phase": 1,
            "max_phases": len(found_boss["phases"]),
            "phase_title": first_phase["title"],
            "objective_desc": first_phase["objective_desc"],
            "progress": 0,
            "target": first_phase["target_count"],
            "puzzle_hint": first_phase["puzzle_hint"],
            "started_at": datetime.utcnow().isoformat(),
            "start_timestamp": time.time(),
            "completed": False
        }

        ACTIVE_ENCOUNTERS[encounter_id] = encounter_state

        return {
            "success": True,
            "encounter": encounter_state,
            "message": f"Pertemuan Boss Dimulai: {found_boss['name']} — {first_phase['title']}!"
        }

    @staticmethod
    def progress_objective(encounter_id: str, amount: int = 1) -> Dict[str, Any]:
        """Advance progress for current boss phase objective."""
        if encounter_id not in ACTIVE_ENCOUNTERS:
            return {"success": False, "error": "Encounter tidak aktif atau telah kedaluwarsa."}

        enc = ACTIVE_ENCOUNTERS[encounter_id]
        if enc["status"] != "active":
            return {"success": False, "error": f"Encounter berstatus '{enc['status']}', tidak dapat diproses."}

        enc["progress"] = min(enc["target"], enc["progress"] + max(1, amount))
        phase_completed = enc["progress"] >= enc["target"]

        found_boss = next(b for b in BOSSES_CATALOG if b["id"] == enc["boss_id"])

        if phase_completed:
            # Check if there are further phases
            if enc["current_phase"] < enc["max_phases"]:
                enc["current_phase"] += 1
                next_phase = found_boss["phases"][enc["current_phase"] - 1]
                enc["progress"] = 0
                enc["target"] = next_phase["target_count"]
                enc["phase_title"] = next_phase["title"]
                enc["objective_desc"] = next_phase["objective_desc"]
                enc["puzzle_hint"] = next_phase["puzzle_hint"]

                return {
                    "success": True,
                    "phase_transition": True,
                    "new_phase": enc["current_phase"],
                    "encounter": enc,
                    "message": f"⚡ Transisi Tahap! Lanjut ke {next_phase['title']}!"
                }
            else:
                enc["status"] = "completed"
                enc["completed"] = True
                duration = round(time.time() - enc["start_timestamp"], 1)
                enc["duration_sec"] = duration

                return {
                    "success": True,
                    "encounter_completed": True,
                    "duration_sec": duration,
                    "encounter": enc,
                    "message": f"🏆 Kemenangan! Anda berhasil menyelesaikan teka-teki {found_boss['name']} dalam {duration} detik!"
                }

        return {
            "success": True,
            "phase_transition": False,
            "encounter": enc,
            "message": f"Objektif berkembang ({enc['progress']}/{enc['target']})."
        }

    @staticmethod
    def claim_boss_rewards(player: Dict[str, Any], encounter_id: str) -> Dict[str, Any]:
        """Claim rewards for a completed encounter with strict idempotency."""
        BossEngine.ensure_boss_records(player)

        if encounter_id not in ACTIVE_ENCOUNTERS:
            return {"success": False, "error": "Data sesi encounter tidak ditemukan."}

        enc = ACTIVE_ENCOUNTERS[encounter_id]
        if not enc.get("completed", False):
            return {"success": False, "error": "Pertemuan boss belum selesai, hadiah belum dapat diklaim."}

        # Idempotency check
        if encounter_id in player.get("claimed_boss_rewards", []):
            return {"success": False, "error": "Hadiah untuk sesi encounter ini sudah pernah diklaim sebelumnya."}

        found_boss = next(b for b in BOSSES_CATALOG if b["id"] == enc["boss_id"])
        reward = found_boss["rewards"]

        # Award rewards
        player["gold"] = player.get("gold", 0) + reward["gold"]
        player["prestige_points"] = player.get("prestige_points", 0) + reward["pp"]
        player.setdefault("claimed_boss_rewards", []).append(encounter_id)

        # Update boss records
        records = player["boss_records"]
        bid = enc["boss_id"]
        if bid not in records:
            records[bid] = {"victories": 0, "best_time_sec": None, "last_victory": None}

        records[bid]["victories"] += 1
        dur = enc.get("duration_sec", 120.0)
        if records[bid]["best_time_sec"] is None or dur < records[bid]["best_time_sec"]:
            records[bid]["best_time_sec"] = dur
        records[bid]["last_victory"] = datetime.utcnow().isoformat()

        # Add title to player
        if "unlocked_titles" not in player:
            player["unlocked_titles"] = []
        if reward["title"] not in player["unlocked_titles"]:
            player["unlocked_titles"].append(reward["title"])

        # Add items to inventory if available
        inv = player.get("inventory", [])
        for item_id in reward.get("items", []):
            inv.append({"item_id": item_id, "count": 2})

        return {
            "success": True,
            "reward": reward,
            "new_gold": player["gold"],
            "new_pp": player["prestige_points"],
            "victories": records[bid]["victories"],
            "message": f"🎉 Selamat! Hadiah {found_boss['name']} berhasil diklaim: +{reward['gold']} Koin, +{reward['pp']} PP, dan Gelar '{reward['title']}'!"
        }
