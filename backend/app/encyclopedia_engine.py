# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Grand Encyclopedia & Journal Engine (V6)
Comprehensive catalog across 38 categories, indexed pagination, search,
discovery tracking, and milestone completion rewards.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import math

ENCYCLOPEDIA_CATEGORIES = [
    {"id": "crops", "name": "Tanaman Pokok", "icon": "🌾", "desc": "Padi, gandum, jagung, dan tanaman pangan utama."},
    {"id": "vegetables", "name": "Sayuran Kebun", "icon": "🥕", "desc": "Wortel, kubis, tomat, labu, dan herba dapur."},
    {"id": "fruits", "name": "Buah-Buahan", "icon": "🍎", "desc": "Apel merah, pir kristal, jeruk manis, dan beri liar."},
    {"id": "flowers", "name": "Bunga Hias", "icon": "🌸", "desc": "Mawar aether, anggrek bulan, tulip pelangi, dan teratai."},
    {"id": "trees", "name": "Pohon & Kayu", "icon": "🌲", "desc": "Pohon Oak Purba, Pinus Salju, Sakura Kristal, dan Kayu Besi."},
    {"id": "fish", "name": "Ikan & Biota Air", "icon": "🐟", "desc": "Ikan mas danau, lele aether, salmon pelangi, dan belut listrik."},
    {"id": "minerals", "name": "Bijih & Mineral", "icon": "⛏️", "desc": "Bijih tembaga, besi, titanium, emas, dan batubara."},
    {"id": "gems", "name": "Permata & Kristal", "icon": "💎", "desc": "Batu delima, zamrud rimba, safir laut, dan kuarsa bintang."},
    {"id": "artifacts", "name": "Relik Kuno", "icon": "🏺", "desc": "Fosil purba, lempeng aksara runic kuno, dan mahkota aether."},
    {"id": "foods", "name": "Hidangan Matang", "icon": "🍲", "desc": "Sup jamur truffle, pai apel kayu manis, dan semur daging madu."},
    {"id": "recipes", "name": "Resep Kuliner", "icon": "📜", "desc": "Formula rahasia koki istana dan catatan racikan nenek moyang."},
    {"id": "drinks", "name": "Minuman & Tonik", "icon": "🍹", "desc": "Teh herbal daun lumina, sirup berry es, dan ramuan vitalitas."},
    {"id": "animals", "name": "Satwa Ternak", "icon": "🐄", "desc": "Sapi perah highland, domba wol halus, dan ayam cemani emas."},
    {"id": "pets", "name": "Hewan Peliharaan", "icon": "🐕", "desc": "Anjing gembala cerdas, kucing bulu sutra, dan rubah salju."},
    {"id": "mounts", "name": "Tunggangan", "icon": "🐎", "desc": "Kuda berangasan, rusa kutub, griffin awan, dan traktor uap."},
    {"id": "npcs", "name": "Penduduk & Warga", "icon": "👥", "desc": "Profil lengkap warga desa, rutinitas, dan hadiah favorit."},
    {"id": "buildings", "name": "Arsitektur Bangunan", "icon": "🏡", "desc": "Gudang panen lumbung, kincir angin, pabrik roti, dan menara."},
    {"id": "furniture", "name": "Perabot Rumah", "icon": "🪑", "desc": "Meja kayu oak terukir, tempat tidur beludru, dan rak buku."},
    {"id": "tools", "name": "Perkakas Bertani", "icon": "🛠️", "desc": "Cangkul mithril, penyiram otomatis, sabit baja, dan beliung."},
    {"id": "equipment", "name": "Peralatan & Zirah", "icon": "🛡️", "desc": "Sepatu penjelajah, gelang magnet panen, dan tas pelindung."},
    {"id": "robots", "name": "Automaton Pertanian", "icon": "🤖", "desc": "Robot penyiram otomatis, drone penyemai, dan harvester v4."},
    {"id": "machines", "name": "Mesin Industri", "icon": "⚙️", "desc": "Tungku pelebur tempa, mesin penggiling gandum, dan fermentor."},
    {"id": "vehicles", "name": "Kendaraan Darat", "icon": "🚜", "desc": "Traktor uap turbo, gerobak kargo, dan sepeda penjelajah."},
    {"id": "boats", "name": "Perahu & Kapal", "icon": "⛵", "desc": "Kano dayung kayu, perahu layar nelayan, dan kapal karavel."},
    {"id": "biomes", "name": "Bioma Dunia", "icon": "🌄", "desc": "Lembah Evergreen, Hutan Lumut Runic, Gurun Debu Emas, dan Puncak Es."},
    {"id": "islands", "name": "Kepulauan Melayang", "icon": "🏝️", "desc": "Pulau Starfall, Pulau Aether Awan, dan Karang Abyssal."},
    {"id": "portals", "name": "Gerbang Dimensi", "icon": "🌀", "desc": "Portal Waktu Nether, Celah Ruang Kosmik, dan Gerbang Sanctuary."},
    {"id": "quests", "name": "Catatan Misi", "icon": "🗺️", "desc": "Misi utama peradaban, kontrak pasar mingguan, dan kisah warga."},
    {"id": "events", "name": "Festival Musiman", "icon": "🎪", "desc": "Festival Panen Raya, Karnaval Musim Semi, dan Malam Halimun."},
    {"id": "achievements", "name": "Pencapaian Agung", "icon": "🏆", "desc": "Piala kemuliaan bertani, penambang titan, dan filantropis kota."},
    {"id": "skills", "name": "Daftar Kemahiran", "icon": "✨", "desc": "Indeks 24 cabang keahlian dan pohon spesialisasi karakter."},
    {"id": "blueprints", "name": "Cetak Biru", "icon": "📐", "desc": "Skema konstruksi arsitektur modern dan mesin uap canggih."},
    {"id": "research", "name": "Riset Laboratorium", "icon": "🔬", "desc": "Teknologi rekayasa genetika benih dan baterai fotovoltaik."},
    {"id": "treasures", "name": "Harta Karun", "icon": "📦", "desc": "Peti karam palung laut, rahasia ruang bawah tanah gua tua."},
    {"id": "weather", "name": "Fenomena Cuaca", "icon": "🌦️", "desc": "Hujan gerimis subur, badai petir kosmik, aurora aether, kabut pagi."},
    {"id": "music", "name": "Melodi Nusantara", "icon": "🎵", "desc": "Piringan hitam musik desa, balada penjelajah, dan gending fajar."},
    {"id": "photos", "name": "Galeri Potret", "icon": "📷", "desc": "Koleksi foto pemandangan, momen festival, dan panen raksasa."},
    {"id": "museum", "name": "Galeri Museum Kota", "icon": "🏛️", "desc": "Sayap pameran fosil, spesimen serangga, dan galeri mineral mulia."}
]

# Rich initial database for Grand Encyclopedia entries across categories
ENCYCLOPEDIA_ENTRIES: List[Dict[str, Any]] = [
    # Crops
    {"id": "crop_wheat", "category": "crops", "name": "Gandum Emas", "rarity": "common", "season": "Spring, Summer", "location": "Lahan Pertanian", "desc": "Gandum berkualitas tinggi untuk tepung roti lembut dan pakan ternak.", "hints": "Tanam bibit gandum di tanah yang telah dicangkul."},
    {"id": "crop_corn", "category": "crops", "name": "Jagung Manis", "rarity": "common", "season": "Summer, Fall", "location": "Lahan Pertanian", "desc": "Bulir jagung kuning manis berkilau di bawah sinar matahari.", "hints": "Panen setelah 8 hari disiram rutin."},
    {"id": "crop_rice", "category": "crops", "name": "Padi Aromatik", "rarity": "uncommon", "season": "Summer", "location": "Petak Sawah Berair", "desc": "Padi wangi khas lembah yang sangat disukai koki restoran desa.", "hints": "Tumbuh maksimal bila petak tanah selalu basah tergenang."},
    {"id": "crop_crystal_apple", "category": "crops", "name": "Apel Kristal Aether", "rarity": "legendary", "season": "All", "location": "Kebun Surgawi Aether", "desc": "Buah transparan yang berkilau menyerupai batu mulia. Memulihkan seluruh stamina secara instan.", "hints": "Dapat dikultivasikan dengan bibit apel legendaris dan pupuk Aether."},
    {"id": "crop_golden_pumpkin", "category": "crops", "name": "Labu Emas Raksasa", "rarity": "epic", "season": "Fall", "location": "Lahan Pertanian", "desc": "Labu langka bercahaya emas murni yang kerap memenangkan kontes festival.", "hints": "Tanam dalam formasi petak 3x3 di musim gugur."},

    # Vegetables
    {"id": "veg_carrot", "category": "vegetables", "name": "Wortel Manis", "rarity": "common", "season": "Spring", "location": "Lahan Kebun", "desc": "Sayur renyah kaya vitamin, disukai kelinci dan kuda.", "hints": "Waktu tumbuh cepat 4 hari."},
    {"id": "veg_tomato", "category": "vegetables", "name": "Tomat Merah Ranum", "rarity": "common", "season": "Summer", "location": "Lahan Kebun", "desc": "Bahan utama pasta dan sup hangat musim panas.", "hints": "Dapat dipanen berulang kali setiap 3 hari setelah matang."},
    {"id": "veg_shadow_garlic", "category": "vegetables", "name": "Bawang Bayangan Malam", "rarity": "rare", "season": "Fall", "location": "Gua Lembap / Rumah Kaca", "desc": "Bawang berwarna ungu gelap yang memancarkan aroma mistis penghalau hama.", "hints": "Ditemukan di dekat pintu masuk gua tambang."},

    # Fruits
    {"id": "fruit_apple", "category": "fruits", "name": "Apel Merah Desa", "rarity": "common", "season": "Fall", "location": "Pohon Apel Kebun", "desc": "Buah manis segar yang rontok dari dahan pohon apel tua.", "hints": "Goyangkan pohon apel yang matang."},
    {"id": "fruit_frost_berry", "category": "fruits", "name": "Beri Es Abadi", "rarity": "epic", "season": "Winter", "location": "Lereng Puncak Es", "desc": "Beri beku yang tetap dingin meski dimasukkan ke dalam air mendidih.", "hints": "Hanya tumbuh di semak beku saat badai salju."},

    # Flowers
    {"id": "flw_aether_rose", "category": "flowers", "name": "Mawar Cahaya Aether", "rarity": "epic", "season": "Spring", "location": "Taman Sanctuary", "desc": "Bunga dengan kelopak memancarkan cahaya biru neon lembut di malam hari.", "hints": "Disukai oleh seluruh NPC desa sebagai hadiah mewah."},
    {"id": "flw_wild_daisy", "category": "flowers", "name": "Aster Liar", "rarity": "common", "season": "Spring, Summer", "location": "Padang Rumput", "desc": "Bunga putih sederhana yang tumbuh di pinggir jalan setapak.", "hints": "Kumpulkan saat menjelajah alam bebas."},

    # Trees
    {"id": "tree_ancient_oak", "category": "trees", "name": "Oak Purba Evergreen", "rarity": "rare", "season": "All", "location": "Hutan Belantara", "desc": "Pohon berdaun lebat yang menyimpan getah amber bernilai tinggi.", "hints": "Gunakan kapak besi untuk menebang dahan kering."},
    {"id": "tree_crystal_sakura", "category": "trees", "name": "Sakura Kristal Awan", "rarity": "legendary", "season": "Spring", "location": "Pulau Melayang Starfall", "desc": "Pohon mistis dengan kelopak merah muda transparan yang tidak pernah layu.", "hints": "Hanya ditemukan di pulau awan melalui portal dimensi."},

    # Fish
    {"id": "fish_rainbow_trout", "category": "fish", "name": "Ikan Trout Pelangi", "rarity": "uncommon", "season": "Spring, Summer", "location": "Sungai Hulu", "desc": "Sisik ikan berkilau warna-warni saat melompat melawan arus air deras.", "hints": "Gunakan umpan cacing sutra di siang hari."},
    {"id": "fish_abyssal_angler", "category": "fish", "name": "Sungut Palung Laut Dalam", "rarity": "legendary", "season": "All", "location": "Palung Laut Sunken Kingdom", "desc": "Ikan laut purba dengan lampu umpan bioluminesensi yang menyilaukan.", "hints": "Pancing dari atas kapal palka dalam saat malam gelap gulita."},

    # Minerals & Gems
    {"id": "ore_copper", "category": "minerals", "name": "Bijih Tembaga", "rarity": "common", "season": "All", "location": "Tambang Lantai 1-20", "desc": "Logam dasar untuk membuat kabel listrik, cangkul tembaga, dan pipa.", "hints": "Hancurkan bongkahan batu tembaga cokelat di tambang."},
    {"id": "ore_mythril", "category": "minerals", "name": "Bijih Mythril Berkilau", "rarity": "epic", "season": "All", "location": "Tambang Lantai 60-100", "desc": "Logam magis berwarna perak kebiruan yang sangat ringan namun kokoh.", "hints": "Dapat ditambang hanya dengan Beliung Baja atau lebih tinggi."},
    {"id": "gem_star_ruby", "category": "gems", "name": "Batu Delima Bintang", "rarity": "legendary", "season": "All", "location": "Geoda Kristal Gua Bintang", "desc": "Permata merah darah dengan refleksi bintang segi enam di dalamnya.", "hints": "Pecahkan geoda misterius di pandai besi."},

    # Artifacts
    {"id": "art_ancient_tablet", "category": "artifacts", "name": "Prasasti Aksara Aether", "rarity": "epic", "season": "All", "location": "Reruntuhan Kuno Kuil", "desc": "Lempengan batu berisi rumus pembangunan peradaban masa lalu.", "hints": "Donasikan ke Museum Kota untuk membuka cetak biru baru."},
    {"id": "art_fossil_dragon", "category": "artifacts", "name": "Tengkorak Naga Purba", "rarity": "legendary", "season": "All", "location": "Gua Tambang Abyssal", "desc": "Fosil utuh dari makhluk agung penjaga langit ribuan tahun silam.", "hints": "Gali menggunakan kuas arkeologi presisi."},

    # Foods & Recipes
    {"id": "food_truffle_soup", "category": "foods", "name": "Sup Krim Jamur Truffle", "rarity": "rare", "season": "Fall, Winter", "location": "Dapur Rumah", "desc": "Sup hangat kental dengan taburan keju kambing dan aroma truffle mewah.", "hints": "Masak menggunakan kompor dapur dengan bahan jamur truffle dan susu murni."},
    {"id": "rcp_starfall_pastry", "category": "recipes", "name": "Resep Pastry Bintang Jatuh", "rarity": "epic", "season": "All", "location": "Buku Resep Rahasia", "desc": "Panduan membuat roti manis dengan selai apel kristal bercahaya.", "hints": "Diberikan oleh Chef Pierre setelah mencapai 8 Hati pertemanan."},

    # Animals, Pets & Mounts
    {"id": "anim_highland_cow", "category": "animals", "name": "Sapi Highland Berbulu", "rarity": "common", "season": "All", "location": "Kandang Sapi Peternakan", "desc": "Sapi tenang berbulu tebal penghasil susu krim kental premium.", "hints": "Beli di Toko Satwa Marnie dan beri makan rumput segar tiap hari."},
    {"id": "pet_snow_fox", "category": "pets", "name": "Rubah Salju Salju", "rarity": "epic", "season": "Winter", "location": "Hutan Pinus Utara", "desc": "Rubah putih lincah yang suka membawakan biji pinus langka ke depan pintu rumah.", "hints": "Jinakkan dengan memberi makan beri es selama musim dingin."},
    {"id": "mount_steampunk_tractor", "category": "mounts", "name": "Traktor Uap Turbo MK-3", "rarity": "epic", "season": "All", "location": "Garasi Bengkel Otomotif", "desc": "Kendaraan pertanian bertenaga uap air panas berkecepatan 3x lipat jalan kaki.", "hints": "Rakit di meja bengkel mekanika dengan plat besi dan motor uap."},

    # NPCs
    {"id": "npc_elder_oakley", "category": "npcs", "name": "Kakek Oakley Henderson", "rarity": "rare", "season": "All", "location": "Balai Kota & Perpustakaan", "desc": "Tetua desa berambut perak yang memegang kunci sejarah peradaban Evergreen.", "hints": "Sukai hadiah: Teh herbal panas dan prasasti kuno."},
    {"id": "npc_elena_botanist", "category": "npcs", "name": "Elena sang Ahli Botani", "rarity": "rare", "season": "All", "location": "Pusat Penelitian Bunga", "desc": "Gadis peneliti ceria yang mengoleksi sampel tanaman langka dari seluruh penjuru pulau.", "hints": "Sukai hadiah: Mawar Cahaya Aether dan pupuk organik."},

    # Robots & Machines
    {"id": "robo_harvester_v4", "category": "robots", "name": "Automaton Pemanen MK-4", "rarity": "epic", "season": "All", "location": "Lahan Kebun", "desc": "Robot mandiri yang dapat memanen 24 petak tanaman per jam dan menyimpannya di peti.", "hints": "Dibuat dengan modul robotika dan baterai kristal."},
    {"id": "mach_aether_forge", "category": "machines", "name": "Tungku Pelebur Aether", "rarity": "rare", "season": "All", "location": "Ruang Kerja Bengkel", "desc": "Tungku bertekanan tinggi yang dapat melebur 5 jenis bijih logam secara simultan.", "hints": "Buka cetak biru di pohon skill Industry."},

    # Biomes & Portals
    {"id": "biome_evergreen_valley", "category": "biomes", "name": "Lembah Evergreen", "rarity": "common", "season": "All", "location": "Dunia Utama", "desc": "Lembah subur hijau yang menjadi tempat awal peradaban petani dimulai.", "hints": "Lokasi awal tempat berdirinya pondok pertama pemain."},
    {"id": "portal_time_rift", "category": "portals", "name": "Gerbang Distorsi Waktu", "rarity": "legendary", "season": "All", "location": "Monumen Batu Purba", "desc": "Pusaran energi ungu yang memungkinkan perjalanan ke era kuno masa lampau.", "hints": "Aktifkan dengan menaruh 3 Bintang Aether pada altar penyangga."}
]

# Milestone completion reward tiers: 10%, 25%, 50%, 75%, 100%
MILESTONE_TIERS = [
    {"percent": 10, "name": "Pengamat Pemula", "gold": 500, "xp": 250, "pp": 1, "title": "Kolektor Pemula"},
    {"percent": 25, "name": "Pencari Jejak", "gold": 1500, "xp": 750, "pp": 2, "title": "Naturalis Handal"},
    {"percent": 50, "name": "Penjelajah Ulung", "gold": 4000, "xp": 2000, "pp": 3, "title": "Pakar Ensiklopedia"},
    {"percent": 75, "name": "Cendekiawan Alam", "gold": 10000, "xp": 5000, "pp": 5, "title": "Kurator Utama"},
    {"percent": 100, "name": "Master Penguasa Ensiklopedia", "gold": 25000, "xp": 12000, "pp": 10, "title": "Legenda Abadi Evergreen"}
]


class EncyclopediaEngine:
    """Handles indexed search, pagination, discovery state tracking, and milestone completion rewards."""

    @staticmethod
    def ensure_encyclopedia_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure player profile contains valid encyclopedia discovery storage and claimed rewards."""
        if "encyclopedia_discoveries" not in player:
            player["encyclopedia_discoveries"] = {}
        if "claimed_encyclopedia_milestones" not in player:
            player["claimed_encyclopedia_milestones"] = {}
        return player

    @staticmethod
    def get_categories() -> List[Dict[str, Any]]:
        """Return list of all 38 categories with their count of catalog items."""
        cats = []
        for cat in ENCYCLOPEDIA_CATEGORIES:
            total_items = sum(1 for e in ENCYCLOPEDIA_ENTRIES if e["category"] == cat["id"])
            cats.append({
                **cat,
                "total_entries": total_items
            })
        return cats

    @staticmethod
    def get_entries_page(
        player: Dict[str, Any],
        category: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 12
    ) -> Dict[str, Any]:
        """Retrieve paginated catalog items with discovery status for player."""
        EncyclopediaEngine.ensure_encyclopedia_state(player)
        discoveries = player["encyclopedia_discoveries"]

        filtered = ENCYCLOPEDIA_ENTRIES
        if category and category != "all":
            filtered = [e for e in filtered if e["category"] == category]

        if search:
            q = search.lower().strip()
            filtered = [
                e for e in filtered
                if q in e["name"].lower() or q in e["desc"].lower() or q in e["location"].lower()
            ]

        total_count = len(filtered)
        total_pages = max(1, math.ceil(total_count / max(1, limit)))
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        page_items = filtered[start_idx:end_idx]

        results = []
        for item in page_items:
            is_disc = item["id"] in discoveries
            disc_meta = discoveries.get(item["id"], {})
            results.append({
                "id": item["id"],
                "category": item["category"],
                "name": item["name"] if is_disc else "???",
                "rarity": item["rarity"] if is_disc else "common",
                "season": item["season"] if is_disc else "???",
                "location": item["location"] if is_disc else "Lokasi Tersembunyi",
                "desc": item["desc"] if is_disc else "Entri ini belum ditemukan dalam perjalanan Anda. Jelajahi dunia untuk membukanya.",
                "hints": item["hints"],
                "is_discovered": is_disc,
                "discovered_at": disc_meta.get("discovered_at"),
                "discovery_count": disc_meta.get("count", 1 if is_disc else 0)
            })

        # Calculate overall discovery stats
        total_in_db = len(ENCYCLOPEDIA_ENTRIES)
        total_discovered = len(discoveries)
        global_completion_pct = round((total_discovered / max(1, total_in_db)) * 100, 1)

        return {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages,
            "items": results,
            "stats": {
                "total_entries": total_in_db,
                "discovered_entries": total_discovered,
                "completion_percentage": min(100.0, global_completion_pct)
            }
        }

    @staticmethod
    def discover_entry(player: Dict[str, Any], entry_id: str) -> Dict[str, Any]:
        """Record discovery of an entry in player encyclopedia."""
        EncyclopediaEngine.ensure_encyclopedia_state(player)
        discoveries = player["encyclopedia_discoveries"]

        found_entry = next((e for e in ENCYCLOPEDIA_ENTRIES if e["id"] == entry_id), None)
        if not found_entry:
            # If not in static predefined list, register dynamic entry
            found_entry = {
                "id": entry_id,
                "category": "treasures",
                "name": entry_id.replace("_", " ").title(),
                "rarity": "rare",
                "desc": "Penemuan unik di dunia Evergreen.",
                "location": "Dunia Evergreen"
            }

        now_str = datetime.utcnow().isoformat()
        is_first_time = entry_id not in discoveries

        if is_first_time:
            discoveries[entry_id] = {
                "discovered_at": now_str,
                "count": 1
            }
        else:
            discoveries[entry_id]["count"] = discoveries[entry_id].get("count", 1) + 1

        return {
            "success": True,
            "is_new_discovery": is_first_time,
            "entry_id": entry_id,
            "name": found_entry["name"],
            "category": found_entry["category"],
            "message": f"Entri baru ditemukan: {found_entry['name']}!" if is_first_time else f"Entri {found_entry['name']} telah tercatat."
        }

    @staticmethod
    def claim_milestone_reward(player: Dict[str, Any], category: str, percent: int) -> Dict[str, Any]:
        """Claim milestone reward (10%, 25%, 50%, 75%, 100%) for a given category or overall."""
        EncyclopediaEngine.ensure_encyclopedia_state(player)
        claimed = player["claimed_encyclopedia_milestones"]

        claim_key = f"{category}_{percent}"
        if claim_key in claimed:
            return {"success": False, "error": f"Hadiah milestone {percent}% untuk '{category}' sudah pernah diklaim sebelumnya."}

        # Check eligibility
        if category == "overall":
            total_items = len(ENCYCLOPEDIA_ENTRIES)
            disc_count = len(player["encyclopedia_discoveries"])
        else:
            total_items = sum(1 for e in ENCYCLOPEDIA_ENTRIES if e["category"] == category)
            disc_count = sum(
                1 for eid in player["encyclopedia_discoveries"]
                if any(e["id"] == eid and e["category"] == category for e in ENCYCLOPEDIA_ENTRIES)
            )

        if total_items == 0:
            current_pct = 100.0
        else:
            current_pct = (disc_count / total_items) * 100.0

        if current_pct < percent:
            return {
                "success": False,
                "error": f"Syarat belum terpenuhi. Kemajuan saat ini: {current_pct:.1f}%, dibutuhkan: {percent}%."
            }

        tier = next((t for t in MILESTONE_TIERS if t["percent"] == percent), None)
        if not tier:
            return {"success": False, "error": f"Tier milestone {percent}% tidak valid."}

        # Grant rewards
        player["gold"] = player.get("gold", 0) + tier["gold"]
        player["prestige_points"] = player.get("prestige_points", 0) + tier["pp"]
        claimed[claim_key] = {
            "claimed_at": datetime.utcnow().isoformat(),
            "tier_name": tier["name"],
            "gold": tier["gold"],
            "pp": tier["pp"],
            "title": tier["title"]
        }

        if "unlocked_titles" not in player:
            player["unlocked_titles"] = []
        if tier["title"] not in player["unlocked_titles"]:
            player["unlocked_titles"].append(tier["title"])

        return {
            "success": True,
            "claim_key": claim_key,
            "reward": tier,
            "new_gold": player["gold"],
            "new_pp": player["prestige_points"],
            "new_title": tier["title"],
            "message": f"Selamat! Anda berhasil mengklaim hadiah Milestone {tier['name']} ({percent}%): +{tier['gold']} Koin, +{tier['pp']} PP, dan Gelar '{tier['title']}'!"
        }
