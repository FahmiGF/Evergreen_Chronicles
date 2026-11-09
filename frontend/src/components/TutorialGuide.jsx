import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function TutorialGuide({
  gameState,
  setGameState,
  showNotification
}) {
  const [tutorialQuests, setTutorialQuests] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetch('/api/v1/game/tutorial/1')
      .then((r) => r.json())
      .then((data) => {
        setTutorialQuests(data);
        const uncompletedIdx = data.findIndex((q) => !q.completed);
        setCurrentStepIndex(uncompletedIdx !== -1 ? uncompletedIdx : data.length - 1);
      })
      .catch((e) => console.error(e));
  }, []);

  const activeQuest = tutorialQuests[currentStepIndex];
  if (!activeQuest) return null;

  const handleClaimReward = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/v1/game/tutorial/claim/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: activeQuest.step })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Gagal klaim hadiah');

      sounds.playLevelUp();
      showNotification(data.message, 'success');

      // Update local state
      const updated = tutorialQuests.map((q) =>
        q.step === activeQuest.step ? { ...q, completed: true } : q
      );
      setTutorialQuests(updated);

      if (currentStepIndex < tutorialQuests.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }

      // Refresh player state
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          gold: data.current_gold
        }
      }));
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed top-14 right-4 z-30 select-none pointer-events-auto">
      {isMinimized ? (
        <button
          onClick={() => { sounds.playClick(); setIsMinimized(false); }}
          className="bg-stone-900/90 hover:bg-stone-800 text-amber-200 border-2 border-amber-600/80 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl flex items-center space-x-2 transition animate-pulse"
        >
          <span>📜</span>
          <span>Panduan Pemula ({activeQuest.step}/7)</span>
        </button>
      ) : (
        <div className="bg-stone-900/95 backdrop-blur-md border-2 border-amber-600/90 rounded-2xl p-3.5 shadow-2xl w-80 text-xs animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
            <div className="flex items-center space-x-1.5">
              <span className="text-base">📜</span>
              <span className="font-bold font-medieval text-amber-300 text-xs">
                Panduan Pemula ({activeQuest.step}/{tutorialQuests.length})
              </span>
            </div>
            <button
              onClick={() => { sounds.playClick(); setIsMinimized(true); }}
              className="text-stone-400 hover:text-white px-1 font-bold text-sm"
              title="Kecilkan Panduan"
            >
              —
            </button>
          </div>

          {/* Current Quest Objective */}
          <div>
            <h4 className="font-bold text-stone-100 text-xs mb-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{activeQuest.title}</span>
            </h4>
            <p className="text-stone-300 text-[11px] leading-relaxed mb-3">
              {activeQuest.description}
            </p>

            {/* Rewards info */}
            <div className="bg-stone-950/70 p-2 rounded-lg border border-stone-800 flex items-center justify-between text-[11px] mb-3">
              <span className="text-stone-400 font-semibold">Hadiah:</span>
              <div className="flex items-center space-x-2 font-mono font-bold">
                <span className="text-amber-300">🪙 +{activeQuest.reward_gold} G</span>
                {activeQuest.reward_items?.map((itm, i) => (
                  <span key={i} className="text-emerald-300">🌱 +{itm.count} Benih</span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                disabled={claiming}
                onClick={handleClaimReward}
                className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center space-x-1"
              >
                <span>✨</span>
                <span>{claiming ? 'Mengklaim...' : 'Selesai & Klaim'}</span>
              </button>

              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStepIndex((p) => p - 1)}
                  className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold border border-stone-700"
                  title="Langkah Sebelumnya"
                >
                  ◀
                </button>
              )}
              {currentStepIndex < tutorialQuests.length - 1 && (
                <button
                  onClick={() => setCurrentStepIndex((p) => p + 1)}
                  className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold border border-stone-700"
                  title="Langkah Berikutnya"
                >
                  ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
