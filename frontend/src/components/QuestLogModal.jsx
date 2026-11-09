import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function QuestLogModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification,
  onOpenStoryline
}) {
  const [quests, setQuests] = useState([]);
  const [filterNpc, setFilterNpc] = useState('all');
  const [loading, setLoading] = useState(true);
  const [turningInId, setTurningInId] = useState(null);

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/v1/game/npc-quests/1');
      if (res.ok) {
        const data = await res.json();
        setQuests(data);
      }
    } catch (err) {
      console.error('Error fetching quests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTurnInQuest = async (quest) => {
    if (turningInId) return;
    setTurningInId(quest.id);
    sounds.playClick();

    try {
      const res = await fetch('/api/v1/game/npc-quests/turn-in/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quest_id: quest.id })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sounds.playLevelUp();
        showNotification(
          data.message || `Quest '${quest.title}' Selesai! (+${quest.reward_gold}G) 🎉`,
          'success'
        );

        // Refresh save state & quests list
        const saveRes = await fetch('/api/v1/game/save/1');
        if (saveRes.ok) {
          const newSave = await saveRes.json();
          setGameState(newSave);
        }
        await fetchQuests();
      } else {
        showNotification(data.detail || 'Gagal menyerahkan quest', 'error');
      }
    } catch (err) {
      console.error('Turn in error', err);
      showNotification('Terjadi kesalahan saat menyerahkan quest', 'error');
    } finally {
      setTurningInId(null);
    }
  };

  const filteredQuests = quests.filter((q) => {
    if (filterNpc === 'all') return true;
    if (filterNpc === 'completed') return q.is_completed;
    return q.npc_id === filterNpc && !q.is_completed;
  });

  const activeCount = quests.filter((q) => !q.is_completed).length;
  const completedCount = quests.filter((q) => q.is_completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-4xl shadow-2xl p-5 sm:p-7 relative max-h-[90vh] flex flex-col text-stone-100">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600 transition"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border-2 border-amber-600 flex items-center justify-center text-2xl shadow-lg">
              📜
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-medieval text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                Papan Tugas & Permintaan Warga
              </h2>
              <p className="text-stone-400 text-xs">
                Selesaikan tugas penduduk Greenvale untuk mendapatkan Emas, Kristal Aether, dan Tingkat Kasih (Maksimal Lv. 10)!
              </p>
            </div>
          </div>

          {onOpenStoryline && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
                onOpenStoryline();
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-800 rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow"
            >
              <span>🎬 Alur Cerita</span>
            </button>
          )}
        </div>

        {/* NPC FILTER TABS */}
        <div className="flex flex-wrap gap-1.5 mb-3 p-1.5 bg-stone-950/70 rounded-xl border border-stone-800">
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterNpc === 'all' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            Semua ({quests.length})
          </button>
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('npc_elara'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              filterNpc === 'npc_elara' ? 'bg-emerald-700 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>🌿 Elara</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('npc_rowan'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              filterNpc === 'npc_rowan' ? 'bg-amber-800 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>🔨 Rowan</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('npc_nessa'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              filterNpc === 'npc_nessa' ? 'bg-cyan-800 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>⚡ Nessa</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('npc_mira'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              filterNpc === 'npc_mira' ? 'bg-rose-800 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>🍎 Mira</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); setFilterNpc('completed'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              filterNpc === 'completed' ? 'bg-stone-700 text-white shadow' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <span>✓ Selesai ({completedCount})</span>
          </button>
        </div>

        {/* QUEST CARDS LIST */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-stone-400 text-sm">
            <span>Memuat daftar tugas...</span>
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-stone-500 text-xs">
            <span className="text-3xl mb-2">🎉</span>
            <p>Tidak ada tugas pada kategori ini.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2">
            {filteredQuests.map((quest) => {
              const isTurnInReady = quest.can_turn_in;
              const isSpecialMiraFriend = quest.id === 'quest_mira_friendship';

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    quest.is_completed
                      ? 'bg-stone-950/40 border-stone-800 opacity-60'
                      : isSpecialMiraFriend
                      ? 'bg-gradient-to-r from-rose-950/50 via-stone-950/80 to-amber-950/50 border-rose-500/80 shadow-xl'
                      : isTurnInReady
                      ? 'bg-stone-950/80 border-emerald-600/90 shadow-xl'
                      : 'bg-stone-950/70 border-stone-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {quest.npc_id === 'npc_elara' ? '🌿' : quest.npc_id === 'npc_rowan' ? '🔨' : quest.npc_id === 'npc_nessa' ? '⚡' : '🍎'}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 font-mono">
                        {quest.npc_name}
                      </span>
                      {isSpecialMiraFriend && (
                        <span className="bg-rose-900/90 text-rose-200 border border-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          🌟 Quest Spesial Persahabatan
                        </span>
                      )}
                      {quest.is_completed && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          ✓ SELESAI
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-stone-100 mt-1">
                      {quest.title}
                    </h4>
                    <p className="text-stone-400 text-xs mt-0.5 leading-relaxed">
                      {quest.description}
                    </p>

                    {/* PROGRESS BAR & REQUIREMENTS */}
                    {!quest.is_completed && (
                      <div className="mt-2.5 flex items-center space-x-3">
                        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isTurnInReady ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (quest.current_progress / quest.target) * 100)}%`
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono font-bold ${
                            isTurnInReady ? 'text-emerald-400' : 'text-stone-300'
                          }`}
                        >
                          {quest.current_progress} / {quest.target}{' '}
                          {quest.target_item_name ? quest.target_item_name : 'Tercapai'}
                        </span>
                      </div>
                    )}

                    {/* REWARDS TAGS */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                        +{quest.reward_gold} G
                      </span>
                      {quest.reward_aether > 0 && (
                        <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                          +{quest.reward_aether} Kristal
                        </span>
                      )}
                      <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
                        +{quest.reward_affection / 100} Tingkat Kasih ❤️
                      </span>
                      {quest.reward_item && (
                        <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                          🎖️ Medali Harmoni
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TURN IN BUTTON */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {!quest.is_completed && (
                      <button
                        onClick={() => handleTurnInQuest(quest)}
                        disabled={!isTurnInReady || turningInId === quest.id}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center space-x-1.5 ${
                          isTurnInReady
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black cursor-pointer transform hover:scale-105'
                            : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        }`}
                      >
                        {turningInId === quest.id ? (
                          <span>Menyerahkan...</span>
                        ) : isTurnInReady ? (
                          <span>✨ Serahkan Barang!</span>
                        ) : (
                          <span>Kumpulkan Bahan</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-[11px] text-stone-500">
          <span>
            Aktif: <strong className="text-amber-400">{activeCount}</strong> • Selesai: <strong className="text-emerald-400">{completedCount}</strong>
          </span>
          <span className="italic">
            Selesaikan <strong className="text-rose-400">"Having Friends with Us!"</strong> untuk meningkatkan hubungan seluruh warga desa!
          </span>
        </div>
      </div>
    </div>
  );
}
