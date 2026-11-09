import React from 'react';
import { sounds } from '../game/SoundFx';
import NpcPortrait from '../game/NpcPortraits';

export default function AffectionModal({
  isOpen,
  onClose,
  gameState,
  onOpenDialogue,
  onOpenQuests
}) {
  if (!isOpen || !gameState) return null;

  const npcs = gameState.npcs || [];

  const getAffectionTitle = (level) => {
    switch (level) {
      case 0: return 'Orang Asing (Stranger)';
      case 1: return 'Kenalan Baru (Acquaintance)';
      case 2: return 'Tetangga Ramah (Friendly Neighbor)';
      case 3: return 'Teman Baik (Good Friend)';
      case 4: return 'Sahabat Terpercaya (Trusted Ally)';
      case 5: return 'Jiwa Sepemikiran (Kindred Spirit)';
      case 6: return 'Orang Kepercayaan (Close Confidant)';
      case 7: return 'Rekan Sejati (Cherished Companion)';
      case 8: return 'Mitra Kasih (Beloved Partner)';
      case 9: return 'Ikatan Abadi (Devoted Soul)';
      case 10: return 'Soulmate of Aetherwyn (Legenda Abadi)';
      default: return 'Warga Desa Greenvale';
    }
  };

  const perkCatalog = {
    npc_elara: [
      { lvl: 1, perk: 'Penyembuhan Herbal +10%' },
      { lvl: 3, perk: 'Teh Stamina Hutan Gratis Setiap Pagi' },
      { lvl: 5, perk: 'Pertumbuhan Tanaman Ladang +15% Lebih Cepat' },
      { lvl: 8, perk: 'Berkah Suci: Tanpa Kehilangan Stamina Saat Hujan' },
      { lvl: 10, perk: 'Resep Rahasia: Elixir Keabadian Aetherwyn' }
    ],
    npc_rowan: [
      { lvl: 1, perk: 'Kekuatan Beliung Tambang +5%' },
      { lvl: 3, perk: 'Gratis Biaya Tempa & Perbaikan Perkakas' },
      { lvl: 5, perk: '20% Peluang Hasil Ganda Saat Melebur Logam' },
      { lvl: 8, perk: 'Penguasaan Senjata Ksatria (+50% Serangan Tebas)' },
      { lvl: 10, perk: 'Palu Tempa Masterwork: Tambang Area 3x3 Seketika' }
    ],
    npc_nessa: [
      { lvl: 1, perk: 'Jangkauan Sprinkler Otomatis +1 Petak' },
      { lvl: 3, perk: 'Daya Output Generator Kristal +15%' },
      { lvl: 5, perk: 'Diskon Biaya Material Perakitan Mesin 25%' },
      { lvl: 8, perk: 'Robot Droid Automaton Asisten Pribadi Terbuka' },
      { lvl: 10, perk: 'Reaktor Daya Aether Tanpa Batas (Energi Abadi)' }
    ],
    npc_mira: [
      { lvl: 1, perk: 'Harga Jual Semua Hasil Panen +5%' },
      { lvl: 3, perk: 'Diskon 10% Semua Barang di Toko Mira' },
      { lvl: 5, perk: 'Diskon 20% & Stok Benih Langka Tanpa Batas' },
      { lvl: 8, perk: 'Bonus Dividen Pengiriman Desa +30% Keuntungan' },
      { lvl: 10, perk: 'Mahkota Saudagar Kehormatan (+50% Semua Hadiah Emas)' }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-4xl shadow-2xl p-5 sm:p-7 relative max-h-[90vh] flex flex-col text-stone-100">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600 transition"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950 border-2 border-rose-600 flex items-center justify-center text-2xl shadow-lg">
            ❤️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-medieval text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-amber-100">
              Tingkat Kasih & Hubungan Warga (Maksimal Lv. 10)
            </h2>
            <p className="text-stone-400 text-xs">
              Jalin persahabatan, selesaikan quest penduduk, dan berikan hadiah favorit untuk membuka bonus pasif unik!
            </p>
          </div>
        </div>

        {/* RESIDENTS LIST */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 my-2">
          {npcs.map((npc) => {
            const level = npc.affection_level || Math.floor((npc.friendship_points || 0) / 100);
            const points = npc.friendship_points || 0;
            const perks = perkCatalog[npc.id] || [];

            return (
              <div
                key={npc.id}
                className="bg-stone-950/80 border-2 border-amber-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* LEFT: Portrait & Details */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <NpcPortrait npcId={npc.id} className="w-20 h-20" />
                    <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-rose-400 shadow">
                      Lv.{level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-amber-200 text-base font-medieval">
                        {npc.name}
                      </h3>
                      <span className="text-[11px] bg-stone-900 border border-stone-700 text-stone-300 px-2 py-0.5 rounded">
                        {npc.title}
                      </span>
                    </div>

                    <p className="text-rose-400 text-xs font-semibold mt-0.5">
                      {getAffectionTitle(level)}
                    </p>

                    {/* 10 Glowing Hearts Meter */}
                    <div className="flex space-x-1 my-1.5 text-xs text-rose-500">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`transition-transform ${
                            i < level ? 'scale-110 drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]' : 'opacity-30'
                          }`}
                        >
                          {i < level ? '❤️' : '🤍'}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-stone-400">
                      Hadiah Favorit:{' '}
                      <span className="text-amber-300 font-medium">
                        {(npc.favorite_gifts || []).map(g => g.replace('crop_', '').replace('mat_', '').replace('_', ' ')).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MIDDLE: Perks Unlocked */}
                <div className="flex-1 w-full lg:max-w-md bg-stone-900/90 border border-stone-800 rounded-xl p-3 text-xs">
                  <span className="text-[11px] font-bold text-amber-300 block mb-1.5">
                    ✨ Bonus Keahlian (Perks):
                  </span>
                  <div className="space-y-1">
                    {perks.map((p, idx) => {
                      const isUnlocked = level >= p.lvl;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between text-[11px] ${
                            isUnlocked ? 'text-emerald-300 font-semibold' : 'text-stone-500'
                          }`}
                        >
                          <span>{isUnlocked ? '✓' : '🔒'} Lv.{p.lvl}: {p.perk}</span>
                          <span className="font-mono text-[10px]">
                            {isUnlocked ? 'Aktif' : 'Terkunci'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex lg:flex-col gap-2 w-full lg:w-auto flex-shrink-0">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenDialogue(npc);
                    }}
                    className="flex-1 lg:flex-initial px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-1"
                  >
                    <span>💬 Bicara</span>
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenQuests();
                    }}
                    className="flex-1 lg:flex-initial px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <span>📜 Tugas</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-[11px] text-stone-500">
          <span>
            💡 Berikan hadiah favorit (+120 poin) dan selesaikan quest (+100 - +250 poin) untuk mencapai <strong className="text-rose-400">Level 10 (Soulmate)</strong>!
          </span>
          <span className="font-mono text-amber-500/80">4 Penduduk Greenvale</span>
        </div>
      </div>
    </div>
  );
}
