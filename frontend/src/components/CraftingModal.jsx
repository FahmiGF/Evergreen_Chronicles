import React from 'react';
import { sounds } from '../game/SoundFx';

export default function CraftingModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  recipes,
  itemCatalog,
  showNotification
}) {
  if (!isOpen || !gameState) return null;

  const inventory = gameState.player.inventory || [];
  const eraLevel = gameState.world.era_level || 1;

  // Count item quantities in player inventory
  const getInventoryCount = (itemId) => {
    return inventory.reduce((total, slot) => {
      if (slot && slot.item_id === itemId) {
        return total + slot.count;
      }
      return total;
    }, 0);
  };

  const getItemEmoji = (itemMeta) => {
    if (!itemMeta) return '';
    switch (itemMeta.icon_type) {
      case 'sprinkler': return '⛲';
      case 'sprinkler_adv': return '💠';
      case 'crystal_blade': return '⚔️';
      case 'lamp': return '🏮';
      case 'wood': return '🪵';
      case 'stone': return '🪨';
      case 'ore_copper': return '🧱';
      case 'ore_iron': return '⚙️';
      case 'aether_crystal': return '💎';
      default: return '📦';
    }
  };

  const handleCraft = (recipe) => {
    // Check Era Requirement
    if (eraLevel < recipe.unlocked_by_era) {
      showNotification(`Harus mencapai Era ${recipe.unlocked_by_era} untuk merakit ini!`, 'error');
      return;
    }

    // Check Materials
    for (const mat of recipe.materials) {
      const have = getInventoryCount(mat.item_id);
      if (have < mat.count) {
        const matName = itemCatalog[mat.item_id]?.name || mat.item_id;
        showNotification(`Bahan kurang: butuh ${mat.count}x ${matName} (punya ${have})`, 'error');
        return;
      }
    }

    // Deduct Materials from Inventory
    let newInventory = [...inventory];
    for (const mat of recipe.materials) {
      let needed = mat.count;
      for (let i = 0; i < newInventory.length; i++) {
        const slot = newInventory[i];
        if (slot && slot.item_id === mat.item_id) {
          if (slot.count > needed) {
            slot.count -= needed;
            needed = 0;
            break;
          } else {
            needed -= slot.count;
            newInventory[i] = null;
            if (needed <= 0) break;
          }
        }
      }
    }

    // Add crafted result item
    let stacked = false;
    for (let slot of newInventory) {
      if (slot && slot.item_id === recipe.result_item_id) {
        slot.count += recipe.result_count;
        stacked = true;
        break;
      }
    }
    if (!stacked) {
      const emptyIdx = newInventory.findIndex((s) => s === null);
      if (emptyIdx !== -1) {
        newInventory[emptyIdx] = { item_id: recipe.result_item_id, count: recipe.result_count };
      } else {
        showNotification('Tas penuh! Beri ruang sebelum merakit.', 'error');
        return;
      }
    }

    sounds.playLevelUp();
    showNotification(`Berhasil merakit: ${recipe.name}! ✨`, 'success');

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
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🔨</span>
          <h2 className="text-xl font-bold font-medieval text-amber-200">
            Meja Pengrajin Desa & Bengkel Mesin
          </h2>
        </div>

        <p className="text-stone-300 text-xs mb-4">
          Gunakan bahan kayu, batu tambang, dan kristal untuk membuat peralatan pertanian canggih serta senjata.
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {recipes.map((recipe, idx) => {
            const resultMeta = itemCatalog[recipe.result_item_id];
            const isEraUnlocked = eraLevel >= recipe.unlocked_by_era;
            const canCraft = isEraUnlocked && recipe.materials.every(
              (mat) => getInventoryCount(mat.item_id) >= mat.count
            );

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEraUnlocked
                    ? 'bg-stone-950/70 border-stone-700/80'
                    : 'bg-stone-950/40 border-stone-800/40 opacity-60'
                }`}
              >
                {/* Item Info */}
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 bg-stone-800 rounded-lg">
                    {getItemEmoji(resultMeta)}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-amber-200 text-sm">
                        {recipe.name}
                      </h4>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 py-0.5 rounded">
                        Era {recipe.unlocked_by_era}
                      </span>
                    </div>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {resultMeta?.description || 'Peralatan berharga.'}
                    </p>

                    {/* Materials Checklist */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipe.materials.map((mat, mIdx) => {
                        const have = getInventoryCount(mat.item_id);
                        const hasEnough = have >= mat.count;
                        const matMeta = itemCatalog[mat.item_id];
                        return (
                          <span
                            key={mIdx}
                            className={`text-[11px] px-2 py-0.5 rounded flex items-center space-x-1 border ${
                              hasEnough
                                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                                : 'bg-rose-950/60 border-rose-800 text-rose-300'
                            }`}
                          >
                            <span>{getItemEmoji(matMeta)}</span>
                            <span>{matMeta?.name || mat.item_id}:</span>
                            <span className="font-mono font-bold">{have}/{mat.count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Craft Button */}
                <button
                  disabled={!canCraft}
                  onClick={() => handleCraft(recipe)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap shadow ${
                    canCraft
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  {isEraUnlocked ? '🔨 Rakit Sekarang' : `🔒 Kunci (Era ${recipe.unlocked_by_era})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
