import React, { useState } from 'react';
import { sounds } from '../game/SoundFx';

export default function TechTreeModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [unlocking, setUnlocking] = useState(false);

  if (!isOpen || !gameState) return null;

  const techTree = gameState.tech_tree || [];
  const player = gameState.player;
  const currentEra = gameState.world.era_level || 1;

  const handleUnlockNode = async (tech) => {
    if (tech.unlocked) return;
    if (player.gold < tech.cost_gold) {
      showNotification(`Emas tidak cukup! Butuh ${tech.cost_gold} G (punya ${player.gold} G)`, 'error');
      return;
    }
    if (player.aether_shards < tech.cost_aether) {
      showNotification(`Kristal Aether tidak cukup! Butuh ${tech.cost_aether} 💎 (punya ${player.aether_shards} 💎)`, 'error');
      return;
    }

    setUnlocking(true);
    try {
      const response = await fetch('/api/v1/game/unlock-tech/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tech_id: tech.id })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Gagal membuka riset');
      }

      sounds.playLevelUp();
      showNotification(`Riset Berhasil Dibuka: ${tech.name}! Era: ${data.era_name}`, 'success');

      // Update local gameState
      const updatedTree = techTree.map((t) => (t.id === tech.id ? { ...t, unlocked: true } : t));
      setGameState({
        ...gameState,
        tech_tree: updatedTree,
        player: {
          ...player,
          gold: data.gold_left,
          aether_shards: data.aether_left
        },
        world: {
          ...gameState.world,
          era_level: data.era_level,
          era_name: data.era_name
        }
      });
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setUnlocking(false);
    }
  };

  const eras = [
    { level: 1, name: 'Era 1: Medieval Roots', subtitle: 'Kehidupan Tradisional & Pertanian Manual', icon: '🌾' },
    { level: 2, name: 'Era 2: Growing Settlement', subtitle: 'Irigasi Kristal & Kerajinan Logam', icon: '🏘️' },
    { level: 3, name: 'Era 3: Industrial Fantasy', subtitle: 'Tenaga Uap & Lori Rel Tambang', icon: '🚂' },
    { level: 4, name: 'Era 4: Modern Fantasy', subtitle: 'Listrik Kristal & Penerangan LED', icon: '💡' },
    { level: 5, name: 'Era 5: Aether Civilization', subtitle: 'Otomasi Penuh & Robot Automaton', icon: '🤖' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🔬</span>
          <div>
            <h2 className="text-xl font-bold font-medieval text-cyan-200">
              Pohon Riset Teknologi & Evolusi Peradaban
            </h2>
            <p className="text-stone-400 text-xs">
              Ubah desa Aetherwyn dari zaman pertengahan kuno menjadi kota modern bertenaga Kristal Aether!
            </p>
          </div>
        </div>

        {/* Current Era Progress Tracker */}
        <div className="grid grid-cols-5 gap-2 my-3 p-2 bg-stone-950/80 rounded-xl border border-cyan-950">
          {eras.map((era) => {
            const isCurrent = currentEra === era.level;
            const isPast = currentEra > era.level;
            return (
              <div
                key={era.level}
                className={`p-2 rounded-lg text-center transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/90 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : isPast
                    ? 'bg-emerald-950/40 border border-emerald-700/60 opacity-90'
                    : 'bg-stone-900/40 border border-stone-800 opacity-50'
                }`}
              >
                <span className="text-xl block mb-1">{era.icon}</span>
                <span className={`text-[11px] font-bold block ${isCurrent ? 'text-cyan-300' : isPast ? 'text-emerald-300' : 'text-stone-500'}`}>
                  Era {era.level}
                </span>
                <span className="text-[9px] text-stone-400 hidden sm:block truncate">
                  {isCurrent ? 'Sedang Aktif' : isPast ? 'Selesai' : 'Terkunci'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Technology Nodes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {techTree.map((tech) => {
            const isUnlocked = tech.unlocked;
            const canAfford = player.gold >= tech.cost_gold && player.aether_shards >= tech.cost_aether;

            return (
              <div
                key={tech.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-emerald-950/20 border-emerald-700/60'
                    : canAfford
                    ? 'bg-stone-950/80 border-cyan-600/70 shadow-md'
                    : 'bg-stone-950/40 border-stone-800 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {isUnlocked ? '✅' : '🔬'}
                      </span>
                      <h4 className="font-bold text-amber-200 text-sm">
                        {tech.name}
                      </h4>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded-full font-mono">
                        Era {tech.era}
                      </span>
                    </div>

                    <p className="text-stone-300 text-xs mt-1.5 leading-relaxed">
                      {tech.description}
                    </p>

                    <div className="flex items-center space-x-2 mt-2 text-xs">
                      <span className="text-emerald-400 font-semibold">
                        ✨ Manfaat: {tech.benefits}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Costs */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    {!isUnlocked ? (
                      <>
                        <div className="flex space-x-2 text-xs font-mono font-bold">
                          <span className="text-amber-300 bg-amber-950/70 px-2 py-1 rounded border border-amber-800">
                            🪙 {tech.cost_gold} G
                          </span>
                          <span className="text-cyan-300 bg-cyan-950/70 px-2 py-1 rounded border border-cyan-800">
                            💎 {tech.cost_aether} Shards
                          </span>
                        </div>

                        <button
                          disabled={unlocking || !canAfford}
                          onClick={() => handleUnlockNode(tech)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shadow ${
                            canAfford
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          }`}
                        >
                          {unlocking ? 'Membuka...' : 'Buka Riset 🚀'}
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-900/60 border border-emerald-600 text-emerald-300 rounded-lg text-xs font-bold">
                        Sudah Terbuka
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
