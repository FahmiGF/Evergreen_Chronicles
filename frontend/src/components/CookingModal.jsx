import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function CookingModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  itemCatalog,
  showNotification
}) {
  const [recipes, setRecipes] = useState([]);
  const [cooking, setCooking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/game/cooking-recipes')
        .then((r) => r.json())
        .then((data) => setRecipes(data))
        .catch((e) => console.error(e));
    }
  }, [isOpen]);

  if (!isOpen || !gameState) return null;

  const inventory = gameState.player.inventory || [];

  const getOwnedCount = (itemId) => {
    return inventory.reduce((total, s) => {
      if (s && s.item_id === itemId) return total + s.count;
      return total;
    }, 0);
  };

  const handleCook = async (recipe) => {
    setCooking(true);
    try {
      const res = await fetch('/api/v1/game/cook/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipe.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Gagal memasak hidangan');
      }

      sounds.playLevelUp();
      showNotification(data.message, 'success');

      // Update player state
      setGameState({
        ...gameState,
        player: {
          ...gameState.player,
          hp: data.current_hp,
          stamina: data.current_stamina,
          inventory: data.inventory
        }
      });
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-3xl">🍲</span>
          <div>
            <h2 className="text-xl font-bold font-medieval text-amber-200">
              Dapur Masak & Perapian Rumah
            </h2>
            <p className="text-stone-400 text-xs">
              Olah hasil panen kebun menjadi hidangan lezat untuk memulihkan Stamina dan HP.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 my-3">
          {recipes.map((rcp) => {
            const canCook = rcp.ingredients.every((ing) => getOwnedCount(ing.item_id) >= ing.count);

            return (
              <div
                key={rcp.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  canCook ? 'bg-stone-950/70 border-amber-700/60' : 'bg-stone-950/40 border-stone-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🍲</span>
                    <h4 className="font-bold text-amber-200 text-sm">{rcp.name}</h4>
                  </div>
                  <p className="text-stone-400 text-xs mt-1">{rcp.description}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                      ⚡ +{rcp.stamina_restore} Stamina
                    </span>
                    <span className="text-[11px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                      ❤️ +{rcp.hp_restore} HP
                    </span>

                    {/* Ingredients list */}
                    {rcp.ingredients.map((ing, idx) => {
                      const owned = getOwnedCount(ing.item_id);
                      const hasEnough = owned >= ing.count;
                      const itemMeta = itemCatalog[ing.item_id];
                      return (
                        <span
                          key={idx}
                          className={`text-[11px] px-2 py-0.5 rounded border ${
                            hasEnough
                              ? 'bg-stone-800 border-emerald-600 text-stone-200'
                              : 'bg-rose-950/40 border-rose-800 text-rose-300'
                          }`}
                        >
                          {itemMeta?.name || ing.item_id}: {owned}/{ing.count}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={!canCook || cooking}
                  onClick={() => handleCook(rcp)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap shadow ${
                    canCook
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  {cooking ? 'Memasak...' : '🍲 Masak Hidangan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
