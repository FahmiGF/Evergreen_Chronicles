import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function MountsStableModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [mountsData, setMountsData] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [stables, setStables] = useState([]);
  const [selectedMountId, setSelectedMountId] = useState('horse');
  const [loading, setLoading] = useState(false);

  const fetchMounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/game/mounts');
      if (res.ok) {
        const data = await res.json();
        setMountsData(data.mounts_data);
        setCatalog(data.catalog || []);
        setStables(data.stables || []);
      }
    } catch (err) {
      console.error('Failed to load mounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMounts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMount = async (mountId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/mounts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mount_id: mountId })
      });
      if (res.ok) {
        const data = await res.json();
        sounds.playSuccess();
        showNotification && showNotification(
          data.is_mounted
            ? `🐎 Anda kini menunggangi ${data.mount_name}! Kecepatan jalan naik ${Math.round((data.speed_mult - 1) * 100)}%!`
            : `🚶 Anda telah turun dari tunggangan.`
        );
        fetchMounts();
      }
    } catch (err) {
      console.error('Toggle mount error:', err);
    }
  };

  const handleBondingAction = async (mountId, action) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/mounts/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mount_id: mountId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`💖 ${data.message}`);
        fetchMounts();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Aksi gagal'}`);
      }
    } catch (err) {
      console.error('Bonding action error:', err);
    }
  };

  const handleUpgradeStable = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/mounts/upgrade-stable', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🏛️ ${data.message}`);
        fetchMounts();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Renovasi kandang gagal'}`);
      }
    } catch (err) {
      console.error('Upgrade stable error:', err);
    }
  };

  const handleUnlockMount = async (mountId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/mounts/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mount_id: mountId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`✨ ${data.message}`);
        fetchMounts();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal membuka tunggangan'}`);
      }
    } catch (err) {
      console.error('Unlock mount error:', err);
    }
  };

  const ownedList = mountsData?.owned_mounts || [];
  const curStableTier = mountsData?.stable_tier || 1;
  const currentStableMeta = stables.find((s) => s.tier === curStableTier) || { name: 'Kandang Standar', capacity: 2 };
  const isMounted = mountsData?.is_mounted || false;
  const activeMountId = mountsData?.active_mount_id || 'horse';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-600/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-600/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🐎</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide flex items-center gap-2">
                Kandang Tunggangan (Mount & Stable)
                <span className="text-xs bg-amber-500/20 border border-amber-400 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  {currentStableMeta.name} ({ownedList.length}/{currentStableMeta.capacity})
                </span>
              </h2>
              <p className="text-xs text-amber-200/70">
                Rawat, jalin ikatan batin (bonding), latih, dan tunggangi 10 varietas satwa legenda
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

        {/* STABLE BANNER & RENOVATION BAR */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-300">Fasilitas Kandang:</span>
            <span className="text-stone-300 font-medium">{currentStableMeta.desc}</span>
          </div>
          {curStableTier < stables.length && (
            <button
              onClick={handleUpgradeStable}
              className="px-3 py-1 bg-amber-700/80 hover:bg-amber-600 text-amber-100 font-bold rounded-lg border border-amber-500/50 shadow transition flex items-center gap-1.5"
            >
              <span>🔨 Renovasi ke Tingkat {curStableTier + 1}</span>
              <span className="font-mono text-[11px] opacity-90">({stables[curStableTier]?.cost || 0} G)</span>
            </button>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-amber-400 font-mono animate-pulse">
              Menghubungkan ke kandang kerajaan...
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {/* OWNED MOUNTS CAROUSEL */}
              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <span>Satwa Tunggangan Anda ({ownedList.length})</span>
                  {isMounted && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Sedang Menunggangi
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ownedList.map((m) => {
                    const meta = catalog.find((c) => c.id === m.id) || {};
                    const isCurrent = activeMountId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border transition shadow-md flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400'
                            : 'bg-slate-800/80 border-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-stone-700">{meta.icon || '🐎'}</span>
                              <div>
                                <h4 className="font-bold text-stone-100 flex items-center gap-2 text-sm">
                                  {m.name}
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                                    Lv. {m.level}
                                  </span>
                                </h4>
                                <div className="text-[11px] text-stone-400">
                                  Kecepatan: <strong className="text-amber-300">+{Math.round(((meta.speed_mult || 1.4) - 1) * 100)}%</strong>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleMount(m.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                isCurrent && isMounted
                                  ? 'bg-rose-700 hover:bg-rose-600 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              <span>{isCurrent && isMounted ? 'Turun' : '🐎 Tunggangi'}</span>
                            </button>
                          </div>

                          <div className="text-[11px] text-amber-200/80 italic mb-2">
                            {meta.ability}
                          </div>

                          {/* Bonding & Stamina Bars */}
                          <div className="space-y-1.5 mb-3 bg-slate-900/60 p-2.5 rounded-lg border border-stone-800">
                            <div>
                              <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-0.5">
                                <span className="text-pink-400 font-bold">💖 Ikatan Batin (Bonding)</span>
                                <span>{m.bonding}/100</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-pink-600 to-rose-400"
                                  style={{ width: `${Math.min(100, m.bonding)}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-0.5">
                                <span className="text-amber-400 font-bold">⚡ Stamina Satwa</span>
                                <span>{m.stamina}/{m.max_stamina}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-600 to-emerald-400"
                                  style={{ width: `${Math.min(100, Math.round((m.stamina / m.max_stamina) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bonding Action Buttons */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => handleBondingAction(m.id, 'feed')}
                            className="py-1 bg-slate-700 hover:bg-amber-700 text-stone-200 hover:text-white rounded text-[11px] font-semibold border border-stone-600 transition"
                          >
                            🥕 Beri Makan
                          </button>
                          <button
                            onClick={() => handleBondingAction(m.id, 'groom')}
                            className="py-1 bg-slate-700 hover:bg-amber-700 text-stone-200 hover:text-white rounded text-[11px] font-semibold border border-stone-600 transition"
                          >
                            🪮 Sisir Bulu
                          </button>
                          <button
                            onClick={() => handleBondingAction(m.id, 'play')}
                            className="py-1 bg-slate-700 hover:bg-amber-700 text-stone-200 hover:text-white rounded text-[11px] font-semibold border border-stone-600 transition"
                          >
                            🎾 Ajak Main
                          </button>
                          <button
                            onClick={() => handleBondingAction(m.id, 'train')}
                            className="py-1 bg-slate-700 hover:bg-amber-700 text-stone-200 hover:text-white rounded text-[11px] font-semibold border border-stone-600 transition"
                          >
                            🏃 Latih Lari
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UNOWNED MOUNTS CATALOG DISCOVERY */}
              <div className="pt-2 border-t border-stone-800">
                <h3 className="text-sm font-bold text-amber-300 mb-2">
                  Katalog Seluruh Tunggangan Dunia (Tersedia untuk Diadopsi)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {catalog.map((c) => {
                    const isOwned = ownedList.some((m) => m.id === c.id);
                    return (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          isOwned
                            ? 'bg-emerald-950/20 border-emerald-700/40 opacity-75'
                            : 'bg-slate-800/60 border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{c.icon}</span>
                          <div>
                            <div className="font-bold text-stone-200">{c.name}</div>
                            <div className="text-[10px] text-stone-400">Asal: {c.source}</div>
                          </div>
                        </div>

                        {isOwned ? (
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">
                            ✓ Dimiliki
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUnlockMount(c.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px] shadow"
                          >
                            Adopsi
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Tekan tombol <strong>[R]</strong> untuk menaiki / turun dari tunggangan secara instan.</span>
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
