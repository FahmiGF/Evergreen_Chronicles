import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function GrandEncyclopediaModal({
  isOpen,
  onClose,
  showNotification
}) {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesData, setEntriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [milestones, setMilestones] = useState([]);
  const [claiming, setClaiming] = useState(false);

  // Fetch categories on open
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchEntries(activeCategory, searchQuery, 1);
    }
  }, [isOpen]);

  // Fetch entries when category or search changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchEntries(activeCategory, searchQuery, 1);
    }
  }, [activeCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/game/encyclopedia/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setMilestones(data.milestone_tiers || []);
      }
    } catch (err) {
      console.error('Failed to load encyclopedia categories:', err);
    }
  };

  const fetchEntries = async (cat, search, p) => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (cat) q.append('category', cat);
      if (search) q.append('search', search);
      q.append('page', p.toString());
      q.append('limit', '8');

      const res = await fetch(`/api/v1/game/encyclopedia/entries?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntriesData(data);
      }
    } catch (err) {
      console.error('Failed to fetch encyclopedia entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMilestone = async (percent) => {
    sounds.playClick();
    try {
      setClaiming(true);
      const res = await fetch('/api/v1/game/encyclopedia/claim-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeCategory, percent })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🏆 ${data.message}`);
        fetchCategories();
        fetchEntries(activeCategory, searchQuery, page);
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Syarat belum terpenuhi'}`);
      }
    } catch (err) {
      console.error('Claim milestone error:', err);
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  const currentCatObj = categories.find(c => c.id === activeCategory) || { name: 'Semua Kategori', icon: '📖' };
  const items = entriesData?.items || [];
  const stats = entriesData?.stats || { total_entries: 0, discovered_entries: 0, completion_percentage: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-emerald-600/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b border-emerald-600/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📚</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300 font-serif tracking-wide flex items-center gap-2">
                Grand Encyclopedia & Jurnal Semesta (V6)
                <span className="text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                  38 Indeks Kategori
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Pencatatan penemuan flora, fauna, relik purba, teknologi, dan fenomena dunia Evergreen.
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

        {/* PROGRESS & MILESTONES BANNER */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-stone-200">
              Total Penemuan: <span className="text-emerald-400 font-mono font-bold">{stats.discovered_entries}</span> / {stats.total_entries} Entri
            </div>
            <div className="w-36 sm:w-48 bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.completion_percentage)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-teal-300">{stats.completion_percentage}%</span>
          </div>

          {/* Quick Milestone Claim Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-stone-400 font-serif mr-1">Hadiah Milestone:</span>
            {milestones.map((m) => (
              <button
                key={m.percent}
                disabled={claiming || stats.completion_percentage < m.percent}
                onClick={() => handleClaimMilestone(m.percent)}
                className={`text-[11px] px-2 py-1 rounded font-bold transition flex items-center gap-1 ${
                  stats.completion_percentage >= m.percent
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                title={`Klaim ${m.percent}%: +${m.gold} Gold, +${m.pp} PP, Gelar '${m.title}'`}
              >
                <span>{m.percent}%</span>
                <span>🎁</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY: SIDEBAR + CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* CATEGORIES SIDEBAR (38 CATEGORIES) */}
          <div className="w-56 sm:w-64 bg-slate-950/80 border-r border-stone-800 flex flex-col overflow-y-auto p-2 space-y-1">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
              Kategori Ensiklopedia
            </div>
            <button
              onClick={() => { sounds.playClick(); setActiveCategory('all'); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                activeCategory === 'all'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-stone-300 hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2"><span>🌐</span> Semua Kategori</span>
              <span className="text-[10px] font-mono text-stone-500">{stats.total_entries}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { sounds.playClick(); setActiveCategory(cat.id); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'text-stone-300 hover:bg-stone-800/60'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500">{cat.total_entries}</span>
              </button>
            ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-slate-900/50">
            
            {/* SEARCH & FILTER BAR */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari entri (nama, lokasi, deskripsi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 border border-stone-700 rounded-xl px-4 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-stone-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs text-stone-400 font-mono whitespace-nowrap">
                {currentCatObj.icon} {currentCatObj.name}
              </div>
            </div>

            {/* ENTRIES GRID */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-xs">
                Memuat data ensiklopedia...
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-500 text-xs space-y-2">
                <span className="text-3xl">🔍</span>
                <p>Tidak ada entri ensiklopedia yang cocok dengan pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto">
                {items.map((item) => {
                  const rarityColors = {
                    common: 'border-stone-600 bg-stone-800/50 text-stone-300',
                    uncommon: 'border-emerald-600 bg-emerald-950/30 text-emerald-300',
                    rare: 'border-blue-600 bg-blue-950/30 text-blue-300',
                    epic: 'border-purple-600 bg-purple-950/30 text-purple-300',
                    legendary: 'border-amber-500 bg-amber-950/30 text-amber-300'
                  };

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                        item.is_discovered
                          ? 'bg-slate-800/90 border-stone-700 hover:border-emerald-500/60 shadow'
                          : 'bg-slate-900/60 border-stone-800 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {item.is_discovered ? (categories.find(c => c.id === item.category)?.icon || '📦') : '❓'}
                            </span>
                            <div>
                              <div className="font-bold text-sm text-stone-100 flex items-center gap-2">
                                {item.name}
                                {item.is_discovered && (
                                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${rarityColors[item.rarity] || rarityColors.common}`}>
                                    {item.rarity}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                📍 {item.location} • 📅 {item.season}
                              </div>
                            </div>
                          </div>

                          {item.is_discovered ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold px-1.5 py-0.5 rounded">
                              ✓ Ditemukan ({item.discovery_count}x)
                            </span>
                          ) : (
                            <span className="text-[10px] bg-stone-800 text-stone-500 border border-stone-700 px-1.5 py-0.5 rounded">
                              Terkunci
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      {/* Hint box */}
                      <div className="mt-2.5 pt-2 border-t border-stone-800 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                        <span>💡</span>
                        <span className="italic truncate">{item.hints}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {entriesData && entriesData.total_pages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-800 text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => { sounds.playClick(); setPage(p => Math.max(1, p - 1)); fetchEntries(activeCategory, searchQuery, page - 1); }}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 rounded font-semibold text-stone-300 transition"
                >
                  ← Sebelumnya
                </button>
                <span className="text-stone-400 font-mono">
                  Halaman {page} dari {entriesData.total_pages}
                </span>
                <button
                  disabled={page >= entriesData.total_pages}
                  onClick={() => { sounds.playClick(); setPage(p => Math.min(entriesData.total_pages, p + 1)); fetchEntries(activeCategory, searchQuery, page + 1); }}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 rounded font-semibold text-stone-300 transition"
                >
                  Berikutnya →
                </button>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Tekan tombol <strong>[J]</strong> untuk membuka / menutup jurnal ensiklopedia kapan saja.</span>
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
