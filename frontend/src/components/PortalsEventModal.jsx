import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function PortalsEventModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('portals'); // 'portals' | 'halloween'
  const [portalsEventsData, setPortalsEventsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enteringPortal, setEnteringPortal] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(1122); // ~18:42

  const fetchPortalsEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/game/portals-events');
      if (res.ok) {
        const data = await res.json();
        setPortalsEventsData(data);
      }
    } catch (err) {
      console.error('Failed to load portals & events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPortalsEvents();
    }
  }, [isOpen]);

  // Live countdown timer for active portal
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEnterPortal = async (portalId) => {
    sounds.playClick();
    setEnteringPortal(true);
    try {
      const res = await fetch('/api/v1/game/portals-events/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal_id: portalId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(
          `🌀 Ekspedisi ${data.portal} Sukses! Diperoleh: ${Object.keys(data.resources_collected).join(', ')} dan +${data.gold_found} G!`
        );
        fetchPortalsEvents();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal menembus portal'}`);
      }
    } catch (err) {
      console.error('Enter portal error:', err);
    } finally {
      setEnteringPortal(false);
    }
  };

  const handleTrickOrTreat = async (npcName) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/portals-events/trick-or-treat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npc_name: npcName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🍬 ${data.message} (+${data.candies_gained} Permen, +${data.tokens_gained} Token Roh)`);
        fetchPortalsEvents();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal trick or treat'}`);
      }
    } catch (err) {
      console.error('Trick or treat error:', err);
    }
  };

  const handlePurchaseHalloween = async (itemId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/portals-events/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🎃 ${data.message}`);
        fetchPortalsEvents();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Pembelian gagal'}`);
      }
    } catch (err) {
      console.error('Shop error:', err);
    }
  };

  const portalList = portalsEventsData?.portal_catalog || [];
  const eventInv = portalsEventsData?.event_inventory || { spooky_tokens: 0, candies: 0 };
  const shopList = portalsEventsData?.halloween_shop || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-purple-600/70 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 border-b border-purple-500/50">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌀</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-200 font-serif tracking-wide flex items-center gap-2">
                Portal Dimensi & Event Musiman
                <span className="text-xs bg-purple-500/20 border border-purple-400 text-purple-300 font-mono px-2 py-0.5 rounded-full">
                  Event Aktif: Halloween Madness 🎃
                </span>
              </h2>
              <p className="text-xs text-purple-300/70">
                8 Gerbang Realitas Berwaktu, Eksplorasi Dimensi Rahasia, dan Festival Tahunan Moonlight Hollow
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

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-stone-800 bg-slate-950/60 px-6 justify-between items-center">
          <div className="flex">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('portals'); }}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'portals'
                  ? 'border-purple-400 text-purple-300 bg-purple-950/30'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🌀</span>
              <span>8 Portal Dimensi (Timed Portals)</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('halloween'); }}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'halloween'
                  ? 'border-orange-400 text-orange-300 bg-orange-950/30'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🎃</span>
              <span>Halloween Madness (Festival Roh)</span>
            </button>
          </div>

          {activeTab === 'halloween' && (
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-orange-300">
              <span>🍬 {eventInv.candies || 0} Permen</span>
              <span>🪙 {eventInv.spooky_tokens || 0} Token Roh</span>
            </div>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-purple-400 font-mono animate-pulse">
              Memindai resonansi koordinat portal dimensional...
            </div>
          )}

          {/* TAB 1: 8 TIMED PORTALS */}
          {!loading && activeTab === 'portals' && (
            <div className="space-y-4">
              {/* Highlight Active Portal Countdown Banner */}
              <div className="p-4 bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 border border-purple-500/60 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-2xl animate-spin-slow">
                    🌀
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-purple-200">
                      Crystal Dimension Portal — Sedang Terbuka
                    </h3>
                    <p className="text-xs text-stone-400">
                      Koordinat: Barat Lembah Aetherwyn • Bioma: Goa Kristal Bercahaya
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">
                    SISA WAKTU PORTAL
                  </span>
                  <span className="text-2xl font-black text-amber-300 font-mono tracking-widest">
                    {formatCountdown(countdownSeconds)}
                  </span>
                </div>
              </div>

              {/* 8 Dimensional Portals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portalList.map((portal) => (
                  <div
                    key={portal.id}
                    className="p-3.5 bg-slate-800/80 border border-stone-700 hover:border-purple-500/60 rounded-xl transition shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 bg-slate-900 rounded-lg border border-stone-700">{portal.icon}</span>
                          <div>
                            <h4 className="font-bold text-stone-100 text-xs">
                              {portal.name}
                            </h4>
                            <div className="text-[11px] text-purple-300 font-medium">
                              Tema: {portal.theme}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-amber-300 border border-stone-700">
                          Min. Lv {portal.min_level}
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded-lg border border-stone-800 text-xs text-stone-300 space-y-1 mb-2">
                        <div className="text-[10px] text-stone-400 font-bold">MATERIAL KHUSUS DIMENSI:</div>
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          {portal.resources.map((res, idx) => (
                            <span key={idx} className="bg-purple-950/60 text-purple-200 border border-purple-700/40 px-1.5 py-0.5 rounded text-[10px]">
                              {res}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-amber-300/90 pt-1">
                          Imbalan Langka: <strong>{portal.reward_preview}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={enteringPortal}
                      onClick={() => handleEnterPortal(portal.id)}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      {enteringPortal ? 'Menembus Portal...' : `🌀 Masuki Dimensi (${portal.name.split('(')[0]})`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HALLOWEEN MADNESS */}
          {!loading && activeTab === 'halloween' && (
            <div className="space-y-4">
              {/* Spooky Whimsical Banner */}
              <div className="p-4 bg-gradient-to-r from-orange-950/80 via-slate-900 to-purple-950/80 border border-orange-500/60 rounded-xl relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <span className="text-4xl animate-bounce">🎃</span>
                  <div>
                    <h3 className="font-serif font-black text-lg text-orange-200">
                      Halloween Madness — Festival Roh Lembah (Moonlight Hollow)
                    </h3>
                    <p className="text-xs text-stone-300 max-w-xl">
                      Malam bulan perak telah tiba! Seluruh desa dihiasi lentera labu tersenyum ramah. Tanam Labu Hantu mistis, lakukan Trick-or-Treat ke rumah penduduk, dan tukarkan Token Roh di Toko Festival!
                    </p>
                  </div>
                </div>
              </div>

              {/* Trick or Treat Section */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-stone-800">
                <h4 className="font-bold text-orange-300 text-xs mb-2 flex items-center gap-1.5">
                  <span>🍬 Kunjungi Rumah Penduduk (Trick or Treat)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Elara', 'Rowan', 'Mira'].map((npc) => {
                    const visited = (eventInv.trick_or_treat_npcs || []).includes(npc);
                    return (
                      <div
                        key={npc}
                        className="p-2.5 bg-slate-800/80 rounded-lg border border-stone-700 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-stone-200">Rumah {npc}</span>
                        <button
                          disabled={visited}
                          onClick={() => handleTrickOrTreat(npc)}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                            visited
                              ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-500 text-white shadow'
                          }`}
                        >
                          {visited ? '✓ Selesai' : 'Trick or Treat!'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spooky Event Shop */}
              <div>
                <h4 className="font-bold text-orange-300 text-xs mb-2">
                  Toko Cinderamata Festival Roh Halloween
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {shopList.map((item) => {
                    const isPurchased = (eventInv.unlocked_event_items || []).includes(item.id);
                    const canAfford = (eventInv.spooky_tokens || 0) >= item.cost_tokens && (gameState?.player?.gold || 0) >= item.cost_gold;

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-800/80 border border-stone-700 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-2xl">{item.icon}</span>
                            <h5 className="font-bold text-stone-100 text-xs">{item.name}</h5>
                          </div>
                          <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
                            {item.desc}
                          </p>
                          <div className="text-[11px] font-mono text-orange-300 font-bold mb-3">
                            Biaya: {item.cost_tokens} Token Roh + {item.cost_gold} G
                          </div>
                        </div>

                        {isPurchased ? (
                          <span className="text-center py-1 bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 font-bold text-xs rounded-lg">
                            ✓ Sudah Terbuka
                          </span>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => handlePurchaseHalloween(item.id)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition shadow ${
                              canAfford
                                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? 'Beli Item Festival' : 'Token / Emas Kurang'}
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
          <span>Portal dimensi akan muncul bergantian secara acak sesuai jadwal kalender real-time server.</span>
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
