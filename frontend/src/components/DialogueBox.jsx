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

  const inventory = gameState?.player?.inventory || [];
  const hearts = Math.floor(((npc && npc.friendship_points) || 0) / 250);

  const voiceProfile = npc ? voiceAi.getNpcVoiceProfile(npc.id) : null;

  // Speak greeting on initial modal open
  useEffect(() => {
    if (isOpen && npc) {
      const initialText = npc.dialogue || `Selamat datang di desa Aetherwyn! Aku ${npc.name}, senang bertemu denganmu.`;
      setCurrentDialogueText(initialText);
      setActiveTopic('greeting');

      // Play Voice AI after a tiny delay for browser user activation
      const timer = setTimeout(() => {
        voiceAi.speak(
          initialText,
          npc.id,
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
  }, [isOpen, npc]);

  if (!isOpen || !npc || !gameState) return null;

  const getNpcAvatar = (npcId) => {
    switch (npcId) {
      case 'npc_elara': return '🌿';
      case 'npc_rowan': return '🔨';
      case 'npc_nessa': return '⚡';
      case 'npc_mira': return '🍎';
      default: return '👤';
    }
  };

  const handleSelectTopic = async (topicKey) => {
    if (loadingTopic) return;
    sounds.playClick();
    setActiveTopic(topicKey);
    setLoadingTopic(true);

    try {
      const res = await fetch('/api/v1/game/npc-dialogue-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npc_id: npc.id, topic: topicKey })
      });
      const data = await res.json();
      const textToSpeak = data.spoken_text || 'Terima kasih telah bertanya!';
      setCurrentDialogueText(textToSpeak);

      // Trigger Voice AI Speech
      voiceAi.speak(
        textToSpeak,
        npc.id,
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
      npc.id,
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

  const handleGiveGift = () => {
    if (selectedGiftIdx === null) return;
    const giftSlot = inventory[selectedGiftIdx];
    if (!giftSlot) return;

    const giftMeta = itemCatalog[giftSlot.item_id];
    const isFavorite = (npc.favorite_gifts || []).includes(giftSlot.item_id);
    const addedPoints = isFavorite ? 250 : 80;

    let newInventory = [...inventory];
    giftSlot.count -= 1;
    if (giftSlot.count <= 0) {
      newInventory[selectedGiftIdx] = null;
    }

    const updatedNpcs = (gameState.npcs || []).map((n) => {
      if (n.id === npc.id) {
        return {
          ...n,
          friendship_points: Math.min(2500, (n.friendship_points || 0) + addedPoints)
        };
      }
      return n;
    });

    sounds.playLevelUp();
    showNotification(
      isFavorite
        ? `${npc.name} sangat menyukai ${giftMeta.name}! (+${addedPoints} Hubungan) ❤️`
        : `${npc.name} menerima ${giftMeta.name}. (+${addedPoints} Hubungan)`,
      'success'
    );

    // Speak grateful response
    const thankMsg = isFavorite
      ? `Wah, ${giftMeta.name}! Ini adalah hadiah favorit yang selalu kuimpikan, terima kasih banyak!`
      : `Terima kasih atas ${giftMeta.name} ini, aku akan merawatnya dengan baik.`;
    setCurrentDialogueText(thankMsg);
    voiceAi.speak(
      thankMsg,
      npc.id,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );

    setSelectedGiftIdx(null);
    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        inventory: newInventory
      },
      npcs: updatedNpcs
    });
  };

  const topics = [
    { key: 'work', label: '🛠️ Sedang sibuk apa hari ini?' },
    { key: 'advice', label: '💡 Minta tips petualangan & bertani' },
    { key: 'aether_lore', label: '🔮 Rahasia Kristal Aether' },
    { key: 'era_opinion', label: '🏛️ Pendapat kemajuan desa kita' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm p-4 select-none pb-8 animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-3xl shadow-2xl p-6 relative flex flex-col md:flex-row gap-5">
        <button
          onClick={() => {
            voiceAi.stop();
            sounds.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        {/* LEFT: NPC Profile & Animated Voice Visualizer */}
        <div className="flex md:flex-col items-center md:justify-center p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl min-w-[170px] shadow-inner">
          <div className="relative mb-2">
            <NpcPortrait npcId={npc.id} isSpeaking={isSpeaking} className="w-28 h-28" />

            {/* Speaking Pulse Badge */}
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow">
                Berbicara 🎙️
              </span>
            )}
          </div>

          <div className="text-center w-full">
            <h3 className="font-bold text-amber-200 text-base font-medieval">
              {npc.name}
            </h3>
            <span className="text-[11px] text-stone-400 block mb-1">
              {npc.title}
            </span>

            {/* Heart Meter */}
            <div className="flex justify-center space-x-0.5 text-xs text-rose-500 my-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < hearts ? '❤️' : '🤍'}</span>
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

        {/* RIGHT: Dialogue Text, Voice Waveform & Interactive Topics */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Top Bar: Replay & Voice Mute Toggles */}
            <div className="flex justify-between items-center mb-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5">
                  <span>Percakapan Suara Suasana</span>
                  {isSpeaking && (
                    <span className="flex space-x-0.5 items-end h-3 ml-1">
                      <span className="w-1 bg-cyan-400 h-2 animate-pulse" />
                      <span className="w-1 bg-cyan-400 h-3 animate-pulse delay-75" />
                      <span className="w-1 bg-cyan-400 h-1.5 animate-pulse delay-150" />
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReplayVoice}
                  title="Putar Ulang Suara AI"
                  className="bg-stone-800 hover:bg-stone-700 text-cyan-300 border border-stone-700 px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center space-x-1"
                >
                  <span>🔁 Ulangi Suara</span>
                </button>

                <button
                  onClick={handleToggleVoiceMute}
                  title={isVoiceMuted ? 'Nyalakan Suara AI' : 'Matikan Suara AI'}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 px-2 py-0.5 rounded text-[11px] font-semibold transition"
                >
                  {isVoiceMuted ? '🔇 Suara Bisu' : '🔊 Suara Aktif'}
                </button>
              </div>
            </div>

            {/* Main Spoken Dialogue Box */}
            <div className="bg-stone-950/80 border-2 border-amber-900/60 rounded-xl p-4 text-stone-100 text-sm leading-relaxed min-h-[90px] shadow-inner flex flex-col justify-between relative overflow-hidden">
              <div className="font-serif italic text-amber-100/95 text-[13.5px]">
                "{currentDialogueText}"
              </div>

              {/* Animated Waveform bar at bottom of dialogue */}
              {isSpeaking && (
                <div className="mt-3 flex items-center space-x-1 h-2 opacity-80">
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

            {/* Interactive Discussion Topics Buttons */}
            <div className="my-3">
              <span className="text-[11px] font-bold text-stone-400 block mb-1.5">
                💬 Pilih Topik untuk Bertanya (Suara AI Menjawab):
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
            <div className="border-t border-stone-800 pt-2.5">
              <label className="text-[11px] text-stone-400 block mb-1 font-semibold">
                🎁 Berikan Hadiah dari Ransel:
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
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                voiceAi.stop();
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-xs font-bold shadow"
            >
              Selesai Bicara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
