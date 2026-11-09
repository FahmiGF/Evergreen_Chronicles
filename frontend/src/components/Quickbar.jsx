import React, { useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function Quickbar({
  inventory,
  equippedIndex,
  onSelectSlot,
  itemCatalog
}) {
  const quickSlots = (inventory || []).slice(0, 10);

  // Keyboard number keys 1..9, 0 to select slot
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
        Digit5: 4,
        Digit6: 5,
        Digit7: 6,
        Digit8: 7,
        Digit9: 8,
        Digit0: 9
      };
      if (keyMap[e.code] !== undefined) {
        sounds.playClick();
        onSelectSlot(keyMap[e.code]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectSlot]);

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

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center select-none pointer-events-auto">
      {/* Equipped Item Label tooltip */}
      {inventory && inventory[equippedIndex] && (
        <div className="mb-1.5 px-3 py-0.5 rounded-full bg-stone-900/90 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-md flex items-center space-x-1.5 animate-fadeIn">
          <span>{getItemEmoji(itemCatalog[inventory[equippedIndex].item_id])}</span>
          <span>{itemCatalog[inventory[equippedIndex].item_id]?.name || 'Item'}</span>
          {itemCatalog[inventory[equippedIndex].item_id]?.stamina_cost ? (
            <span className="text-emerald-400 text-[10px]">
              (-{itemCatalog[inventory[equippedIndex].item_id].stamina_cost} Stamina)
            </span>
          ) : null}
        </div>
      )}

      {/* 10 Hotbar Slots */}
      <div className="flex space-x-1.5 p-2 bg-stone-900/90 backdrop-blur-md border-2 border-amber-900/70 rounded-xl shadow-2xl">
        {quickSlots.map((slot, idx) => {
          const isSelected = idx === equippedIndex;
          const itemMeta = slot ? itemCatalog[slot.item_id] : null;

          return (
            <button
              key={idx}
              onClick={() => {
                sounds.playClick();
                onSelectSlot(idx);
              }}
              className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-800/80 border-2 border-amber-300 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/60'
              }`}
            >
              {/* Shortcut digit badge */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono text-stone-400">
                {idx === 9 ? '0' : idx + 1}
              </span>

              {/* Item Icon */}
              {itemMeta ? (
                <span className="text-xl filter drop-shadow">
                  {getItemEmoji(itemMeta)}
                </span>
              ) : (
                <span className="text-stone-600 text-xs">•</span>
              )}

              {/* Quantity badge */}
              {slot && slot.count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-bold font-mono text-amber-200 bg-black/60 px-1 rounded-sm">
                  {slot.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
