# 🌲 EVERGREEN CHRONICLES

> **A 2D Top-Down RPG & Farming Simulation Game**  
> *Medieval × Modern Fantasy — Build Your Legacy, From Medieval Roots to a New Age.*

---

## 📖 Overview

**Evergreen Chronicles** adalah game RPG simulasi pertanian 2D top-down yang memadukan kehangatan pedesaan dengan perkembangan peradaban dari era pertengahan menuju era fantasi modern berteknologi tinggi. 

Game ini terinspirasi dari gabungan mahakarya:
- **Stardew Valley** — Pertanian petak demi petak, penanaman benih, siklus cuaca & musim, hubungan penduduk desa, dan kotak pengiriman malam hari.
- **Fantasy Life** — Spesialisasi profesi (Petani, Penambang, Pendekar, Insinyur Mesin) dan kerajinan tangan.
- **Rune Factory** — Eksplorasi gua bawah tanah (*The Forgotten Mines*), pertarungan pedang melawan monster slime & kelelawar kristal, serta penambangan bijih mistis.
- **Medieval Dynasty** — Pembangunan desa dan peningkatan taraf hidup dari pondok kayu sederhana menjadi pemukiman makmur.
- **Modern Fantasy** — Penemuan Kristal Aether kuno yang membangkitkan revolusi industri: jaringan irigasi getaran kristal (*sprinkler* otomatis), energi uap, listrik modern, hingga automaton pemanen otonom!

---

## 🌟 5 Era Evolusi Peradaban

Dunia Aetherwyn tidak berhenti di zaman kuno. Pilihan riset dan pencapaian pemain mengubah tampilan desa dan peralatan:

1. **Era 1 — Medieval Roots (Desa Awal)**  
   *Peralatan besi tempa manual, parit tanah, lentera minyak, dan pertanian subsisten.*
2. **Era 2 — Growing Settlement (Desa Berkembang)**  
   *Penempaan tembaga, peleburan logam, dan instalasi Crystal Sprinkler Mk.I untuk menyiram 4 petak otomatis.*
3. **Era 3 — Industrial Fantasy (Uap & Lori Tambang)**  
   *Mesin uap perdana, rel lori dorong tambang, dan Smart Sprinkler Mk.II dengan radius 8 petak.*
4. **Era 4 — Modern Fantasy (Listrik & Mesin Cerdas)**  
   *Jaringan listrik bertenaga Kristal Aether, lampu jalan LED modern, dan alat kristal berkekuatan tinggi.*
5. **Era 5 — Aether Civilization (Peradaban Magis Penuh)**  
   *Automaton pemanen mandiri, teleporter desa, dan kemakmuran tanpa batas.*

---

## 🎮 Kontrol Permainan

| Tombol Keyboard | Aksi |
| :--- | :--- |
| **W, A, S, D** / Tombol Panah | Bergerak ke atas, kiri, bawah, dan kanan (4 arah halus) |
| **Spasi / Klik Kiri Mouse** | Menggunakan alat yang dipegang (Cangkul tanah, Siram air, Tebas pedang, Tanam benih, Panen sayur, Tebang kayu, Pecah batu) |
| **1 — 9, 0** | Memilih slot akses cepat (*Quickbar Hotbar*) |
| **E** | Membuka / menutup Tas Ransel 24 Slot (*Backpack*) |
| **C** | Membuka Meja Kerajinan (*Crafting Workbench*) |
| **T** | Membuka Pohon Riset Teknologi & Era Evolusi (*Tech Tree*) |
| **M** | Membuka Ekspedisi Gua Tambang & Tempur (*Forgotten Mines Dungeon*) |
| **Z** | Tidur di Kasur Rumah Petani (*Sleep & Advance Day*) |
| **H / ?** | Menampilkan Buku Panduan Kontrol Lengkap |

---

## 🛠️ Arsitektur & Teknologi

- **Game Engine Canvas**: HTML5 Canvas 60 FPS dengan rendering loop decoupled, partikel floating text, deteksi tabrakan presisi, dan pencahayaan dinamis (Siang, Senja Jingga, Malam Gelap dengan Fireflies).
- **Audio Sintesis Prosedural**: Web Audio API native tanpa aset MP3 eksternal — nol latensi untuk efek cangkul, cipratan air, panen, tebasan pedang, koin, dan fanfare level up.
- **Frontend**: React 18, Tailwind CSS, Vite.
- **Backend API & Game State Engine**: FastAPI (Python 3.13), Pydantic v2, penyimpanan state multi-slot, simulasi pertumbuhan tanaman, dan kalkulasi ledger pengiriman barang.
- **Pengujian Otomatis**: Pytest suite terintegrasi (100% lulus untuk health, item catalog, crafting, save/load, siklus tidur, pohon riset, dan rewards dungeon).

---

## 🚀 Cara Menjalankan

### Cara 1: 1-Klik Launcher (Windows)
Cukup klik ganda file:
```cmd
Buka_EvergreenChronicles.bat
```
Browser Anda akan terbuka secara otomatis di `http://127.0.0.1:8082`.

### Cara 2: Manual (Terminal)
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Jalankan server game
python run.py
```

### Menjalankan Automated Tests
```bash
cd backend
python -m pytest tests/test_game_api.py -v
```

---

## 📜 Lisensi
Dikembangkan dengan penuh dedikasi sebagai proyek open-source RPG simulasi. Bebas digunakan dan dikembangkan lebih lanjut.
