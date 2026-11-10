import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function CollectionJournalModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('crops'); // 'crops' | 'minerals' | 'fish' | 'achievements' | 'guilds'
  const [collectionData, setCollectionData] = useState(null);
  const [guildsData, setGuildsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const [colRes, gldRes] = await Promise.all([
        fetch('/api/v1/game/collections'),
        fetch('/api/v1/game/guilds')
      ]);

      if (colRes.ok && gldRes.ok) {
        const cData = await colRes.json();
        const gData = await gldRes.json();
        setCollectionData(cData);
        setGuildsData(gData);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimAchievement = async (achievementId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/achievements/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievement_id: achievementId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🏆 ${data.message}`);
        fetchCollections();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal klaim hadiah'}`);
      }
    } catch (err) {
      console.error('Claim achievement error:', err);
    }
  };

  const handleJoinGuild = async (guildId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/guilds/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guild_id: guildId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🛡️ ${data.message}`);
        fetchCollections();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal bergabung guild'}`);
      }
    } catch (err) {
      console.error('Join guild error:', err);
    }
  };

  const summary = collectionData?.summary || {};
  const categories = summary?.categories || {};
  const currentItems = categories[activeTab] || [];
  const achievements = collectionData?.achievements_catalog || [];
  const completedAchs = collectionData?.completed_achievements || [];
  const claimedAchs = collectionData?.claimed_achievements || [];
  const guilds = guildsData?.catalog || [];
  const activeGuildId = guildsData?.active_guild_id || 'guild_farmer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-emerald-600/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border-b border-emerald-600/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📖</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300 font-serif tracking-wide flex items-center gap-2">
                Buku Koleksi & Ensiklopedia Dunia
                <span className="text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                  Kelengkapan: {summary.discovered_count || 0}/{summary.total_items || 32} ({summary.completion_percentage || 0}%)
                </span>
              </h2>
              <p className="text-xs text-emerald-200/70">
                Katalog Hasil Pertanian, Pertambangan, Perikanan, Pencapaian, dan Perserikatan Guild
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
        <div className="flex border-b border-stone-800 bg-slate-950/60 px-6 overflow-x-auto">
          {[
            { id: 'crops', label: 'Tanaman (Crops)', icon: '🌱' },
            { id: 'minerals', label: 'Mineral & Permata', icon: '💎' },
            { id: 'fish', label: 'Biota Samudra', icon: '🐟' },
            { id: 'achievements', label: 'Pencapaian (Achievements)', icon: '🏆' },
            { id: 'guilds', label: 'Guild Peradaban', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { sounds.playClick(); setActiveTab(tab.id); }}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-emerald-400 font-mono animate-pulse">
              Membuka lembaran ensiklopedia alam semesta...
            </div>
          )}

          {/* TAB: ITEMS (CROPS, MINERALS, FISH) */}
          {!loading && ['crops', 'minerals', 'fish'].includes(activeTab) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition flex flex-col justify-between ${
                    item.discovered
                      ? 'bg-slate-800/80 border-emerald-700/50 text-stone-200 shadow'
                      : 'bg-slate-950/70 border-stone-800 text-stone-500 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">
                        {item.discovered ? (activeTab === 'crops' ? '🌾' : activeTab === 'minerals' ? '💎' : '🐟') : '❓'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700">
                        {item.discovered ? item.rarity : '???'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs mb-1">
                      {item.discovered ? item.name : 'Belum Ditemukan'}
                    </h4>
                    <div className="text-[10px] text-stone-400">
                      Kategori: {item.category}
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-stone-800/80 text-[10px] font-mono text-emerald-300 flex justify-between">
                    <span>Nilai Jual:</span>
                    <strong>{item.discovered ? `${item.value} G` : '???'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: ACHIEVEMENTS */}
          {!loading && activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((ach) => {
                const isClaimed = claimedAchs.includes(ach.id);
                const isCompleted = completedAchs.includes(ach.id) || isClaimed;

                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border transition shadow flex flex-col justify-between ${
                      isClaimed
                        ? 'bg-emerald-950/20 border-emerald-700/40 text-stone-300'
                        : isCompleted
                        ? 'bg-amber-950/40 border-amber-500/80 text-amber-100 ring-1 ring-amber-400'
                        : 'bg-slate-800/80 border-stone-700 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs flex items-center gap-2">
                          <span>🏆</span>
                          <span>{ach.name}</span>
                        </h4>
                        <span className="text-[10px] font-mono bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                          {ach.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        Hadiah: +{ach.reward_gold} G
                      </span>

                      {isClaimed ? (
                        <span className="text-[11px] font-bold text-emerald-400 font-mono">
                          ✓ Sudah Diklaim
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaimAchievement(ach.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shadow"
                        >
                          🎁 Klaim Hadiah
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: GUILDS */}
          {!loading && activeTab === 'guilds' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800">
                <h3 className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-2">
                  <span>🛡️ Perserikatan Guild Kerajaan</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-2 py-0.5 rounded-full font-mono">
                    Guild Aktif: {guilds.find((g) => g.id === activeGuildId)?.name || 'Farmer Guild'}
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Bergabunglah dengan salah satu guild profesi peradaban untuk mendapatkan efek pasif khusus di seluruh aktivitas permainan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guilds.map((g) => {
                  const isCurrent = activeGuildId === g.id;

                  return (
                    <div
                      key={g.id}
                      className={`p-3.5 rounded-xl border transition shadow flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-400'
                          : 'bg-slate-800/80 border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl p-1.5 bg-slate-900 rounded-lg border border-stone-700">{g.icon}</span>
                            <div>
                              <h4 className="font-bold text-stone-100 text-xs">{g.name}</h4>
                              <div className="text-[10px] text-stone-400">Ketua: {g.leader}</div>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs bg-slate-900/60 p-2 rounded-lg border border-stone-800 text-emerald-300 font-medium mb-3">
                          Efek Pasif: <strong>{g.perk}</strong>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-center py-1 bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-lg">
                          ✓ Guild Aktif Anda
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoinGuild(g.id)}
                          className="w-full py-1.5 bg-slate-700 hover:bg-emerald-700 text-stone-200 hover:text-white rounded-lg text-xs font-bold transition border border-stone-600 shadow"
                        >
                          🛡️ Gabung Guild Ini
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Temukan tanaman liar, bibit langka, dan ikan baru untuk melengkapi seluruh buku ensiklopedia.</span>
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
