import React, { useState } from 'react';
import { sounds } from '../game/SoundFx';

export default function InventoryModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  itemCatalog,
  onOpenShipping
}) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  if (!isOpen || !gameState) return null;

  const inventory = gameState.player.inventory || [];
  const selectedSlot = selectedSlotIndex !== null ? inventory[selectedSlotIndex] : null;
  const selectedMeta = selectedSlot ? itemCatalog[selectedSlot.item_id] : null;

  const getItemEmoji = (itemMeta) => {
    if (!itemMeta) return '';
    switch (itemMeta.icon_type) {
      case 'hoe': return '⛏️';
      case 'can': return '💧';
      case 'pickaxe': return '🔨';
      case 'axe': return '🪓';
      case 'sword': return '🗡️';
      case 'crystal_blade': return '⚔️';
      case 'seed_bag': return '🌱';
      case 'seed_magical': return '✨';
      case 'parsnip': return '🥕';
      case 'potato': return '🥔';
      case 'strawberry': return '🍓';
      case 'corn': return '🌽';
      case 'tomato': return '🍅';
      case 'moonberry': return '🔮';
      case 'wood': return '🪵';
      case 'stone': return '🪨';
      case 'ore_copper': return '🧱';
      case 'ore_iron': return '⚙️';
      case 'ore_gold': return '🪙';
      case 'aether_crystal': return '💎';
      case 'sprinkler': return '⛲';
      case 'sprinkler_adv': return '💠';
      case 'lamp': return '🏮';
      default: return '📦';
    }
  };

  const handleEquipSlot = (idx) => {
    sounds.playClick();
    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        equipped_index: idx
      }
    });
  };

  const handleShipItem = (idx) => {
    if (!selectedSlot || !selectedMeta) return;
    sounds.playCoin();

    let newInventory = [...inventory];
    let newShippingBin = [...(gameState.shipping_bin || [])];

    newShippingBin.push({
      item_id: selectedSlot.item_id,
      name: selectedMeta.name,
      count: selectedSlot.count,
      sell_price: selectedMeta.sell_price
    });

    newInventory[idx] = null;
    setSelectedSlotIndex(null);

    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        inventory: newInventory
      },
      shipping_bin: newShippingBin
    });
  };

  const handleDiscardItem = (idx) => {
    if (!selectedSlot) return;
    sounds.playClick();
    let newInventory = [...inventory];
    newInventory[idx] = null;
    setSelectedSlotIndex(null);

    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        inventory: newInventory
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative flex flex-col md:flex-row gap-6">
        {/* Close Button */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        {/* LEFT: 24-Slot Grid */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🎒</span>
            <h2 className="text-xl font-bold font-medieval text-amber-200">
              Tas Petualang (24 Slot)
            </h2>
          </div>

          <div className="grid grid-cols-6 gap-2 bg-stone-950/70 p-3 rounded-xl border border-stone-800">
            {Array.from({ length: 24 }).map((_, idx) => {
              const slot = inventory[idx];
              const meta = slot ? itemCatalog[slot.item_id] : null;
              const isSelected = selectedSlotIndex === idx;
              const isEquipped = gameState.player.equipped_index === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSlotIndex(idx);
                  }}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-amber-800/80 border-2 border-amber-400 scale-105 shadow-md'
                      : 'bg-stone-800/70 hover:bg-stone-700/70 border border-stone-700'
                  }`}
                >
                  {isEquipped && (
                    <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 shadow-sm" title="Sedang dipakai" />
                  )}

                  {meta ? (
                    <span className="text-2xl filter drop-shadow">
                      {getItemEmoji(meta)}
                    </span>
                  ) : (
                    <span className="text-stone-700 text-sm">•</span>
                  )}

                  {slot && slot.count > 1 && (
                    <span className="absolute bottom-1 right-1 text-[11px] font-bold font-mono text-amber-200 bg-black/70 px-1 rounded">
                      {slot.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-stone-400 text-xs flex justify-between items-center">
            <span>Baris 1 & 2 (1–10): Slot Akses Cepat</span>
            <span className="text-amber-400 font-mono">
              Emas: {gameState.player.gold.toLocaleString()} G
            </span>
          </div>
        </div>

        {/* RIGHT: Selected Item Details Panel */}
        <div className="w-full md:w-56 bg-stone-950/80 p-4 rounded-xl border border-amber-950/60 flex flex-col justify-between">
          {selectedMeta && selectedSlot ? (
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl p-2 bg-stone-800 rounded-lg">
                  {getItemEmoji(selectedMeta)}
                </span>
                <div>
                  <h3 className="font-bold text-amber-200 leading-tight">
                    {selectedMeta.name}
                  </h3>
                  <span className="text-[11px] text-cyan-400 uppercase tracking-wider">
                    {selectedMeta.category}
                  </span>
                </div>
              </div>

              <p className="text-stone-300 text-xs mb-4 leading-relaxed">
                {selectedMeta.description}
              </p>

              <div className="space-y-1.5 text-xs text-stone-400 border-t border-stone-800 pt-3 mb-4">
                <div className="flex justify-between">
                  <span>Jumlah:</span>
                  <span className="text-amber-200 font-bold">{selectedSlot.count}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Harga Jual:</span>
                  <span className="text-amber-300 font-mono">{selectedMeta.sell_price} G / unit</span>
                </div>
                {selectedMeta.stamina_cost ? (
                  <div className="flex justify-between">
                    <span>Biaya Stamina:</span>
                    <span className="text-emerald-400 font-mono">-{selectedMeta.stamina_cost}</span>
                  </div>
                ) : null}
                {selectedMeta.energy_restore ? (
                  <div className="flex justify-between">
                    <span>Pemulihan Energi:</span>
                    <span className="text-cyan-400 font-mono">+{selectedMeta.energy_restore} HP</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleEquipSlot(selectedSlotIndex)}
                  className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  ⚡ Pakai di Tangan
                </button>

                {selectedMeta.sell_price > 0 && (
                  <button
                    onClick={() => handleShipItem(selectedSlotIndex)}
                    className="w-full py-1.5 px-3 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-xs font-semibold shadow transition flex items-center justify-center space-x-1"
                  >
                    <span>📦 Masukkan Kotak Jual (+{selectedMeta.sell_price * selectedSlot.count}G)</span>
                  </button>
                )}

                <button
                  onClick={() => handleDiscardItem(selectedSlotIndex)}
                  className="w-full py-1.5 px-3 bg-stone-800 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-semibold transition"
                >
                  🗑️ Buang
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-10">
              <span className="text-3xl mb-2">🔍</span>
              <p className="text-xs">Klik salah satu slot ransel untuk memeriksa detail item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
