import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function LeaderboardModal({
  isOpen,
  onClose,
  showNotification
}) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('overall_mastery');
  const [period, setPeriod] = useState('all_time');
  const [rankingsData, setRankingsData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  // Periods list
  const periods = [
    { id: 'all_time', label: 'Sepanjang Masa' },
    { id: 'season', label: 'Musim Ini' },
    { id: 'monthly', label: 'Bulanan' },
    { id: 'weekly', label: 'Mingguan' },
    { id: 'daily', label: 'Harian' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchProfile();
      fetchRankings(activeCategory, period);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchRankings(activeCategory, period);
    }
  }, [activeCategory, period]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/game/leaderboards/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard categories:', err);
    }
  };

  const fetchRankings = async (cat, prd) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/game/leaderboards/rankings?category=${cat}&period=${prd}&page=1&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setRankingsData(data);
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/game/leaderboards/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard profile:', err);
    }
  };

  const handleTogglePrivacy = async (key) => {
    if (!profileData) return;
    const current = profileData.privacy_settings || {};
    const updated = { ...current, [key]: !current[key] };
    sounds.playClick();
    try {
      setUpdatingPrivacy(true);
      const res = await fetch('/api/v1/game/leaderboards/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchProfile();
        fetchRankings(activeCategory, period);
        showNotification && showNotification('🔒 Pengaturan privasi papan peringkat diperbarui!');
      }
    } catch (err) {
      console.error('Privacy update error:', err);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  if (!isOpen) return null;

  const rankings = rankingsData?.rankings || [];
  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);
  const playerSummary = rankingsData?.player_summary;
  const currentCatObj = categories.find(c => c.id === activeCategory) || { name: 'Papan Peringkat', icon: '🏆', unit: 'Poin' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide flex items-center gap-2">
                Papan Peringkat Global & Anti-Cheat (V6)
                <span className="text-xs bg-amber-500/20 border border-amber-400 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  20 Kategori Kompetitif
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Peringkat pemain terverifikasi server tanpa manipulasi klien.
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-red-500/80 text-stone-300 hover:text-white border border-stone-700 transition"
          >
            ✕
          </button>
        </div>

        {/* CATEGORY & PERIOD SELECTOR BAR */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-semibold">Kategori:</span>
            <select
              value={activeCategory}
              onChange={(e) => { sounds.playClick(); setActiveCategory(e.target.value); }}
              className="bg-slate-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-stone-200">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-stone-800">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => { sounds.playClick(); setPeriod(p.id); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  period === p.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* RANKINGS CONTENT */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            
            {/* TOP 3 PODIUM */}
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 pt-2 pb-1">
                {/* 2nd Place */}
                <div className="flex flex-col items-center justify-end p-2.5 rounded-xl bg-slate-800/60 border border-slate-500/40 text-center">
                  <span className="text-2xl">🥈</span>
                  <span className="text-[10px] text-stone-400 uppercase font-bold mt-1">Juara 2</span>
                  <div className="font-bold text-xs text-slate-200 truncate w-full">{topThree[1].player_name}</div>
                  <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
                    {topThree[1].score.toLocaleString()} {currentCatObj.unit}
                  </div>
                </div>

                {/* 1st Place (Gold) */}
                <div className="flex flex-col items-center justify-end p-3 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-800/90 border-2 border-amber-400/80 text-center shadow-lg -translate-y-1">
                  <span className="text-3xl animate-bounce">👑</span>
                  <span className="text-[11px] text-amber-300 uppercase font-black">Juara 1</span>
                  <div className="font-extrabold text-sm text-amber-200 truncate w-full">{topThree[0].player_name}</div>
                  <div className="text-xs text-amber-400 font-mono font-black mt-0.5">
                    {topThree[0].score.toLocaleString()} {currentCatObj.unit}
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center justify-end p-2.5 rounded-xl bg-slate-800/60 border border-amber-800/40 text-center">
                  <span className="text-2xl">🥉</span>
                  <span className="text-[10px] text-amber-600 uppercase font-bold mt-1">Juara 3</span>
                  <div className="font-bold text-xs text-stone-200 truncate w-full">{topThree[2].player_name}</div>
                  <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
                    {topThree[2].score.toLocaleString()} {currentCatObj.unit}
                  </div>
                </div>
              </div>
            )}

            {/* RANKINGS TABLE */}
            <div className="flex-1 bg-slate-950/60 border border-stone-800 rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-stone-800 grid grid-cols-12 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-5">Pemain & Gelar</span>
                <span className="col-span-3">Guild / Komunitas</span>
                <span className="col-span-3 text-right">Skor Terverifikasi</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  Memuat data peringkat server...
                </div>
              ) : (
                <div className="divide-y divide-stone-800/60 overflow-y-auto max-h-64 sm:max-h-80">
                  {rankings.map((r) => {
                    const isPlayer = r.is_current_player;
                    const rankColors = {
                      1: 'text-amber-400 font-black',
                      2: 'text-slate-300 font-bold',
                      3: 'text-amber-600 font-bold'
                    };

                    return (
                      <div
                        key={r.player_name + r.rank}
                        className={`px-4 py-2.5 grid grid-cols-12 items-center text-xs transition ${
                          isPlayer
                            ? 'bg-amber-950/50 border-l-4 border-amber-400 font-semibold'
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <span className={`col-span-1 text-center font-mono ${rankColors[r.rank] || 'text-stone-400'}`}>
                          {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}
                        </span>

                        <div className="col-span-5 flex items-center gap-2 truncate pr-2">
                          <div className="truncate">
                            <span className={`font-bold ${isPlayer ? 'text-amber-300' : 'text-stone-100'}`}>
                              {r.player_name}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {r.title}
                            </span>
                          </div>
                          {r.prestige_rank > 0 && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400 font-bold px-1 py-0.2 rounded shrink-0">
                              P.{r.prestige_rank}
                            </span>
                          )}
                        </div>

                        <span className="col-span-3 text-stone-400 text-[11px] truncate">
                          {r.guild || '-'}
                        </span>

                        <div className="col-span-3 text-right">
                          <span className="font-mono font-bold text-amber-300">
                            {r.score.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            {currentCatObj.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PLAYER SUMMARY BANNER */}
            {playerSummary && (
              <div className="p-3 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎖️</span>
                  <div>
                    <div className="text-xs text-stone-300 font-bold">
                      Posisi Anda di Kategori Ini:
                    </div>
                    <div className="text-sm font-black text-amber-300 font-mono">
                      Peringkat #{playerSummary.player_rank} • {playerSummary.player_score.toLocaleString()} {playerSummary.unit}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold px-2 py-1 rounded-lg">
                  ✓ Anti-Cheat Valid
                </span>
              </div>
            )}

          </div>

          {/* PLAYER PROFILE & PRIVACY CARD (RIGHT PANEL) */}
          <div className="w-full md:w-72 bg-slate-950/90 border-t md:border-t-0 md:border-l border-stone-800 p-4 flex flex-col justify-between space-y-4">
            {profileData && (
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="text-center p-3 rounded-xl bg-slate-900 border border-stone-800">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-2xl shadow-inner mb-2">
                    🧑‍🌾
                  </div>
                  <h3 className="font-bold text-sm text-stone-100">{profileData.name}</h3>
                  <p className="text-[11px] text-amber-300 font-serif">{profileData.title}</p>
                  <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400 px-1.5 py-0.5 rounded font-bold">
                      Prestige {profileData.prestige_rank}
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400 px-1.5 py-0.5 rounded font-bold">
                      {profileData.prestige_points} PP
                    </span>
                  </div>
                </div>

                {/* Net Worth Breakdown */}
                <div className="p-3 rounded-xl bg-slate-900 border border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Valuasi Kekayaan Bersih:</span>
                  </div>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {typeof profileData.net_worth === 'number'
                      ? `${profileData.net_worth.toLocaleString()} Koin`
                      : profileData.net_worth}
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-between text-[11px] text-stone-400">
                    <span>Kas Tunai:</span>
                    <span className="font-mono text-amber-300 font-bold">{profileData.liquid_gold.toLocaleString()} G</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Total Level Keahlian:</span>
                    <span className="font-mono text-stone-200">{profileData.total_skill_levels}</span>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="p-3 rounded-xl bg-slate-900 border border-stone-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Privasi Papan Peringkat
                  </div>
                  
                  <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                    <span>Profil Publik</span>
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings?.public_profile}
                      onChange={() => handleTogglePrivacy('public_profile')}
                      disabled={updatingPrivacy}
                      className="rounded accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                    <span>Tampilkan Kekayaan</span>
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings?.show_net_worth}
                      onChange={() => handleTogglePrivacy('show_net_worth')}
                      disabled={updatingPrivacy}
                      className="rounded accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                    <span>Tampilkan Guild</span>
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings?.show_guild}
                      onChange={() => handleTogglePrivacy('show_guild')}
                      disabled={updatingPrivacy}
                      className="rounded accent-amber-500"
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={() => { sounds.playClick(); onClose(); }}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold border border-stone-600 transition"
            >
              Tutup Papan Peringkat
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
