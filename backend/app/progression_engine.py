# -*- coding: utf-8 -*-
"""
Evergreen Chronicles - Advanced Player Progression & Mastery Engine (V6)
24+ Core Skills, Deep Specialization Trees, Skill Synergies, and Permanent Prestige Points.
"""

from typing import Dict, List, Any, Optional
import math

SKILLS_CATALOG = [
    # 1. Agriculture
    {"id": "farming", "category": "Agriculture", "name": "Bercocok Tanam", "icon": "🌱", "desc": "Keahlian mengolah lahan sawah, bibit unggul, dan panen sayuran."},
    {"id": "gardening", "category": "Agriculture", "name": "Hortikultura & Taman", "icon": "🌷", "desc": "Keahlian merawat bunga hias, tanaman merambat, dan lanskap asri."},
    {"id": "orchard", "category": "Agriculture", "name": "Perkebunan Buah", "icon": "🍎", "desc": "Keahlian membudidayakan pohon buah ranum dan nektar bunga buah."},
    {"id": "soil_science", "category": "Agriculture", "name": "Ilmu Kesuburan Tanah", "icon": "🧪", "desc": "Keahlian menganalisis pH tanah, mikroba kompos, dan pupuk organik murni."},

    # 2. Livestock
    {"id": "animal_care", "category": "Livestock", "name": "Perawatan Satwa", "icon": "🐾", "desc": "Keahlian merawat hewan ternak, bonding satwa peliharaan, dan pelana."},
    {"id": "ranching", "category": "Livestock", "name": "Manajemen Peternakan", "icon": "🐑", "desc": "Keahlian mengelola kapasitas lumbung jerami dan padang rumput hijau."},
    {"id": "animal_mastery", "category": "Livestock", "name": "Keahlian Satwa Liar", "icon": "🐺", "desc": "Keahlian menjinakkan hewan hutan dan melatih tunggangan legendaris."},

    # 3. Industry
    {"id": "crafting", "category": "Industry", "name": "Kerajinan Tangan", "icon": "🪚", "desc": "Keahlian merakit perabot, pagar kayu, dan perkakas rumah tangga."},
    {"id": "smithing", "category": "Industry", "name": "Pandai Besi & Tempa", "icon": "⚒️", "desc": "Keahlian melebur logam mulia, menempa beliung, dan zirah baja."},
    {"id": "engineering", "category": "Industry", "name": "Rekayasa Mekanika", "icon": "⚙️", "desc": "Keahlian merancang roda gigi, piston uap, dan sirkuit irigasi presisi."},
    {"id": "automation", "category": "Industry", "name": "Otomasi Konveyor", "icon": "🏭", "desc": "Keahlian merakit ban berjalan, penyortir cerdas, dan hopper panen."},

    # 4. Nature
    {"id": "foraging", "category": "Nature", "name": "Penjelajahan Hutan", "icon": "🍄", "desc": "Keahlian mengumpulkan tanaman liar, jamur, dan getah rimba purba."},
    {"id": "herbalism", "category": "Nature", "name": "Botani & Herbalis", "icon": "🌿", "desc": "Keahlian meracik ramuan obat tradisional, teh vitalitas, dan tonik herbal."},
    {"id": "beekeeping", "category": "Nature", "name": "Budidaya Lebah Madu", "icon": "🐝", "desc": "Keahlian memelihara koloni lebah madu, propolis, dan sarang madu murni."},
    {"id": "forestry", "category": "Nature", "name": "Silvikultur & Rimba", "icon": "🌲", "desc": "Keahlian menebang pohon bijak, konservasi hutan, dan kayu besi keras."},

    # 5. Adventure
    {"id": "exploration", "category": "Adventure", "name": "Eksplorasi Dimensi", "icon": "🗺️", "desc": "Keahlian menembus portal dimensi berwaktu dan memetakan kepulauan awan."},
    {"id": "mining", "category": "Adventure", "name": "Pertambangan Goa", "icon": "⛏️", "desc": "Keahlian menggali batuan, menambang urat bijih, dan memecah permata."},
    {"id": "archaeology", "category": "Adventure", "name": "Arkeologi Kuno", "icon": "🏺", "desc": "Keahlian menggali fosil purba, tablet aksara kuno, dan relik bersejarah."},
    {"id": "navigation", "category": "Adventure", "name": "Navigasi Bintang", "icon": "🧭", "desc": "Keahlian membaca rasi bintang malam dan menentukan titik koordinat harta."},

    # 6. Ocean
    {"id": "fishing", "category": "Ocean", "name": "Perikanan Air Tawar", "icon": "🎣", "desc": "Keahlian memancing ikan danau, sungai deras, dan kail presisi."},
    {"id": "deep_sea_fishing", "category": "Ocean", "name": "Mancing Laut Dalam", "icon": "🌊", "desc": "Keahlian memancing monster palung abyssal dan biota bioluminescent."},
    {"id": "sailing", "category": "Ocean", "name": "Pelayaran Kapal", "icon": "⛵", "desc": "Keahlian mengemudikan perahu layar, navigasi badai, dan palka kapal."},
    {"id": "diving", "category": "Ocean", "name": "Penyelaman Palung", "icon": "🤿", "desc": "Keahlian menyelam ke Sunken Kingdom dan memanen mutiara tiram laut."},

    # 7. Social
    {"id": "friendship", "category": "Social", "name": "Persahabatan Warga", "icon": "💖", "desc": "Keahlian memahami perasaan NPC, etika memberi hadiah, dan gosip desa."},
    {"id": "trading", "category": "Social", "name": "Perniagaan Pasar", "icon": "⚖️", "desc": "Keahlian bernegosiasi kontrak ekspor, arbitrase harga, dan margin laba."},
    {"id": "leadership", "category": "Social", "name": "Kepemimpinan Kota", "icon": "👑", "desc": "Keahlian merumuskan kebijakan peradaban dan mengorganisir gotong royong."},
    {"id": "cooking", "category": "Social", "name": "Seni Kuliner Dapur", "icon": "🍳", "desc": "Keahlian mengolah bahan panen menjadi hidangan bintang lima bervitamin."},

    # 8. Technology
    {"id": "robotics", "category": "Technology", "name": "Robotika Automaton", "icon": "🤖", "desc": "Keahlian merakit robot pemanen, baterai kristal, dan logika penjadwalan."},
    {"id": "ai_systems", "category": "Technology", "name": "Sistem Kecerdasan Buatan", "icon": "🧠", "desc": "Keahlian algoritma analitik pertanian dan prediksi cuaca otomatis."},
    {"id": "research", "category": "Technology", "name": "Riset Laboratorium", "icon": "🔬", "desc": "Keahlian membuka cetak biru era baru dan sintesis molekul Aether."},
    {"id": "energy", "category": "Technology", "name": "Teknologi Energi", "icon": "⚡", "desc": "Keahlian mengalirkan listrik kristal, turbin uap, dan jaringan solar cell."},

    # 9. Creativity
    {"id": "building", "category": "Creativity", "name": "Konstruksi Gedung", "icon": "🏛️", "desc": "Keahlian mendirikan struktur arsitektur megah dan rumah panggung."},
    {"id": "interior_design", "category": "Creativity", "name": "Tata Ruang Interior", "icon": "🛋️", "desc": "Keahlian mendekorasi perabot kamar, pencahayaan, dan karpet beludru."},
    {"id": "landscaping", "category": "Creativity", "name": "Penataan Lanskap", "icon": "🖌️", "desc": "Keahlian membentuk terasering bukit, kolam air mancur, dan jalan setapak."},
    {"id": "photography", "category": "Creativity", "name": "Fotografi Alam", "icon": "📷", "desc": "Keahlian mengabadikan fenomena aurora, flora langka, dan satwa liar."}
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

# Skill Synergies Matrix
SKILL_SYNERGIES = [
    {
        "id": "syn_farm_cook",
        "skills": ["farming", "cooking"],
        "name": "Keahlian Bahan Baku Premium (Premium Ingredient Mastery)",
        "desc": "Hasil masakan berbahan panen sendiri bernilai jual +35% lebih tinggi.",
        "bonus_type": "cooking_sell_boost",
        "bonus_value": 0.35
    },
    {
        "id": "syn_mine_eng",
        "skills": ["mining", "engineering"],
        "name": "Manufaktur Mesin Modern (Advanced Machine Manufacturing)",
        "desc": "Merakit mesin industri, smelter, dan robot menghemat 25% batangan logam.",
        "bonus_type": "crafting_material_reduction",
        "bonus_value": 0.25
    },
    {
        "id": "syn_fish_cook",
        "skills": ["fishing", "cooking"],
        "name": "Kuliner Boga Bahari (Seafood Gourmet)",
        "desc": "Hidangan sup dan panggangan ikan memulihkan +50% stamina lebih besar.",
        "bonus_type": "fish_stamina_restore",
        "bonus_value": 0.50
    },
    {
        "id": "syn_anim_trade",
        "skills": ["animal_care", "trading"],
        "name": "Niaga Peternakan Makmur (Livestock Commerce)",
        "desc": "Harga jual wol alpaca, keju, dan telur emas di pasar naik sebesar +25%.",
        "bonus_type": "animal_products_sell_boost",
        "bonus_value": 0.25
    },
    {
        "id": "syn_robo_farm",
        "skills": ["robotics", "farming"],
        "name": "Pertanian Otomatis Cerdas (Autonomous Agriculture)",
        "desc": "Kecepatan kerja robot pemanen dan automaton penyiram meningkat +50%.",
        "bonus_type": "robot_farming_speed",
        "bonus_value": 0.50
    },
    {
        "id": "syn_sail_fish",
        "skills": ["sailing", "deep_sea_fishing"],
        "name": "Ekspedisi Samudra Dalam (Deep Sea Expedition)",
        "desc": "Membuka navigasi ke palung karang rahasia dengan ikan kualitas Iridium.",
        "bonus_type": "deep_sea_catch_rate",
        "bonus_value": 0.40
    }
]

# Permanent Prestige Upgrade Branches (6 Branches)
PRESTIGE_BRANCHES = [
    {
        "id": "branch_prosperity",
        "name": "Kemakmuran Peradaban (Prosperity)",
        "icon": "🪙",
        "upgrades": [
            {"id": "pp_rep_1", "name": "Reputasi Saudagar I", "desc": "+10% harga jual semua komoditas ekspor kota.", "cost": 3},
            {"id": "pp_rep_2", "name": "Reputasi Saudagar II", "desc": "+20% harga jual semua komoditas ekspor kota.", "cost": 5},
            {"id": "pp_contracts", "name": "Kontrak Dagang Elit", "desc": "Membuka kontrak pesanan regional bernilai tinggi.", "cost": 8},
            {"id": "pp_storage", "name": "Ekspansi Gudang Niaga", "desc": "+50 slot penyimpanan global di gudang sentral.", "cost": 10},
            {"id": "pp_license", "name": "Lisensi Usaha Kerajaan", "desc": "Pajak pasar berkurang 50% dan dividen usaha harian +25%.", "cost": 15}
        ]
    },
    {
        "id": "branch_nature",
        "name": "Harmoni Rimba & Tanah (Nature)",
        "icon": "🌸",
        "upgrades": [
            {"id": "pp_crop_sight", "name": "Pengetahuan Agronomi Purba", "desc": "Peluang panen raksasa (Giant Crops) naik 25%.", "cost": 3},
            {"id": "pp_rare_forage", "name": "Indera Flora Mistis", "desc": "Menemukan jamur truffle dan lumina rose di alam liar.", "cost": 5},
            {"id": "pp_orchard_mastery", "name": "Penguasaan Perkebunan Abadi", "desc": "Pohon buah tidak pernah rontok saat pergantian musim.", "cost": 8},
            {"id": "pp_greenhouse_aura", "name": "Aura Rumah Kaca Aether", "desc": "Semua tanaman tumbuh +20% lebih cepat sepanjang tahun.", "cost": 12},
            {"id": "pp_eternal_fertility", "name": "Kesuburan Tanah Abadi", "desc": "Lahan tidak membutuhkan penyiraman ulang selama 3 hari.", "cost": 15}
        ]
    },
    {
        "id": "branch_industry",
        "name": "Revolusi Manufaktur (Industry)",
        "icon": "⚙️",
        "upgrades": [
            {"id": "pp_blueprint_access", "name": "Akses Cetak Biru Rahasia", "desc": "Membuka formula mesin uap dan konveyor kecepatan tinggi.", "cost": 4},
            {"id": "pp_diagnostics", "name": "Diagnostik Mesin Presisi", "desc": "Mesin pelebur dan pengasah tidak pernah macet.", "cost": 6},
            {"id": "pp_factory_speed", "name": "Lini Produksi Dobel", "desc": "Antrean pabrik memproses 2 pesanan sekaligus.", "cost": 10},
            {"id": "pp_titan_smelt", "name": "Peleburan Suhu Bintang", "desc": "100% peluang mendapatkan batangan logam murni kembar.", "cost": 15}
        ]
    },
    {
        "id": "branch_discovery",
        "name": "Penjelajah Semesta (Discovery)",
        "icon": "🧭",
        "upgrades": [
            {"id": "pp_hidden_paths", "name": "Petunjuk Jalan Tersembunyi", "desc": "Minimap menampilkan gua rahasia dan peti purba.", "cost": 3},
            {"id": "pp_artifact_eval", "name": "Identifikasi Artefak Cepat", "desc": "Artefak museum langsung terdata bernilai tinggi.", "cost": 6},
            {"id": "pp_portal_mastery", "name": "Stabilisasi Portal Dimensi", "desc": "Durasi portal terbuka bertambah +30 menit lebih lama.", "cost": 10},
            {"id": "pp_celestial_sight", "name": "Penglihatan Alam Semesta", "desc": "Membuka koordinat Starfall Sanctuary di peta dunia.", "cost": 15}
        ]
    },
    {
        "id": "branch_fellowship",
        "name": "Kekerabatan Warga (Fellowship)",
        "icon": "🤝",
        "upgrades": [
            {"id": "pp_gift_insight", "name": "Wawasan Hadiah Penduduk", "desc": "Mengetahui hadiah favorit seluruh NPC tanpa coba-coba.", "cost": 3},
            {"id": "pp_community_aid", "name": "Solidaritas Komunitas", "desc": "Warga sukarela membantu menyiram 8 petak lahan kebun.", "cost": 7},
            {"id": "pp_guild_renown", "name": "Ketenaran Guild Agung", "desc": "Tingkat reputasi seluruh guild bertambah 2x lipat.", "cost": 10},
            {"id": "pp_village_leader", "name": "Kepemimpinan Legendaris", "desc": "Tingkat kebahagiaan seluruh warga kota selalu 100%.", "cost": 15}
        ]
    },
    {
        "id": "branch_innovation",
        "name": "Teknologi & Robotika (Innovation)",
        "icon": "🤖",
        "upgrades": [
            {"id": "pp_ai_analytics", "name": "Analitik Pertanian AI", "desc": "Dashboard memprediksi cuaca dan harga komoditas 7 hari ke depan.", "cost": 5},
            {"id": "pp_battery_quantum", "name": "Baterai Kuantum Kristal", "desc": "Daya tahan baterai robot pemanen naik sebesar +100%.", "cost": 8},
            {"id": "pp_energy_grid", "name": "Jaringan Listrik Nirkabel", "desc": "Seluruh fasilitas otomatisasi menyala tanpa bahan bakar.", "cost": 12},
            {"id": "pp_celestial_tech", "name": "Teknologi Angkasa Purba", "desc": "Mengaktifkan automaton penjaga titan di desa.", "cost": 18}
        ]
    }
]

# Deep 5-Branch Trees for Core Skills
SKILL_TREES_V6: Dict[str, List[Dict[str, Any]]] = {
    "farming": [
        {
            "branch_id": "crop_specialist",
            "branch_name": "Spesialis Tanaman (Crop Specialist)",
            "icon": "🌾",
            "perks": [
                {"id": "farm_swift_sprout", "name": "Tunas Gesit", "desc": "Pertumbuhan tanaman +15% lebih cepat.", "cost": 1, "level_req": 5},
                {"id": "farm_emerald_quality", "name": "Kualitas Zamrud", "desc": "Peluang panen kualitas Emas naik 25%.", "cost": 1, "level_req": 15},
                {"id": "farm_rare_seeder", "name": "Penemu Bibit Langka", "desc": "Peluang menemukan bibit kuno saat panen.", "cost": 2, "level_req": 25},
                {"id": "farm_seasonal_mastery", "name": "Master Tanaman Musiman", "desc": "Tanaman musim saat ini panen 2 hari lebih cepat.", "cost": 2, "level_req": 35},
                {"id": "farm_giant_crop", "name": "Peluang Panen Raksasa", "desc": "Peluang tanaman berukuran raksasa 3x3 petak.", "cost": 3, "level_req": 50},
                {"id": "farm_legendary_cultivation", "name": "Kultivasi Tanaman Legendaris", "desc": "Membuka kultivasi Crystal Apple dan Golden Pumpkin.", "cost": 4, "level_req": 70}
            ]
        },
        {
            "branch_id": "soil_scientist",
            "branch_name": "Ahli Kesuburan Tanah (Soil Scientist)",
            "icon": "🧪",
            "perks": [
                {"id": "farm_soil_analysis", "name": "Analisis Kesuburan", "desc": "Melihat nutrisi petak tanah secara langsung.", "cost": 1, "level_req": 5},
                {"id": "farm_moisture_lock", "name": "Kunci Kelembapan", "desc": "Tanah yang disiram tetap basah 2 hari.", "cost": 1, "level_req": 15},
                {"id": "farm_fertilizer_eff", "name": "Efisiensi Pupuk Kimiawi", "desc": "Daya guna pupuk organik bertahan 2x lebih lama.", "cost": 2, "level_req": 25},
                {"id": "farm_soil_restoration", "name": "Restorasi Nutrisi Tanah", "desc": "Petak tanah tandus pulih menjadi tanah gembur hitam.", "cost": 3, "level_req": 45},
                {"id": "farm_magical_soil", "name": "Tanah Bercahaya Aether", "desc": "Tanah memancarkan nutrisi pasif tanpa pupuk.", "cost": 4, "level_req": 65}
            ]
        },
        {
            "branch_id": "orchard_expert",
            "branch_name": "Pakar Perkebunan Buah (Orchard Expert)",
            "icon": "🍎",
            "perks": [
                {"id": "farm_pollination", "name": "Penyerbukan Sempurna", "desc": "Pohon berbuah 30% lebih cepat berkat lebah madu.", "cost": 1, "level_req": 10},
                {"id": "farm_tree_health", "name": "Ketahanan Pohon Purba", "desc": "Pohon buah kebal terhadap badai petir dan angin kencang.", "cost": 2, "level_req": 25},
                {"id": "farm_rare_fruit", "name": "Penemu Buah Langka", "desc": "Menemukan buah beri es dan apel emas bernilai tinggi.", "cost": 3, "level_req": 45},
                {"id": "farm_ancient_orchard", "name": "Kebun Buah Kerajaan", "desc": "Setiap pohon menghasilkan panen buah ganda tiap minggu.", "cost": 4, "level_req": 65}
            ]
        },
        {
            "branch_id": "greenhouse_expert",
            "branch_name": "Penguasa Rumah Kaca (Greenhouse Expert)",
            "icon": "🏡",
            "perks": [
                {"id": "farm_hydro_sprinkler", "name": "Irigasi Presisi", "desc": "Sprinkler menghemat 50% jangkauan pipa air.", "cost": 1, "level_req": 15},
                {"id": "farm_micro_irrigation", "name": "Kabut Embun Otomatis", "desc": "Tanaman dalam greenhouse mendapat bonus kesuburan +30%.", "cost": 2, "level_req": 30},
                {"id": "farm_year_round", "name": "Tumbuh Sepanjang Tahun", "desc": "Tanaman musim apa pun tumbuh di semua petak.", "cost": 3, "level_req": 50},
                {"id": "farm_celestial_greenhouse", "name": "Rumah Kaca Bintang Surgawi", "desc": "Kapasitas greenhouse bertambah 2x lipat.", "cost": 4, "level_req": 70}
            ]
        },
        {
            "branch_id": "agri_industrialist",
            "branch_name": "Industrialis Pertanian (Agri Industrialist)",
            "icon": "🏭",
            "perks": [
                {"id": "farm_wide_tilling", "name": "Cangkul Bajak Lebar", "desc": "Mencangkul tanah membajak area 3x1 petak sekaligus.", "cost": 1, "level_req": 10},
                {"id": "farm_robot_sync", "name": "Sinkronisasi Automaton", "desc": "Robot pemanen bekerja harmonis dengan traktor bajak.", "cost": 2, "level_req": 30},
                {"id": "farm_storage_opt", "name": "Optimasi Palka Hasil Tani", "desc": "Palka panen menampung 500 hasil panen tanpa penuh.", "cost": 3, "level_req": 50},
                {"id": "farm_autonomous_agri", "name": "Pertanian Otonom Penuh", "desc": "Lahan dapat dipanen dan disiram otomatis 100%.", "cost": 5, "level_req": 75}
            ]
        }
    ],
    "mining": [
        {
            "branch_id": "ore_detection",
            "branch_name": "Deteksi Urat Bijih (Ore Detection)",
            "icon": "🧭",
            "perks": [
                {"id": "mine_solid_strike", "name": "Hantaman Padat", "desc": "Menghemat stamina menambang sebesar 20%.", "cost": 1, "level_req": 5},
                {"id": "mine_double_ore", "name": "Bijih Ganda", "desc": "25% peluang memperoleh 2 bijih tembaga/besi dari satu batu.", "cost": 1, "level_req": 15},
                {"id": "mine_deep_seam", "name": "Lapisan Purba", "desc": "Peluang menemukan Mythril dan Star Crystal meningkat 40%.", "cost": 2, "level_req": 35},
                {"id": "mine_bedrock_cleaver", "name": "Pembelah Batuan Dasar", "desc": "Bisa menghancurkan obsidian hitam dalam sekali tebas.", "cost": 3, "level_req": 60}
            ]
        },
        {
            "branch_id": "gemology",
            "branch_name": "Gemologi & Kristal (Gemology)",
            "icon": "💎",
            "perks": [
                {"id": "mine_gem_scent", "name": "Insting Permata", "desc": "Mendeteksi urat permata tersembunyi di dinding gua.", "cost": 1, "level_req": 10},
                {"id": "mine_geode_cracker", "name": "Pemecah Geode", "desc": "Membuka geode gratis tanpa bantuan pandai besi.", "cost": 2, "level_req": 25},
                {"id": "mine_rare_isotope", "name": "Isotop Murni", "desc": "Nilai jual batu mulia dan mineral olahan bertambah 35%.", "cost": 3, "level_req": 45},
                {"id": "mine_diamond_heart", "name": "Jantung Berlian", "desc": "Menambang memberi regenerasi HP instan saat di bawah tanah.", "cost": 4, "level_req": 65}
            ]
        },
        {
            "branch_id": "industrial_refining",
            "branch_name": "Pemurnian Industri (Industrial Refining)",
            "icon": "🔥",
            "perks": [
                {"id": "mine_torch_mastery", "name": "Obor Tahan Angin", "desc": "Radius lentera tambang bertambah 50%.", "cost": 1, "level_req": 10},
                {"id": "mine_smelter_speed", "name": "Tungku Panas Kilat", "desc": "Waktu peleburan ingot berkurang 50%.", "cost": 2, "level_req": 30},
                {"id": "mine_core_extractor", "name": "Ekstraktor Inti Purba", "desc": "Mampu mengekstrak Ancient Core dari puing-puing reruntuhan.", "cost": 3, "level_req": 50},
                {"id": "mine_titan_bar", "name": "Batangan Titan Surgawi", "desc": "Membuka formula batangan Celestial Ingot untuk zirah dewa.", "cost": 5, "level_req": 75}
            ]
        }
    ],
    "robotics": [
        {
            "branch_id": "robot_construction",
            "branch_name": "Konstruksi Automaton (Robot Construction)",
            "icon": "🤖",
            "perks": [
                {"id": "robo_basic_frame", "name": "Rangka Baja Ringan", "desc": "Kecepatan gerak robot naik +25%.", "cost": 1, "level_req": 10},
                {"id": "robo_battery_upgrade", "name": "Baterai Kapasitor Aether", "desc": "Daya tahan baterai robot bertambah 50%.", "cost": 2, "level_req": 25},
                {"id": "robo_multi_task", "name": "Penjadwalan Multitask", "desc": "Robot dapat menyiram dan memanen secara bergantian.", "cost": 3, "level_req": 45},
                {"id": "robo_autonomous_network", "name": "Jaringan Kawanan Swarm", "desc": "Koordinasi 5 robot bekerja di lahan secara bersamaan.", "cost": 5, "level_req": 70}
            ]
        }
    ]
}

SKILL_TREES_DATA = SKILL_TREES_V6

def calculate_level_from_xp(xp: int) -> int:
    """Calculate skill level (1-100) based on accumulated XP."""
    if xp <= 0:
        return 1
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
    """Manages 24+ core skills, deep trees, synergies, and permanent prestige upgrades."""

    @staticmethod
    def ensure_progression_state(player: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure all 24+ skills, prestige points, and synergy structures exist in player state."""
        if "skills" not in player:
            player["skills"] = {}
        
        skills = player["skills"]
        for cat in SKILLS_CATALOG:
            s_id = cat["id"]
            if s_id not in skills:
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
                    "category": cat["category"],
                    "name": cat["name"],
                    "icon": cat["icon"],
                    "level": legacy_lvl,
                    "xp": initial_xp,
                    "next_level_xp": calculate_xp_for_level(legacy_lvl + 1),
                    "milestone": get_milestone_info(legacy_lvl)["title"],
                    "perk_points": legacy_lvl - 1,
                    "unlocked_perks": [],
                    "specialization": None,
                    "prestige_level": 0,
                    "prestige_title": None
                }
            else:
                sk = skills[s_id]
                lvl = calculate_level_from_xp(sk.get("xp", 0))
                sk["level"] = lvl
                sk["next_level_xp"] = calculate_xp_for_level(lvl + 1)
                sk["milestone"] = get_milestone_info(lvl)["title"]
                if "category" not in sk:
                    sk["category"] = cat["category"]
                if "perk_points" not in sk:
                    sk["perk_points"] = max(0, lvl - 1 - len(sk.get("unlocked_perks", [])))
                if "unlocked_perks" not in sk:
                    sk["unlocked_perks"] = []
                if "prestige_level" not in sk:
                    sk["prestige_level"] = 0

        # Initialize V6 Prestige Points system
        if "prestige_points" not in player:
            player["prestige_points"] = 10
        if "spent_prestige_points" not in player:
            player["spent_prestige_points"] = 0
        if "prestige_rank" not in player:
            player["prestige_rank"] = 1
        if "prestige_upgrades" not in player:
            player["prestige_upgrades"] = ["pp_rep_1", "pp_crop_sight"]
        if "active_synergies" not in player:
            player["active_synergies"] = ["syn_farm_cook"]

        # Calculate Global Player Level
        total_lvls = sum(sk["level"] for sk in skills.values())
        player["global_level"] = max(1, total_lvls // max(1, len(SKILLS_CATALOG)))
        player["total_skill_levels"] = total_lvls
        
        return player

    @staticmethod
    def add_skill_xp(player: Dict[str, Any], skill_id: str, amount: int) -> Dict[str, Any]:
        """Award XP to a skill, trigger level-up milestones and check prestige eligibility."""
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
            
            # Award +5 PP on reaching Level 50 / Level 100
            if old_level < 50 <= new_level or old_level < 100 <= new_level:
                player["prestige_points"] = player.get("prestige_points", 0) + 5

        sk["next_level_xp"] = calculate_xp_for_level(new_level + 1)
        
        total_lvls = sum(s["level"] for s in player["skills"].values())
        player["global_level"] = max(1, total_lvls // max(1, len(SKILLS_CATALOG)))
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
            "global_level": player["global_level"],
            "prestige_points": player["prestige_points"]
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

        branches = SKILL_TREES_V6.get(skill_id, [])
        found_perk = None
        for b in branches:
            for p in b.get("perks", []):
                if p["id"] == perk_id:
                    found_perk = p
                    break
            if found_perk:
                break

        if not found_perk:
            found_perk = {"id": perk_id, "name": perk_id.replace("_", " ").title(), "cost": 1, "level_req": 5}

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
    def purchase_prestige_upgrade(player: Dict[str, Any], branch_or_upgrade_id: str, upgrade_id: Optional[str] = None) -> Dict[str, Any]:
        """Spend Prestige Points on permanent progression branches."""
        ProgressionEngine.ensure_progression_state(player)
        target_upg_id = upgrade_id if upgrade_id else branch_or_upgrade_id
        
        # Locate upgrade in 6 branches
        found_upg = None
        branch_name = ""
        for b in PRESTIGE_BRANCHES:
            for u in b["upgrades"]:
                if u["id"] == target_upg_id:
                    found_upg = u
                    branch_name = b["name"]
                    break
            if found_upg:
                break

        if not found_upg:
            return {"success": False, "error": f"Upgrade Prestige '{target_upg_id}' tidak ditemukan."}

        if target_upg_id in player.get("prestige_upgrades", []):
            return {"success": False, "error": f"Upgrade '{found_upg['name']}' sudah aktif permanen."}

        cost = found_upg["cost"]
        if player.get("prestige_points", 0) < cost:
            return {"success": False, "error": f"Prestige Points tidak cukup! Butuh {cost} PP, tersedia {player.get('prestige_points', 0)} PP."}

        player["prestige_points"] -= cost
        player["spent_prestige_points"] = player.get("spent_prestige_points", 0) + cost
        player.setdefault("prestige_upgrades", []).append(target_upg_id)

        return {
            "success": True,
            "upgrade": found_upg,
            "branch": branch_name,
            "remaining_pp": player["prestige_points"],
            "spent_pp": player["spent_prestige_points"],
            "active_upgrades": player["prestige_upgrades"],
            "message": f"Upgrade permanen '{found_upg['name']}' berhasil dibuka di cabang {branch_name}!"
        }

    @staticmethod
    def reset_prestige_points(player: Dict[str, Any]) -> Dict[str, Any]:
        """Safely refund spent Prestige Points without deleting items, farm, or skills."""
        ProgressionEngine.ensure_progression_state(player)
        spent = player.get("spent_prestige_points", 0)
        player["prestige_points"] = player.get("prestige_points", 0) + spent
        player["spent_prestige_points"] = 0
        player["prestige_upgrades"] = []

        return {
            "success": True,
            "refunded_pp": spent,
            "total_pp": player["prestige_points"],
            "message": f"Reset Prestige sukses! Sebanyak {spent} PP telah dikembalikan ke saldo Anda tanpa mengubah inventaris."
        }

    @staticmethod
    def activate_prestige(player: Dict[str, Any], skill_id: str) -> Dict[str, Any]:
        """Advance Prestige Rank for a skill reached Level 50+."""
        ProgressionEngine.ensure_progression_state(player)
        if skill_id not in player["skills"]:
            return {"success": False, "error": f"Skill '{skill_id}' tidak valid."}

        sk = player["skills"][skill_id]
        if sk["level"] < 50:
            return {"success": False, "error": f"Syarat aktivasi Prestige adalah Level 50+. Level saat ini: {sk['level']}."}

        sk["prestige_level"] = sk.get("prestige_level", 0) + 1
        title_name = f"Grandmaster {sk['name']} Presisi"
        sk["prestige_title"] = title_name

        player["prestige_points"] = player.get("prestige_points", 0) + 10
        player["prestige_rank"] = max(player.get("prestige_rank", 1), sk["prestige_level"])

        if "prestige_badges" not in player:
            player["prestige_badges"] = []
        badge = {"skill_id": skill_id, "tier": sk["prestige_level"], "title": title_name}
        player["prestige_badges"].append(badge)

        return {
            "success": True,
            "skill_id": skill_id,
            "prestige_level": sk["prestige_level"],
            "prestige_title": title_name,
            "bonus_pp": 10,
            "current_pp": player["prestige_points"],
            "message": f"Selamat! Anda berhasil mencapai Prestige Tingkat {sk['prestige_level']} untuk {sk['name']} (+10 PP diperoleh)!"
        }
