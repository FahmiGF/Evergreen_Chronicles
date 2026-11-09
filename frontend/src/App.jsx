import React, { useState, useEffect } from 'react';
import HUD from './components/HUD';
import Quickbar from './components/Quickbar';
import GameCanvas from './game/GameCanvas';
import InventoryModal from './components/InventoryModal';
import CraftingModal from './components/CraftingModal';
import TechTreeModal from './components/TechTreeModal';
import DungeonCombatModal from './components/DungeonCombatModal';
import DialogueBox from './components/DialogueBox';
import ShippingSummaryModal from './components/ShippingSummaryModal';
import ControlsGuideModal from './components/ControlsGuideModal';
import { sounds } from './game/SoundFx';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [itemCatalog, setItemCatalog] = useState({});
  const [craftingRecipes, setCraftingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Modals state
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [craftingOpen, setCraftingOpen] = useState(false);
  const [techTreeOpen, setTechTreeOpen] = useState(false);
  const [dungeonOpen, setDungeonOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeDialogueNpc, setActiveDialogueNpc] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Initialize Data from Backend
  useEffect(() => {
    async function initGameData() {
      try {
        const [itemsRes, recipesRes, saveRes] = await Promise.all([
          fetch('/api/v1/game/items'),
          fetch('/api/v1/game/crafting-recipes'),
          fetch('/api/v1/game/save/1')
        ]);

        if (itemsRes.ok && recipesRes.ok && saveRes.ok) {
          const itemsData = await itemsRes.json();
          const recipesData = await recipesRes.json();
          const saveData = await saveRes.json();

          setItemCatalog(itemsData);
          setCraftingRecipes(recipesData);
          setGameState(saveData);
        } else {
          console.error('Failed to fetch initial game data');
        }
      } catch (err) {
        console.error('Error connecting to backend engine:', err);
      } finally {
        setLoading(false);
      }
    }

    initGameData();
  }, []);

  // Periodic Auto-Save
  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(async () => {
      try {
        await fetch('/api/v1/game/save/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameState)
        });
      } catch (e) {
        console.error('Autosave error', e);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'KeyE') {
        e.preventDefault();
        setInventoryOpen((prev) => !prev);
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setCraftingOpen((prev) => !prev);
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        setTechTreeOpen((prev) => !prev);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setDungeonOpen((prev) => !prev);
      } else if (e.code === 'KeyZ') {
        e.preventDefault();
        setBedOpen((prev) => !prev);
      } else if (e.code === 'KeyH' || e.key === '?') {
        e.preventDefault();
        setGuideOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setInventoryOpen(false);
        setCraftingOpen(false);
        setTechTreeOpen(false);
        setDungeonOpen(false);
        setBedOpen(false);
        setGuideOpen(false);
        setActiveDialogueNpc(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const equippedSlot = gameState?.player?.inventory?.[gameState.player.equipped_index];
  const equippedItemMeta = equippedSlot ? itemCatalog[equippedSlot.item_id] : null;

  if (loading || !gameState) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-amber-200">
        <span className="text-5xl animate-bounce mb-3">🌲</span>
        <h1 className="text-2xl font-bold font-medieval tracking-wider">
          EVERGREEN CHRONICLES
        </h1>
        <p className="text-xs text-stone-400 mt-2 font-mono">
          Memuat dunia Aetherwyn & data pertanian...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-stone-950 text-stone-100 overflow-hidden select-none font-sans relative">
      {/* 1. TOP HUD */}
      <HUD
        gameState={gameState}
        onOpenInventory={() => setInventoryOpen(true)}
        onOpenCrafting={() => setCraftingOpen(true)}
        onOpenTechTree={() => setTechTreeOpen(true)}
        onOpenDungeon={() => setDungeonOpen(true)}
        onOpenBed={() => setBedOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* 2. MAIN GAME AREA */}
      <main className="flex-1 flex items-center justify-center relative p-2 overflow-hidden">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          equippedItem={equippedItemMeta}
          onOpenShipping={() => setInventoryOpen(true)}
          onOpenBed={() => setBedOpen(true)}
          showNotification={showNotification}
        />

        {/* SIDEBAR: VILLAGE NPC QUICK CHAT */}
        <aside className="absolute right-4 top-4 hidden xl:flex flex-col space-y-2 bg-stone-900/80 backdrop-blur-md p-2 rounded-xl border border-amber-900/60 shadow-xl max-w-[160px]">
          <span className="text-[11px] font-bold text-amber-300 font-medieval px-1">
            Penduduk Desa:
          </span>
          {gameState.npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => {
                sounds.playClick();
                setActiveDialogueNpc(npc);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-stone-800/70 hover:bg-stone-700/80 border border-stone-700 text-left transition group"
            >
              <span className="text-lg">
                {npc.id === 'npc_elara' ? '🌿' : npc.id === 'npc_rowan' ? '🔨' : npc.id === 'npc_nessa' ? '⚡' : '🍎'}
              </span>
              <div className="truncate">
                <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100 truncate">
                  {npc.name}
                </div>
                <div className="text-[10px] text-stone-400 truncate">
                  {npc.title.split('&')[0]}
                </div>
              </div>
            </button>
          ))}
        </aside>
      </main>

      {/* 3. BOTTOM QUICKBAR */}
      <footer className="w-full flex justify-center pb-2 z-20">
        <Quickbar
          inventory={gameState.player.inventory}
          equippedIndex={gameState.player.equipped_index}
          onSelectSlot={(idx) => {
            setGameState({
              ...gameState,
              player: {
                ...gameState.player,
                equipped_index: idx
              }
            });
          }}
          itemCatalog={itemCatalog}
        />
      </footer>

      {/* 4. MODALS */}
      <InventoryModal
        isOpen={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        itemCatalog={itemCatalog}
        onOpenShipping={() => setInventoryOpen(true)}
      />

      <CraftingModal
        isOpen={craftingOpen}
        onClose={() => setCraftingOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        recipes={craftingRecipes}
        itemCatalog={itemCatalog}
        showNotification={showNotification}
      />

      <TechTreeModal
        isOpen={techTreeOpen}
        onClose={() => setTechTreeOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <DungeonCombatModal
        isOpen={dungeonOpen}
        onClose={() => setDungeonOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <ShippingSummaryModal
        isOpen={bedOpen}
        onClose={() => setBedOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        itemCatalog={itemCatalog}
        showNotification={showNotification}
      />

      <DialogueBox
        isOpen={activeDialogueNpc !== null}
        npc={activeDialogueNpc}
        onClose={() => setActiveDialogueNpc(null)}
        gameState={gameState}
        setGameState={setGameState}
        itemCatalog={itemCatalog}
        showNotification={showNotification}
      />

      <ControlsGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {/* 5. TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-600 text-rose-200'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-stone-900/90 border-amber-600 text-amber-200'
          }`}
        >
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✨' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
