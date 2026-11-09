import React, { useState } from 'react';
import { sounds } from '../game/SoundFx';

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

  if (!isOpen || !npc || !gameState) return null;

  const inventory = gameState.player.inventory || [];
  const hearts = Math.floor((npc.friendship_points || 0) / 250);

  const getNpcAvatar = (npcId) => {
    switch (npcId) {
      case 'npc_elara': return '🌿';
      case 'npc_rowan': return '🔨';
      case 'npc_nessa': return '⚡';
      case 'npc_mira': return '🍎';
      default: return '👤';
    }
  };

  const handleGiveGift = () => {
    if (selectedGiftIdx === null) return;
    const giftSlot = inventory[selectedGiftIdx];
    if (!giftSlot) return;

    const giftMeta = itemCatalog[giftSlot.item_id];
    const isFavorite = (npc.favorite_gifts || []).includes(giftSlot.item_id);
    const addedPoints = isFavorite ? 250 : 80;

    // Deduct 1 gift from inventory
    let newInventory = [...inventory];
    giftSlot.count -= 1;
    if (giftSlot.count <= 0) {
      newInventory[selectedGiftIdx] = null;
    }

    // Update NPC friendship
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 select-none pb-8">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative flex flex-col md:flex-row gap-5">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        {/* NPC Avatar Card */}
        <div className="flex md:flex-col items-center md:justify-center p-4 bg-stone-950/70 border border-stone-800 rounded-xl min-w-[140px]">
          <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-3xl shadow-inner mb-2 mr-3 md:mr-0">
            {getNpcAvatar(npc.id)}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-amber-200 text-sm font-medieval">
              {npc.name}
            </h3>
            <span className="text-[11px] text-stone-400 block mb-1">
              {npc.title}
            </span>
            {/* Heart Meter */}
            <div className="flex justify-center space-x-0.5 text-xs text-rose-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < hearts ? '❤️' : '🤍'}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dialogue & Interaction Panel */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="bg-stone-950/60 border border-amber-950/60 rounded-xl p-4 text-stone-200 text-sm leading-relaxed min-h-[85px] mb-4">
              "{npc.dialogue || 'Senang bertemu denganmu di Aetherwyn!'}"
            </div>

            {/* Gift giving section */}
            <div className="border-t border-stone-800 pt-3">
              <label className="text-xs text-stone-400 block mb-1 font-semibold">
                🎁 Berikan Hadiah dari Ransel:
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedGiftIdx ?? ''}
                  onChange={(e) => setSelectedGiftIdx(e.target.value === '' ? null : Number(e.target.value))}
                  className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Barang untuk Diberikan --</option>
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

          <div className="flex justify-end mt-4">
            <button
              onClick={() => { sounds.playClick(); onClose(); }}
              className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-xs font-bold shadow"
            >
              Tutup Percakapan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
