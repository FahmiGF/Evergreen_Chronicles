import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function SkillsProgressionModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'trees' | 'prestige'
  const [selectedSkillId, setSelectedSkillId] = useState('farming');
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/game/skills');
      if (res.ok) {
        const data = await res.json();
        setSkillsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch player skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrainSkill = async (skillId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/skills/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId, amount: 250 })
      });
      if (res.ok) {
        const result = await res.json();
        sounds.playSuccess();
        showNotification && showNotification(
          result.level_up
            ? `🎉 LEVEL UP! ${skillId.toUpperCase()} naik ke Level ${result.level} (${result.milestone})!`
            : `+${result.xp_added} XP diberikan untuk keahlian ${skillId}!`
        );
        fetchSkills();
      }
    } catch (err) {
      console.error('Train skill error:', err);
    }
  };

  const handleUnlockPerk = async (skillId, perkId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/skills/perk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId, perk_id: perkId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`⭐ Berhasil membuka Perk: ${data.perk.name}!`);
        fetchSkills();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal membuka perk'}`);
      }
    } catch (err) {
      console.error('Unlock perk error:', err);
    }
  };

  const handleActivatePrestige = async (skillId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/skills/prestige', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`👑 ${data.message}`);
        fetchSkills();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal aktivasi prestige'}`);
      }
    } catch (err) {
      console.error('Prestige error:', err);
    }
  };

  const handlePurchasePrestigeUpgrade = async (branchId, upgradeId) => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/prestige/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: branchId, upgrade_id: upgradeId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`⭐ ${data.message}`);
        fetchSkills();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Gagal upgrade prestige'}`);
      }
    } catch (err) {
      console.error('Prestige upgrade error:', err);
    }
  };

  const handleResetPrestige = async () => {
    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/prestige/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🔄 ${data.message}`);
        fetchSkills();
      }
    } catch (err) {
      console.error('Prestige reset error:', err);
    }
  };

  const skillsObj = skillsData?.skills || {};
  const skillList = skillsData?.catalog || [];
  const activeTreeBranches = skillsData?.trees?.[selectedSkillId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-600/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-600/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⭐</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide flex items-center gap-2">
                Pusat Progresi & Keahlian Karakter
                <span className="text-xs bg-amber-500/20 border border-amber-400 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  Level Global: {skillsData?.global_level || 1}
                </span>
              </h2>
              <p className="text-xs text-amber-200/70">
                12 Cabang Keahlian Hidup, Pohon Perk Cabang Khusus, dan Gelar Kehormatan Prestige
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
        <div className="flex border-b border-stone-800 bg-slate-950/50 px-6">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('skills'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'skills'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>📜</span>
            <span>12 Keahlian (Skills)</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('trees'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'trees'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🌳</span>
            <span>Pohon Perk (Skill Tree)</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('prestige'); }}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'prestige'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>👑</span>
            <span>Prestige & Gelar</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-amber-400 font-mono animate-pulse">
              Memuat data keahlian dari cloud engine...
            </div>
          )}

          {/* TAB 1: 12 SKILLS LIST */}
          {!loading && activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillList.map((cat) => {
                const sk = skillsObj[cat.id] || { level: 1, xp: 0, next_level_xp: 100, milestone: 'Pemula', perk_points: 0 };
                const pct = Math.min(100, Math.round((sk.xp / Math.max(1, sk.next_level_xp)) * 100));

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-amber-900/40 hover:border-amber-600/50 rounded-xl transition shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 bg-slate-900/90 rounded-lg border border-stone-700">{cat.icon}</span>
                          <div>
                            <div className="font-bold text-stone-100 flex items-center gap-2">
                              {cat.name}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                                Lv. {sk.level}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-300/80 font-medium">
                              Tingkat: <span className="font-bold">{sk.milestone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-400 font-mono font-bold">
                            {sk.perk_points} Poin Perk
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-400 mb-2 leading-relaxed">
                        {cat.desc}
                      </p>

                      {/* XP Progress Bar */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[10px] font-mono text-stone-400">
                          <span>XP: {sk.xp.toLocaleString()}</span>
                          <span>Target: {sk.next_level_xp.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-stone-700">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleTrainSkill(cat.id)}
                        className="flex-1 py-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-100 rounded-lg text-xs font-bold border border-amber-500/40 transition shadow"
                      >
                        ⚡ Latih Aktivitas (+250 XP)
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSkillId(cat.id);
                          setActiveTab('trees');
                        }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-stone-200 rounded-lg text-xs font-bold border border-stone-600 transition"
                      >
                        🌳 Pohon Perk
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SKILL TREES */}
          {!loading && activeTab === 'trees' && (
            <div className="space-y-4">
              {/* Skill Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800">
                {['farming', 'mining', 'fishing', 'foraging'].map((sid) => {
                  const sMeta = skillList.find((s) => s.id === sid);
                  const isSel = selectedSkillId === sid;
                  return (
                    <button
                      key={sid}
                      onClick={() => { sounds.playClick(); setSelectedSkillId(sid); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isSel
                          ? 'bg-amber-600 text-white shadow ring-1 ring-amber-400'
                          : 'bg-slate-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>{sMeta?.icon || '⭐'}</span>
                      <span>{sMeta?.name || sid}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Skill Info & Points */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-stone-800">
                <div>
                  <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
                    <span>Cabang Spesialisasi: {skillsObj[selectedSkillId]?.name || selectedSkillId}</span>
                    <span className="text-xs bg-stone-800 px-2 py-0.5 rounded text-stone-300 font-mono">
                      Level {skillsObj[selectedSkillId]?.level || 1}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">Pilih cabang perk yang sesuai dengan gaya permainan Anda.</p>
                </div>
                <div className="text-right bg-amber-950/60 border border-amber-600/50 px-3 py-1 rounded-lg">
                  <span className="text-[10px] text-amber-400 block font-bold">POIN PERK TERSEDIA</span>
                  <span className="text-lg font-black text-amber-200 font-mono">
                    {skillsObj[selectedSkillId]?.perk_points || 0}
                  </span>
                </div>
              </div>

              {/* Branches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeTreeBranches.map((branch) => (
                  <div
                    key={branch.branch_id}
                    className="bg-slate-800/80 border border-stone-700 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-stone-700">
                        <span className="text-xl">{branch.icon}</span>
                        <h4 className="font-bold text-xs text-amber-200">{branch.branch_name}</h4>
                      </div>

                      <div className="space-y-2">
                        {branch.perks.map((perk) => {
                          const isUnlocked = (skillsObj[selectedSkillId]?.unlocked_perks || []).includes(perk.id);
                          const curLvl = skillsObj[selectedSkillId]?.level || 1;
                          const canUnlock = !isUnlocked && curLvl >= perk.level_req && (skillsObj[selectedSkillId]?.perk_points || 0) >= perk.cost;

                          return (
                            <div
                              key={perk.id}
                              className={`p-2 rounded-lg border text-xs transition ${
                                isUnlocked
                                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                                  : 'bg-slate-900/60 border-stone-800 text-stone-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1">
                                  {isUnlocked ? '✓' : '🔒'} {perk.name}
                                </span>
                                <span className="text-[10px] font-mono opacity-80">
                                  {perk.cost} Poin (Lv. {perk.level_req})
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-400 leading-tight mb-2">
                                {perk.desc}
                              </p>

                              {isUnlocked ? (
                                <span className="text-[10px] font-bold text-emerald-400 block text-right">
                                  Sudah Aktif
                                </span>
                              ) : (
                                <button
                                  disabled={!canUnlock}
                                  onClick={() => handleUnlockPerk(selectedSkillId, perk.id)}
                                  className={`w-full py-1 rounded text-[11px] font-bold transition ${
                                    canUnlock
                                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                  }`}
                                >
                                  {curLvl < perk.level_req
                                    ? `Butuh Lv. ${perk.level_req}`
                                    : (skillsObj[selectedSkillId]?.perk_points || 0) < perk.cost
                                    ? 'Poin Tidak Cukup'
                                    : 'Buka Perk'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRESTIGE */}
          {!loading && activeTab === 'prestige' && (
            <div className="space-y-4">
              {/* Prestige Stats Banner */}
              <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-amber-950/90 border border-purple-500/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-4xl animate-bounce">👑</span>
                  <div>
                    <h3 className="font-serif font-black text-lg text-purple-200">
                      Sistem Kehormatan Prestige & Upgrade Permanen (V6)
                    </h3>
                    <p className="text-xs text-stone-300">
                      Tingkat Prestige: <strong className="text-amber-400 font-mono font-black">Rank {skillsData?.prestige_rank || 1}</strong> • Saldo PP: <strong className="text-amber-300 font-mono font-black text-sm">{skillsData?.prestige_points || 0} PP</strong> (Terpakai: {skillsData?.spent_prestige_points || 0} PP)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetPrestige}
                  disabled={(skillsData?.spent_prestige_points || 0) <= 0}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 rounded-lg text-xs font-bold border border-purple-400/50 transition flex items-center gap-1.5 shadow"
                  title="Refund seluruh PP yang telah dibelanjakan tanpa menghapus inventaris, tanaman, atau keahlian Anda."
                >
                  <span>🔄</span>
                  <span>Reset Saldo PP (Aman)</span>
                </button>
              </div>

              {/* 6 PERMANENT UPGRADE BRANCHES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Pohon Cabang Upgrade Permanen (6 Cabang)
                  </h4>
                  <span className="text-[11px] text-stone-400">Efek pasif berlaku selamanya di seluruh karakter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(skillsData?.prestige_branches || []).map((branch) => {
                    const activeUpgs = skillsData?.prestige_upgrades || [];

                    return (
                      <div key={branch.id} className="p-3 bg-slate-800/80 border border-stone-700 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 border-b border-stone-700/60 pb-1.5">
                          <span className="text-xl">{branch.icon}</span>
                          <span className="font-bold text-xs text-stone-100">{branch.name}</span>
                        </div>

                        <div className="space-y-2">
                          {branch.upgrades.map((u) => {
                            const isPurchased = activeUpgs.includes(u.id);
                            const canAfford = (skillsData?.prestige_points || 0) >= u.cost;

                            return (
                              <div
                                key={u.id}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition ${
                                  isPurchased
                                    ? 'bg-purple-950/40 border-purple-500/60'
                                    : 'bg-slate-900/60 border-stone-800'
                                }`}
                              >
                                <div className="truncate flex-1">
                                  <div className="font-bold text-stone-200 truncate flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isPurchased && (
                                      <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400 px-1 py-0.2 rounded font-bold">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-stone-400 truncate">{u.desc}</div>
                                </div>

                                <div>
                                  {isPurchased ? (
                                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                                      ✓ Aktif
                                    </span>
                                  ) : (
                                    <button
                                      disabled={!canAfford}
                                      onClick={() => handlePurchasePrestigeUpgrade(branch.id, u.id)}
                                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                                        canAfford
                                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                      }`}
                                    >
                                      <span>Beli</span>
                                      <span className="font-mono">({u.cost} PP)</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SKILL SYNERGIES */}
              {skillsData?.synergies && skillsData.synergies.length > 0 && (
                <div className="p-3.5 bg-slate-950/80 border border-stone-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span> Sinergi Lintas Keahlian (Skill Synergies)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {skillsData.synergies.map((syn) => (
                      <div key={syn.id} className="p-2 bg-slate-900 rounded-lg border border-stone-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-200 block">{syn.name}</span>
                          <span className="text-[10px] text-stone-400">{syn.skills?.join(' + ')}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400 px-1.5 py-0.5 rounded">
                          +{Math.round((syn.bonus_mult - 1) * 100)}% Efek
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILL MASTERY PRESTIGE ELEVATION (LV 50+) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Aktivasi Mastery Tiap Keahlian (Syarat: Level 50+)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {skillList.map((cat) => {
                    const sk = skillsObj[cat.id] || { level: 1, prestige_level: 0 };
                    const eligible = sk.level >= 50;

                    return (
                      <div
                        key={cat.id}
                        className="p-2.5 bg-slate-800/80 border border-stone-700 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <div className="font-bold text-xs text-stone-100 flex items-center gap-1.5">
                              {cat.name}
                              {sk.prestige_level > 0 && (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400 font-bold px-1 rounded">
                                  P.{sk.prestige_level}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              Level {sk.level}/50
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={!eligible}
                          onClick={() => handleActivatePrestige(cat.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                            eligible
                              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow ring-1 ring-purple-400'
                              : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                          }`}
                        >
                          {eligible ? '👑 Prestige (+10 PP)' : 'Butuh Lv. 50'}
                        </button>
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
          <span>Tekan tombol <strong>[K]</strong> untuk membuka / menutup menu keahlian kapan saja.</span>
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
