import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function UndergroundMiningModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'machinery'
  const [miningData, setMiningData] = useState(null);
  const [zones, setZones] = useState([]);
  const [mineralsCatalog, setMineralsCatalog] = useState([]);
  const [machineryRecipes, setMachineryRecipes] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [excavating, setExcavating] = useState(false);

  const fetchMining = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/game/mining');
      if (res.ok) {
        const data = await res.json();
        setMiningData(data.mining_data);
        setZones(data.zones || []);
        setMineralsCatalog(data.minerals_catalog || []);
        setMachineryRecipes(data.machinery_recipes || []);
        setSelectedFloor(data.mining_data?.current_floor || 1);
      }
    } catch (err) {
      console.error('Failed to load mining data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMining();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExcavate = async (floor) => {
    sounds.playClick();
    setExcavating(true);
    try {
      const res = await fetch('/api/v1/game/mining/excavate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floor })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        const dropKeys = Object.keys(data.drops || {});
        showNotification && showNotification(
          `⛏️ Ekskavasi Lantai ${floor} selesai! Ditemukan: ${dropKeys.map((k) => `${data.drops[k]}x ${k}`).join(', ')}`
        );
        fetchMining();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Ekskavasi gagal'}`);
      }
    } catch (err) {
      console.error('Excavation error:', err);
    } finally {
      setExcavating(false);
    }
  };

  const handleProcessMachine = async (recipeName) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/mining/machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_name: recipeName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`⚙️ ${data.message}`);
        fetchMining();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Pengolahan gagal'}`);
      }
    } catch (err) {
      console.error('Machinery error:', err);
    }
  };

  const deepest = miningData?.deepest_floor || 1;
  const vault = miningData?.minerals_vault || {};
  const elevators = miningData?.elevator_checkpoints || [1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-stone-600 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-stone-900 via-slate-900 to-stone-900 border-b border-stone-700">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⛏️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide flex items-center gap-2">
                Eksplorasi Goa Tambang Bawah Tanah
                <span className="text-xs bg-stone-800 border border-stone-600 text-stone-300 font-mono px-2 py-0.5 rounded-full">
                  Kedalaman Terjauh: Lantai {deepest}/60
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                10 Zona Kedalaman, Urat Mineral Kuno, Tungku Peleburan, dan Kereta Rel Tambang
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-900/80 text-stone-300 hover:text-white border border-stone-600 hover:border-rose-500 flex items-center justify-center font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS & VAULT COUNTERS */}
        <div className="flex border-b border-stone-800 bg-slate-950/60 px-6 justify-between items-center">
          <div className="flex">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('zones'); }}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'zones'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🗺️</span>
              <span>Zona & Lantai Tambang</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('machinery'); }}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'machinery'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/40'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>⚙️</span>
              <span>Tungku & Mesin Pengolah</span>
            </button>
          </div>

          {/* Quick Vault Preview */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span title="Batu">🪨 {vault.mat_stone || 0}</span>
            <span title="Batu Bara">⬛ {vault.mat_coal || 0}</span>
            <span title="Bijih Tembaga">🟫 {vault.mat_copper_ore || 0}</span>
            <span title="Bijih Besi">🔩 {vault.mat_iron_ore || 0}</span>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-amber-400 font-mono animate-pulse">
              Memuat formasi geologis bawah tanah...
            </div>
          )}

          {/* TAB 1: ZONES & FLOORS */}
          {!loading && activeTab === 'zones' && (
            <div className="space-y-4">
              {/* Elevator Checkpoints Bar */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🛗 Lift Pos Singgah Cepat:</span>
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {elevators.map((fl) => (
                    <button
                      key={fl}
                      onClick={() => { sounds.playClick(); setSelectedFloor(fl); }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        selectedFloor === fl
                          ? 'bg-amber-600 text-white shadow ring-1 ring-amber-400'
                          : 'bg-slate-800 text-stone-300 hover:bg-slate-700'
                      }`}
                    >
                      Lt. {fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 10 Zones Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {zones.map((z, idx) => {
                  const [startF, endF] = z.floors.replace('+', '').split('-').map(Number);
                  const isZoneUnlocked = deepest >= startF;
                  const isCurrentZone = selectedFloor >= startF && (isNaN(endF) || selectedFloor <= endF);

                  return (
                    <div
                      key={z.id}
                      className={`p-3.5 rounded-xl border transition shadow flex flex-col justify-between ${
                        isCurrentZone
                          ? 'bg-stone-800/90 border-amber-500/80 ring-1 ring-amber-400'
                          : isZoneUnlocked
                          ? 'bg-slate-800/70 border-stone-700'
                          : 'bg-slate-950/60 border-stone-900 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⛏️</span>
                            <div>
                              <h4 className="font-bold text-stone-100 text-xs">
                                {z.name}
                              </h4>
                              <div className="text-[11px] text-amber-300/80">
                                Lantai {z.floors} • Tema: {z.theme}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                            Min. Lv {z.min_level}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-mono">
                          {isZoneUnlocked ? '✓ Jalur Terbuka' : '🔒 Masih Terkunci'}
                        </span>
                        {isZoneUnlocked && (
                          <button
                            disabled={excavating}
                            onClick={() => handleExcavate(Math.min(deepest, startF))}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shadow"
                          >
                            {excavating ? 'Menggali...' : `Ekskavasi Lantai ${Math.min(deepest, startF)}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MACHINERY & PROCESSING */}
          {!loading && activeTab === 'machinery' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800">
                <h3 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-2">
                  <span>⚙️ Bengkel Peleburan & Pemroses Batuan</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Gunakan Tungku Peleburan (Smelter), Penghancur Geode (Crusher), dan Penggosok Permata (Polisher) untuk mengolah batuan mentah menjadi ingot batangan dan perhiasan berharga.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {machineryRecipes.map((r, i) => {
                  const inputEntries = Object.entries(r.inputs || {});
                  const canCraft = inputEntries.every(([matId, count]) => (vault[matId] || 0) >= count);

                  return (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-800/80 border border-stone-700 rounded-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-stone-100 text-xs flex items-center gap-1.5">
                            <span>{r.machine === 'smelter' ? '🔥' : r.machine === 'crusher' ? '🔨' : '💎'}</span>
                            <span>{r.name}</span>
                          </h4>
                          <span className="text-[10px] text-amber-300 font-mono bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                            Mesin: {r.machine.toUpperCase()}
                          </span>
                        </div>

                        {/* Input requirements */}
                        <div className="text-xs text-stone-300 mb-2 space-y-1 bg-slate-900/60 p-2 rounded-lg border border-stone-800">
                          <span className="text-[10px] text-stone-400 font-bold block">BAHAN YANG DIBUTUHKAN:</span>
                          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                            {inputEntries.map(([matId, count]) => (
                              <span
                                key={matId}
                                className={vault[matId] >= count ? 'text-emerald-400' : 'text-rose-400'}
                              >
                                {matId}: {vault[matId] || 0}/{count}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-amber-300 font-medium mb-3">
                          Hasil Olahan: <strong>{r.output.count}x {r.output.name}</strong> (Nilai: {r.output.sell_price} G)
                        </div>
                      </div>

                      <button
                        disabled={!canCraft}
                        onClick={() => handleProcessMachine(r.name)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition shadow ${
                          canCraft
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {canCraft ? '🔥 Mulai Olah di Mesin' : 'Bahan Mentah Tidak Cukup'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Gunakan Beliung kualitas lebih tinggi untuk menggali lapisan terdalam dengan hemat stamina.</span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-bold border border-stone-600 transition"
          >
            Tutup [ESC]
          </button>
        </div>

      </div>
    </div>
  );
}
