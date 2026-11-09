import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';
import { voiceAi } from '../game/VoiceAiEngine';
import NpcPortrait from '../game/NpcPortraits';

export default function DialogueBox({
  isOpen,
  onClose,
  npc,
  gameState,
  setGameState,
  itemCatalog,
  showNotification
}) {
  const [selectedGiftIdx, setSelectedGiftIdx] = useState(null);
  const [currentDialogueText, setCurrentDialogueText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [activeTopic, setActiveTopic] = useState('greeting');
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [dialogueTab, setDialogueTab] = useState('talk'); // 'talk' or 'quests'
  const [npcQuests, setNpcQuests] = useState([]);
  const [turningInId, setTurningInId] = useState(null);

  const inventory = gameState?.player?.inventory || [];
  const currentNpc = (gameState?.npcs || []).find((n) => n.id === npc?.id) || npc;
  const affectionLevel = Math.min(
    10,
    Math.max(
      0,
      currentNpc?.affection_level !== undefined
        ? currentNpc.affection_level
        : Math.floor((currentNpc?.friendship_points || 0) / 100)
    )
  );

  const voiceProfile = currentNpc ? voiceAi.getNpcVoiceProfile(currentNpc.id) : null;

  const getAffectionTitle = (lvl) => {
    switch (lvl) {
      case 0: return 'Orang Asing';
      case 1: return 'Kenalan Baru';
      case 2: return 'Tetangga Ramah';
      case 3: return 'Teman Baik';
      case 4: return 'Sahabat Terpercaya';
      case 5: return 'Jiwa Sepemikiran';
      case 6: return 'Orang Kepercayaan';
      case 7: return 'Rekan Sejati';
      case 8: return 'Mitra Kasih';
      case 9: return 'Ikatan Abadi';
      case 10: return 'Soulmate of Aetherwyn';
      default: return 'Warga Desa';
    }
  };

  // Fetch quests for this NPC
  const fetchNpcQuests = async () => {
    if (!currentNpc) return;
    try {
      const res = await fetch('/api/v1/game/npc-quests/1');
      if (res.ok) {
        const data = await res.json();
        setNpcQuests(data.filter((q) => q.npc_id === currentNpc.id));
      }
    } catch (e) {
      console.error('Failed to load NPC quests', e);
    }
  };

  // Speak greeting on initial modal open
  useEffect(() => {
    if (isOpen && currentNpc) {
      const initialText = currentNpc.dialogue || `Selamat datang di desa Aetherwyn! Aku ${currentNpc.name}, senang bertemu denganmu.`;
      setCurrentDialogueText(initialText);
      setActiveTopic('greeting');
      setDialogueTab('talk');
      fetchNpcQuests();

      const timer = setTimeout(() => {
        voiceAi.speak(
          initialText,
          currentNpc.id,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }, 200);

      return () => {
        clearTimeout(timer);
        voiceAi.stop();
        setIsSpeaking(false);
      };
    }
  }, [isOpen, currentNpc?.id]);

  if (!isOpen || !currentNpc || !gameState) return null;

  const handleSelectTopic = async (topicKey) => {
    if (loadingTopic) return;
    sounds.playClick();
    setActiveTopic(topicKey);
    setLoadingTopic(true);

    try {
      let textToSpeak = 'Terima kasih telah bertanya!';
      if (topicKey === 'routine' || topicKey === 'gossip') {
        const res = await fetch(`/api/v1/game/npcs/${currentNpc.id}/interact/1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interaction_type: topicKey })
        });
        if (res.ok) {
          const data = await res.json();
          textToSpeak = data.speech || textToSpeak;
        }
      } else {
        const res = await fetch('/api/v1/game/npc-dialogue-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ npc_id: currentNpc.id, topic: topicKey })
        });
        const data = await res.json();
        textToSpeak = data.spoken_text || textToSpeak;
      }

      setCurrentDialogueText(textToSpeak);

      voiceAi.speak(
        textToSpeak,
        currentNpc.id,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.error('Error fetching voice dialogue', err);
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleReplayVoice = () => {
    sounds.playClick();
    if (!currentDialogueText) return;
    voiceAi.speak(
      currentDialogueText,
      currentNpc.id,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleVoiceMute = () => {
    const muted = voiceAi.toggleMute();
    setIsVoiceMuted(muted);
    if (muted) {
      setIsSpeaking(false);
    }
  };

  const handleGiveGift = async () => {
    if (selectedGiftIdx === null) return;
    const giftSlot = inventory[selectedGiftIdx];
    if (!giftSlot) return;

    sounds.playClick();
    try {
      const res = await fetch('/api/v1/game/npc/gift/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npc_id: currentNpc.id, item_id: giftSlot.item_id })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sounds.playLevelUp();
        showNotification(data.message, 'success');

        // Reload save state
        const saveRes = await fetch('/api/v1/game/save/1');
        if (saveRes.ok) {
          const newSave = await saveRes.json();
          setGameState(newSave);
        }

        const thankMsg = data.is_favorite
          ? `Wah, ini adalah hadiah favorit yang selalu kudambakan! Terima kasih banyak sahabatku!`
          : `Terima kasih atas pemberian berharga ini. Aku akan menjaganya dengan baik.`;
        setCurrentDialogueText(thankMsg);
        voiceAi.speak(thankMsg, currentNpc.id, () => setIsSpeaking(true), () => setIsSpeaking(false));
      } else {
        showNotification(data.detail || 'Gagal memberikan hadiah', 'error');
      }
    } catch (err) {
      console.error('Gift error', err);
    } finally {
      setSelectedGiftIdx(null);
    }
  };

  const handleTurnInQuestDirect = async (quest) => {
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
          data.message || `Quest '${quest.title}' Selesai! (+${quest.reward_gold}G)`,
          'success'
        );

        const thankDialogue = `Luar biasa! Terima kasih telah membawakan permintaanku ini. Kepercayaan dan persahabatan kita semakin erat!`;
        setCurrentDialogueText(thankDialogue);
        voiceAi.speak(thankDialogue, currentNpc.id, () => setIsSpeaking(true), () => setIsSpeaking(false));

        // Refresh save state and quest list
        const saveRes = await fetch('/api/v1/game/save/1');
        if (saveRes.ok) {
          const newSave = await saveRes.json();
          setGameState(newSave);
        }
        await fetchNpcQuests();
      } else {
        showNotification(data.detail || 'Gagal menyelesaikan quest', 'error');
      }
    } catch (err) {
      console.error('Quest turn in error', err);
    } finally {
      setTurningInId(null);
    }
  };

  const topics = [
    { key: 'work', label: '🛠️ Sedang sibuk apa hari ini?' },
    { key: 'routine', label: '⏰ Jadwal & kegiatan jam ini' },
    { key: 'gossip', label: '📰 Kabar pasar & kemakmuran kota' },
    { key: 'advice', label: '💡 Minta tips petualangan & bertani' },
    { key: 'aether_lore', label: '🔮 Rahasia Kristal Aether' },
    { key: 'era_opinion', label: '🏛️ Pendapat kemajuan era peradaban' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 select-none pb-6 sm:pb-8 animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-3xl shadow-2xl p-5 sm:p-6 relative flex flex-col md:flex-row gap-5 max-h-[90vh] overflow-y-auto">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            voiceAi.stop();
            sounds.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600 z-10 transition"
        >
          ✕
        </button>

        {/* LEFT: NPC Profile, 10 Hearts & Voice Visualizer */}
        <div className="flex md:flex-col items-center md:justify-center p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl min-w-[170px] shadow-inner">
          <div className="relative mb-2">
            <NpcPortrait npcId={currentNpc.id} isSpeaking={isSpeaking} className="w-24 h-24 sm:w-28 sm:h-28" />
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow">
                Berbicara 🎙️
              </span>
            )}
          </div>

          <div className="text-center w-full">
            <h3 className="font-bold text-amber-200 text-base font-medieval">
              {currentNpc.name}
            </h3>
            <span className="text-[11px] text-stone-400 block">
              {currentNpc.title}
            </span>

            {/* Affection Level Title */}
            <span className="text-[10px] text-rose-400 font-bold block my-1">
              {getAffectionTitle(affectionLevel)} (Lv.{affectionLevel}/10)
            </span>

            {/* 10-Heart Gauge */}
            <div className="grid grid-cols-5 gap-0.5 text-[11px] text-rose-500 my-1 justify-center max-w-[90px] mx-auto">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`transition-transform ${
                    i < affectionLevel ? 'scale-110 drop-shadow-[0_0_3px_rgba(244,63,94,0.7)]' : 'opacity-25'
                  }`}
                >
                  {i < affectionLevel ? '❤️' : '🤍'}
                </span>
              ))}
            </div>

            {/* Voice AI Personality Tone Tag */}
            <div className="mt-2 bg-stone-900 border border-cyan-800/60 rounded-lg p-1.5 text-[10px] text-cyan-300 font-mono leading-tight">
              <span>🎙️ Suara AI:</span>
              <div className="text-stone-300 font-sans mt-0.5 font-semibold">
                {voiceProfile?.dialogueTone || 'Alami'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: TABS, DIALOGUE, TOPICS & QUESTS */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* TAB SELECTOR: TALK vs QUESTS */}
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex space-x-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800 text-xs">
                <button
                  onClick={() => { sounds.playClick(); setDialogueTab('talk'); }}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    dialogueTab === 'talk'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span>💬 Percakapan</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setDialogueTab('quests');
                    fetchNpcQuests();
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    dialogueTab === 'quests'
                      ? 'bg-rose-700 text-white shadow'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span>📜 Tugas ({npcQuests.filter(q => !q.is_completed).length})</span>
                </button>
              </div>

              {/* Voice Replay Controls */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleReplayVoice}
                  title="Putar Ulang Suara AI"
                  className="bg-stone-800 hover:bg-stone-700 text-cyan-300 border border-stone-700 px-2 py-1 rounded text-[11px] font-semibold transition flex items-center space-x-1"
                >
                  <span>🔁 Ulangi</span>
                </button>
                <button
                  onClick={handleToggleVoiceMute}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 px-2 py-1 rounded text-[11px] font-semibold transition"
                >
                  {isVoiceMuted ? '🔇' : '🔊'}
                </button>
              </div>
            </div>

            {/* MAIN SPOKEN DIALOGUE BOX */}
            <div className="bg-stone-950/80 border-2 border-amber-900/60 rounded-xl p-3.5 text-stone-100 text-xs sm:text-sm leading-relaxed min-h-[75px] shadow-inner flex flex-col justify-between relative overflow-hidden">
              <div className="font-serif italic text-amber-100/95">
                "{currentDialogueText}"
              </div>

              {/* Animated Waveform bar */}
              {isSpeaking && (
                <div className="mt-2.5 flex items-center space-x-1 h-2 opacity-80">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full animate-pulse"
                      style={{
                        height: `${20 + (Math.sin(i * 0.7) * 40 + 40)}%`,
                        animationDelay: `${(i % 5) * 80}ms`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: TALK & TOPICS */}
            {dialogueTab === 'talk' ? (
              <>
                <div className="my-2.5">
                  <span className="text-[11px] font-bold text-stone-400 block mb-1">
                    💬 Pilih Topik untuk Bertanya:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {topics.map((t) => (
                      <button
                        key={t.key}
                        disabled={loadingTopic}
                        onClick={() => handleSelectTopic(t.key)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center justify-between ${
                          activeTopic === t.key
                            ? 'bg-amber-900/60 border-amber-500 text-amber-200 shadow'
                            : 'bg-stone-800/80 hover:bg-stone-700 border-stone-700 text-stone-300'
                        }`}
                      >
                        <span>{t.label}</span>
                        <span className="text-[10px] text-cyan-400">🎙️</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gift giving section */}
                <div className="border-t border-stone-800 pt-2">
                  <label className="text-[11px] text-stone-400 block mb-1 font-semibold">
                    🎁 Berikan Hadiah Favorit (Naikkan Tingkat Kasih hingga Lv. 10):
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedGiftIdx ?? ''}
                      onChange={(e) => setSelectedGiftIdx(e.target.value === '' ? null : Number(e.target.value))}
                      className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pilih Barang dari Tas --</option>
                      {inventory.map((slot, idx) => {
                        if (!slot) return null;
                        const meta = itemCatalog[slot.item_id];
                        return (
                          <option key={idx} value={idx}>
                            {meta?.name || slot.item_id} ({slot.count}x)
                          </option>
                        );
                      })}
                    </select>

                    <button
                      disabled={selectedGiftIdx === null}
                      onClick={handleGiveGift}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedGiftIdx !== null
                          ? 'bg-rose-700 hover:bg-rose-600 text-white shadow'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                      }`}
                    >
                      Beri Hadiah
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* TAB CONTENT 2: QUESTS FOR THIS NPC */
              <div className="my-2.5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-amber-300 block">
                  📜 Tugas & Permintaan dari {currentNpc.name}:
                </span>

                {npcQuests.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4 text-center">
                    Belum ada tugas baru saat ini.
                  </p>
                ) : (
                  npcQuests.map((q) => {
                    const isReady = q.can_turn_in;
                    return (
                      <div
                        key={q.id}
                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs ${
                          q.is_completed
                            ? 'bg-stone-950/40 border-stone-800 opacity-60'
                            : isReady
                            ? 'bg-stone-950 border-emerald-600 shadow'
                            : 'bg-stone-950/80 border-stone-800'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5 font-bold text-amber-200">
                            <span>{q.title}</span>
                            {q.is_completed && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 rounded">
                                Selesai
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">{q.description}</p>
                          {!q.is_completed && (
                            <span
                              className={`text-[10px] font-mono font-bold mt-1 inline-block ${
                                isReady ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              Status: {q.current_progress} / {q.target} {q.target_item_name || ''}
                            </span>
                          )}
                        </div>

                        {!q.is_completed && (
                          <button
                            disabled={!isReady || turningInId === q.id}
                            onClick={() => handleTurnInQuestDirect(q)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                              isReady
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black shadow cursor-pointer'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                            }`}
                          >
                            {turningInId === q.id ? 'Menyerahkan...' : isReady ? '✨ Serahkan!' : 'Belum Cukup'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* BOTTOM BUTTON */}
          <div className="flex justify-end mt-2 pt-2 border-t border-stone-800">
            <button
              onClick={() => {
                voiceAi.stop();
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-xs font-bold shadow transition"
            >
              Selesai Bicara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
