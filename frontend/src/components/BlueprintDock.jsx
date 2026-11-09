import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function BlueprintDock({
  isOpen,
  onClose,
  activeBlueprint,
  onSelectBlueprint,
  playerInventory = [],
  playerGold = 0
}) {
  const [blueprints, setBlueprints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/game/blueprints')
      .then((res) => res.json())
      .then((data) => {
        setBlueprints(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blueprints:', err);
        setLoading(false);
      });
  }, []);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua Blueprint', icon: '📐' },
    { id: 'water', label: 'Irigasi & Air', icon: '💧' },
    { id: 'automation', label: 'Otomatisasi Panen', icon: '⚙️' },
    { id: 'energy', label: 'Energi & Fasilitas', icon: '⚡' }
  ];

  const getCategoryForBlueprint = (b) => {
    if (['struct_sprinkler_basic', 'struct_sprinkler_modern', 'struct_irrigation_pipe', 'struct_hydroponic_basin'].includes(b.id)) {
      return 'water';
    }
    if (['struct_auto_harvester', 'struct_compost_bin', 'struct_seed_extractor'].includes(b.id)) {
      return 'automation';
    }
    return 'energy';
  };

  const filtered = blueprints.filter((b) => {
    if (selectedCategory === 'all') return true;
    return getCategoryForBlueprint(b) === selectedCategory;
  });

  const canAfford = (blueprint) => {
    if (playerGold < (blueprint.cost_gold || 0)) return false;
    for (const [matId, reqCount] of Object.entries(blueprint.required_materials || {})) {
      const invItem = playerInventory.find((it) => it && it.id === matId);
      const curCount = invItem ? invItem.count : 0;
      if (curCount < reqCount) return false;
    }
    return true;
  };

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-4xl bg-[#071322]/95 backdrop-blur-md border-2 border-cyan-500/70 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.35)] p-3 select-none text-cyan-100 animate-in fade-in slide-in-from-bottom duration-200">
      {/* HEADER DOCK CAD */}
      <div className="flex items-center justify-between border-b border-cyan-800/80 pb-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xl animate-pulse">📐</span>
          <div>
            <div className="font-mono font-bold text-sm text-cyan-300 tracking-wide flex items-center space-x-2">
              <span>AETHER-CAD // BLUEPRINT DRAFTING PALETTE</span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-600/60 text-cyan-300">
                SNAP 16×16 GRID
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/80">
              Pilih cetak biru, lalu klik pada ubin kebun di kanvas untuk mendirikan struktur.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-cyan-400 font-mono">DANA PROYEK</div>
            <div className="text-xs font-bold text-amber-300 font-mono">🪙 {playerGold.toLocaleString()} G</div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="bg-cyan-950/80 hover:bg-rose-950 border border-cyan-600/70 hover:border-rose-500 text-cyan-300 hover:text-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition"
            title="Tutup Mode Blueprint (B)"
          >
            ✕ KELUAR [B]
          </button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex space-x-1.5 mb-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { sounds.playClick(); setSelectedCategory(c.id); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
              selectedCategory === c.id
                ? 'bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-600/40'
                : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-800/60'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* BLUEPRINTS CAROUSEL LIST */}
      {loading ? (
        <div className="text-center py-6 text-cyan-400 font-mono text-xs animate-pulse">
          Memuat basis data cetak biru arsitektur...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
          {filtered.map((b) => {
            const isSelected = activeBlueprint && activeBlueprint.id === b.id;
            const affordable = canAfford(b);

            return (
              <div
                key={b.id}
                onClick={() => {
                  if (affordable) {
                    sounds.playClick();
                    onSelectBlueprint(isSelected ? null : b);
                  } else {
                    sounds.playClick();
                  }
                }}
                className={`relative rounded-xl p-2 cursor-pointer transition border text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-900/80 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400'
                    : affordable
                    ? 'bg-[#0a1b2e]/80 hover:bg-cyan-950/70 border-cyan-800/80 hover:border-cyan-500'
                    : 'bg-stone-950/60 border-stone-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{b.icon || '🏗️'}</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                      R: {b.area_radius ? `${b.area_radius}x${b.area_radius}` : '1x1'}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-cyan-100 truncate mb-0.5" title={b.name}>
                    {b.name}
                  </div>
                  <div className="text-[10px] text-cyan-300/70 line-clamp-2 leading-tight mb-1">
                    {b.description}
                  </div>
                </div>

                <div className="border-t border-cyan-900/60 pt-1 mt-1 font-mono text-[10px]">
                  <div className="text-amber-300 font-bold truncate">
                    🪙 {b.cost_gold} G
                  </div>
                  <div className="space-y-0.5 text-cyan-400/90 truncate">
                    {Object.entries(b.required_materials || {}).map(([mat, count]) => {
                      const matName = mat.replace('mat_', '').replace('item_', '');
                      const invItem = playerInventory.find((it) => it && it.id === mat);
                      const curCount = invItem ? invItem.count : 0;
                      const hasEnough = curCount >= count;

                      return (
                        <div
                          key={mat}
                          className={`truncate ${hasEnough ? 'text-emerald-300' : 'text-rose-400'}`}
                        >
                          {hasEnough ? '✓' : '✗'} {count}x {matName} ({curCount})
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-1 right-1 bg-cyan-400 text-slate-950 text-[9px] font-black px-1 rounded animate-pulse">
                    AKTIF
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER HINT */}
      <div className="mt-2 pt-1.5 border-t border-cyan-900/60 flex items-center justify-between text-[11px] text-cyan-400/90 font-mono">
        <div>
          {activeBlueprint ? (
            <span className="text-emerald-300 font-bold">
              ⚡ Cetak Biru Terpilih: [{activeBlueprint.name}] — Klik ubin kebun kosong untuk membangun!
            </span>
          ) : (
            <span>Pilih salah satu struktur di atas untuk mulai menaruh cetak biru.</span>
          )}
        </div>
        <div className="text-stone-400 text-[10px]">
          Tekan <kbd className="bg-cyan-950 px-1 py-0.5 rounded border border-cyan-700">V</kbd> ganti 2D/3D • <kbd className="bg-cyan-950 px-1 py-0.5 rounded border border-cyan-700">B</kbd> tutup CAD
        </div>
      </div>
    </div>
  );
}