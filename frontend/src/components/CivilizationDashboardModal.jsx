import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function CivilizationDashboardModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'market' | 'npcs' | 'quests'
  const [civData, setCivData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [livingNpcs, setLivingNpcs] = useState([]);
  const [dynamicQuests, setDynamicQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advancingEra, setAdvancingEra] = useState(false);
  const [tradingItem, setTradingItem] = useState(null);

  // Fetch all civilization data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [civRes, mktRes, npcRes, qstRes] = await Promise.all([
        fetch('/api/v1/game/civilization/status/1'),
        fetch('/api/v1/game/economy/market/1'),
        fetch('/api/v1/game/npcs/living/1'),
        fetch('/api/v1/game/civilization/quests/1')
      ]);

      if (civRes.ok && mktRes.ok && npcRes.ok && qstRes.ok) {
        const cData = await civRes.json();
        const mData = await mktRes.json();
        const nData = await npcRes.json();
        const qData = await qstRes.json();

        setCivData(cData);
        setMarketData(mData);
        setLivingNpcs(nData.npcs || []);
        setDynamicQuests(qData.quests || []);
      }
    } catch (err) {
      console.error('Failed to load civilization dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  // Handle Era Advancement
  const handleAdvanceEra = async () => {
    try {
      setAdvancingEra(true);
      const res = await fetch('/api/v1/game/civilization/advance-era/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        sounds.playLevelUp();
        showNotification(data.message, 'success');
        if (gameState) {
          setGameState({
            ...gameState,
            player: { ...gameState.player, gold: data.new_gold },
            civilization: data.civilization
          });
        }
        await fetchDashboardData();
      } else {
        const err = await res.json();
        showNotification(err.detail || 'Gagal memajukan era', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Koneksi terputus ke server', 'error');
    } finally {
      setAdvancingEra(false);
    }
  };

  // Handle Commodity Trade (Buy/Sell)
  const handleTrade = async (action, cid, amount = 1) => {
    try {
      const res = await fetch('/api/v1/game/economy/trade/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, commodity_id: cid, amount })
      });

      if (res.ok) {
        const data = await res.json();
        sounds.playCoin();
        showNotification(data.message, 'success');
        if (gameState) {
          setGameState({
            ...gameState,
            player: { ...gameState.player, gold: data.total_gold }
          });
        }
        await fetchDashboardData();
      } else {
        const err = await res.json();
        showNotification(err.detail || 'Transaksi gagal', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Gagal menghubungi pasar', 'error');
    }
  };

  // Handle Dynamic Quest Complete
  const handleCompleteQuest = async (questId) => {
    try {
      const res = await fetch('/api/v1/game/civilization/quests/complete/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quest_id: questId })
      });

      if (res.ok) {
        const data = await res.json();
        sounds.playLevelUp();
        showNotification(data.message, 'success');
        if (gameState) {
          setGameState({
            ...gameState,
            player: { ...gameState.player, gold: data.current_gold }
          });
        }
        await fetchDashboardData();
      } else {
        const err = await res.json();
        showNotification(err.detail || 'Gagal menyelesaikan misi', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Koneksi terputus', 'error');
    }
  };

  if (!isOpen) return null;

  const curEra = civData?.current_era || {};
  const nextEra = civData?.next_era;
  const layers = civData?.civilization?.layers || {};
  const commodities = marketData?.commodities || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-stone-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100 font-sans">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/95 via-stone-900 to-amber-950/95 border-b border-amber-700/60">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-bounce">🏛️</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold font-medieval text-amber-300">
                  Pusat Kendali Peradaban & Ekonomi Hidup
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/50 text-[11px] font-mono font-bold text-amber-200">
                  {curEra.name?.split('—')[0] || 'Era I'}
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Simulasi 7 lapisan masyarakat, pasar dinamis suplai-permintaan, dan rutinitas warga otonom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-2xl font-bold px-2 py-1 transition"
          >
            ✕
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-amber-900/50 bg-stone-950/70 text-xs sm:text-sm font-semibold select-none">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('overview'); }}
            className={`flex-1 py-3 px-3 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <span>🏛️</span>
            <span>Ikhtisar Peradaban</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('market'); }}
            className={`flex-1 py-3 px-3 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'market'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <span>📈</span>
            <span>Pasar & Usaha Kota</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('npcs'); }}
            className={`flex-1 py-3 px-3 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'npcs'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <span>👥</span>
            <span>Warga & Rutinitas</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('quests'); }}
            className={`flex-1 py-3 px-3 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeTab === 'quests'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <span>📜</span>
            <span>Misi Kebutuhan Kota ({dynamicQuests.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* TAB 1: OVERVIEW & 7 SIMULATION LAYERS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* CURRENT ERA HERO BANNER */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-stone-800 to-amber-950/80 border border-amber-600/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl p-3 bg-amber-900/50 rounded-2xl border border-amber-500/40">
                    {curEra.icon || '🏰'}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-amber-200 font-medieval">
                      {curEra.name}
                    </h3>
                    <p className="text-xs text-stone-300 max-w-xl leading-relaxed mt-0.5">
                      {curEra.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {curEra.perks?.map((perk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-amber-600/40 text-[10px] text-amber-200">
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ERA ADVANCEMENT ACTION CARD */}
                {nextEra ? (
                  <div className="bg-stone-900/90 border border-amber-500/50 rounded-xl p-3.5 min-w-[240px] flex flex-col justify-between text-xs">
                    <div>
                      <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                        Kemajuan Era Berikutnya:
                      </div>
                      <div className="font-bold text-amber-100 flex items-center space-x-1">
                        <span>{nextEra.icon}</span>
                        <span>{nextEra.name}</span>
                      </div>
                      <div className="mt-2 text-[10px] text-stone-300 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Syarat Emas:</span>
                          <span className="font-mono font-bold text-amber-300">
                            {curEra.required_advance_costs?.gold?.toLocaleString()} G
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kemakmuran Min.:</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {nextEra.req_prosperity} Poin
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAdvanceEra}
                      disabled={advancingEra || (gameState?.player?.gold || 0) < (curEra.required_advance_costs?.gold || 0)}
                      className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow flex items-center justify-center space-x-1 disabled:opacity-40"
                    >
                      <span>🚀</span>
                      <span>{advancingEra ? 'Memproses...' : 'Majukan Peradaban!'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-cyan-950/60 border border-cyan-500/50 rounded-xl text-center text-cyan-200 text-xs font-semibold">
                    ✨ Peradaban telah mencapai puncak tertinggi (Arcane Future)!
                  </div>
                )}
              </div>

              {/* 7 SIMULATION LAYERS GRID */}
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <span>📊</span>
                  <span>Tujuh Lapisan Simulasi Peradaban (Civilization Layers)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(layers).map(([layerKey, layerData]) => {
                    const score = layerData.score || 75;
                    const icons = {
                      population: '👥',
                      economy: '💰',
                      infrastructure: '🏗️',
                      social: '🤝',
                      governance: '⚖️',
                      environment: '🌳',
                      culture: '🎭'
                    };
                    const titles = {
                      population: 'Populasi',
                      economy: 'Ekonomi',
                      infrastructure: 'Infrastruktur',
                      social: 'Sosial & Kohesi',
                      governance: 'Tata Kelola',
                      environment: 'Lingkungan Alam',
                      culture: 'Seni & Tradisi'
                    };

                    return (
                      <div
                        key={layerKey}
                        className="bg-stone-800/70 border border-stone-700/80 rounded-xl p-3 flex flex-col justify-between shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-base">{icons[layerKey] || '📌'}</span>
                            <span className="font-bold text-amber-200 text-xs">
                              {titles[layerKey] || layerKey}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {score}%
                          </span>
                        </div>

                        <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-700 mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-stone-300">
                          <span className="text-stone-400">{layerData.label || 'Stabil'}</span>
                          <span className="font-mono text-amber-300">{layerData.metric || `${score} Poin`}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MARKET & COMMODITY TRADING */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              
              {/* MARKET TICKER HEADER */}
              <div className="flex flex-wrap items-center justify-between pb-2 border-b border-stone-800 text-xs">
                <span className="text-stone-300">
                  Harga berfluktuasi secara dinamis sesuai perbandingan pasokan panen dan kebutuhan harian warga.
                </span>
                <span className="font-mono text-amber-300 font-bold bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                  🪙 Kas Pemain: {gameState?.player?.gold?.toLocaleString() || 0} G
                </span>
              </div>

              {/* COMMODITIES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(commodities).map(([cid, comm]) => {
                  return (
                    <div
                      key={cid}
                      className="bg-stone-800/80 border border-stone-700 rounded-xl p-3 flex flex-col justify-between shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-lg">{comm.icon}</span>
                            <span className="font-bold text-amber-100 text-xs">{comm.name}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {comm.current_price} G
                          </span>
                        </div>

                        <div className="text-[10px] text-stone-400 space-y-0.5 mt-2 bg-stone-900/60 p-2 rounded-lg">
                          <div className="flex justify-between">
                            <span>Pasokan Pasar:</span>
                            <span className="font-mono font-semibold text-stone-300">{comm.supply} unit</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Permintaan Kota:</span>
                            <span className="font-mono font-semibold text-cyan-300">{comm.demand} unit</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-stone-700/60">
                        <button
                          onClick={() => handleTrade('buy', cid, 1)}
                          className="py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-[11px] font-bold transition"
                        >
                          Beli (1x)
                        </button>
                        <button
                          onClick={() => handleTrade('sell', cid, 1)}
                          className="py-1 rounded bg-amber-600/90 hover:bg-amber-500 text-slate-950 text-[11px] font-bold transition shadow"
                        >
                          Jual (1x)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTIVE TOWN BUSINESSES */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                  <span>🏪</span>
                  <span>Usaha Mandiri & Bengkel Produksi Kota (Town Enterprises)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {civData?.businesses?.map((b) => (
                    <div
                      key={b.id}
                      className="bg-stone-800/60 border border-stone-700/80 rounded-xl p-3 flex items-start space-x-3 shadow-sm"
                    >
                      <span className="text-3xl p-2 bg-stone-900 rounded-xl border border-stone-700">
                        {b.icon || '🏪'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-amber-200 text-xs">{b.name}</h5>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold">
                            +{b.revenue || b.daily_revenue || 150} G/Hari
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                          {b.status || `Pemilik: ${b.owner || b.owner_npc}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LIVING NPCS & AUTONOMOUS ROUTINES */}
          {activeTab === 'npcs' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400">
                Setiap warga memiliki jadwal dinamis, ingatan hubungan, dan bereaksi terhadap kondisi cuaca serta jam saat ini:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {livingNpcs.map((npc) => {
                  const schedule = npc.current_schedule || {};
                  const rel = npc.relationships || {};
                  return (
                    <div
                      key={npc.id}
                      className="bg-stone-800/80 border border-stone-700 rounded-xl p-3.5 flex flex-col justify-between shadow"
                    >
                      <div>
                        {/* NPC IDENTITY HEADER */}
                        <div className="flex items-center space-x-3 pb-2 border-b border-stone-700/80">
                          <span className="text-3xl p-2 bg-stone-900 rounded-xl border border-stone-700">
                            {npc.avatar_icon}
                          </span>
                          <div className="flex-1 truncate">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-200 text-sm">{npc.name}</span>
                              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                                {npc.race}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400 block truncate">{npc.title}</span>
                          </div>
                        </div>

                        {/* CURRENT TIMELINE SCHEDULE */}
                        <div className="mt-2.5 p-2 rounded-lg bg-stone-900/80 border border-stone-700/60 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase">
                              Kegiatan Jam Ini ({schedule.start || 8}:00 - {schedule.end || 12}:00):
                            </span>
                            <span className="text-[10px] text-cyan-300 font-semibold">
                              📍 {schedule.location}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300 italic">
                            "{schedule.activity || 'Menjalani rutinitas harian di lembah'}"
                          </p>
                        </div>

                        {/* RELATIONSHIP DIMENSIONS */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                          <div className="bg-stone-900/60 p-1.5 rounded-lg border border-stone-800">
                            <span className="text-[9px] text-stone-400 block uppercase">Kepercayaan</span>
                            <span className="text-xs font-bold text-cyan-300 font-mono">{rel.trust || 60}%</span>
                          </div>
                          <div className="bg-stone-900/60 p-1.5 rounded-lg border border-stone-800">
                            <span className="text-[9px] text-stone-400 block uppercase">Rasa Hormat</span>
                            <span className="text-xs font-bold text-amber-300 font-mono">{rel.respect || 70}%</span>
                          </div>
                          <div className="bg-stone-900/60 p-1.5 rounded-lg border border-stone-800">
                            <span className="text-[9px] text-stone-400 block uppercase">Persahabatan</span>
                            <span className="text-xs font-bold text-rose-300 font-mono">{rel.friendship || 55}%</span>
                          </div>
                        </div>

                        {/* RECENT MEMORY */}
                        {npc.memories?.length > 0 && (
                          <div className="mt-2 text-[10px] text-stone-400 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                            <span className="text-amber-300 font-semibold block mb-0.5">🧠 Ingatan Terakhir:</span>
                            <span>{npc.memories[0].summary}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC CIVILIZATION QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-400">
                Misi ini dihasilkan secara dinamis berdasarkan kekurangan bahan di pasar dan kebutuhan proyek peradaban:
              </div>

              {dynamicQuests.length === 0 ? (
                <div className="p-8 text-center bg-stone-800/40 rounded-xl border border-stone-700 text-stone-400 text-xs">
                  Semua kebutuhan pasar saat ini terpenuhi dengan baik! Datanglah kembali saat musim atau stok berganti.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dynamicQuests.map((q) => (
                    <div
                      key={q.id}
                      className="bg-stone-800/80 border border-amber-600/50 rounded-xl p-4 flex flex-col justify-between shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-amber-200 text-sm">{q.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-bold uppercase">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed mb-3">
                          {q.description}
                        </p>
                        <div className="text-[11px] text-stone-400 space-y-1 bg-stone-900/80 p-2 rounded-lg border border-stone-700/60 mb-3">
                          <div className="flex justify-between">
                            <span>Bahan Dibutuhkan:</span>
                            <span className="font-semibold text-amber-200">
                              {q.required_amount}x {q.required_item}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hadiah:</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              +{q.reward_gold} G, +{q.reward_prosperity} Kemakmuran
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCompleteQuest(q.id)}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs transition shadow flex items-center justify-center space-x-1"
                      >
                        <span>📦</span>
                        <span>Serahkan Bahan & Selesaikan</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-stone-950/90 border-t border-amber-900/60 flex items-center justify-between text-xs text-stone-400">
          <span>Skor Kemakmuran Lembah: <strong>{civData?.prosperity_score || 450}</strong> Poin</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition"
          >
            Tutup [C]
          </button>
        </div>

      </div>
    </div>
  );
}
