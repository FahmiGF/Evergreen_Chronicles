import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import Quickbar from './components/Quickbar';
import GameCanvas from './game/GameCanvas';
import InventoryModal from './components/InventoryModal';
import CraftingModal from './components/CraftingModal';
import CookingModal from './components/CookingModal';
import FishingModal from './components/FishingModal';
import TechTreeModal from './components/TechTreeModal';
import DungeonCombatModal from './components/DungeonCombatModal';
import DialogueBox from './components/DialogueBox';
import ShippingSummaryModal from './components/ShippingSummaryModal';
import ControlsGuideModal from './components/ControlsGuideModal';
import RosterDrawer from './components/RosterDrawer';
import OnlineChat from './components/OnlineChat';
import WorldMapModal from './components/WorldMapModal';
import TutorialGuide from './components/TutorialGuide';
import QuestLogModal from './components/QuestLogModal';
import AffectionModal from './components/AffectionModal';
import StorylineModal from './components/StorylineModal';
import BlueprintDock from './components/BlueprintDock';
import CharacterStudioModal from './components/CharacterStudioModal';
import LandscapePainterDock from './components/LandscapePainterDock';
import CivilizationDashboardModal from './components/CivilizationDashboardModal';
import SkillsProgressionModal from './components/SkillsProgressionModal';
import MountsStableModal from './components/MountsStableModal';
import UndergroundMiningModal from './components/UndergroundMiningModal';
import PortalsEventModal from './components/PortalsEventModal';
import CollectionJournalModal from './components/CollectionJournalModal';
import { sounds } from './game/SoundFx';
import { multiplayer } from './game/MultiplayerManager';

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('eg_lang') || 'id');

  const [gameState, setGameState] = useState(null);
  const [itemCatalog, setItemCatalog] = useState({});
  const [craftingRecipes, setCraftingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // View Modes & Mechanized Farming State
  const [viewMode, setViewMode] = useState('topdown'); // 'topdown' | '3d' | 'blueprint'
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [isTractorMounted, setIsTractorMounted] = useState(false);
  const [tractorAttachment, setTractorAttachment] = useState('tiller'); // 'tiller' | 'sprayer' | 'mower'

  // Multiplayer stats
  const [onlineCount, setOnlineCount] = useState(1);
  const [pingMs, setPingMs] = useState(5);
  const [localChatBubble, setLocalChatBubble] = useState(null);

  // Modals state
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [craftingOpen, setCraftingOpen] = useState(false);
  const [cookingOpen, setCookingOpen] = useState(false);
  const [fishingOpen, setFishingOpen] = useState(false);
  const [techTreeOpen, setTechTreeOpen] = useState(false);
  const [dungeonOpen, setDungeonOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [questLogOpen, setQuestLogOpen] = useState(false);
  const [affectionOpen, setAffectionOpen] = useState(false);
  const [storylineOpen, setStorylineOpen] = useState(false);
  const [characterStudioOpen, setCharacterStudioOpen] = useState(false);
  const [landscapePainterOpen, setLandscapePainterOpen] = useState(false);
  const [civDashboardOpen, setCivDashboardOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [mountsOpen, setMountsOpen] = useState(false);
  const [miningOpen, setMiningOpen] = useState(false);
  const [portalsOpen, setPortalsOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [activeLandscapeBrush, setActiveLandscapeBrush] = useState('grass');
  const [landscapeBrushRadius, setLandscapeBrushRadius] = useState(1);
  const [currentZoneId, setCurrentZoneId] = useState('zone_farm');
  const [activeDialogueNpc, setActiveDialogueNpc] = useState(null);

  // Landscape Terrain Painting Handler
  const handlePaintLandscape = async (x, y, brushType, radius = 1) => {
    sounds.playTill();
    const targets = [];
    if (radius === 1) {
      targets.push({ x, y });
    } else {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16) {
            targets.push({ x: nx, y: ny });
          }
        }
      }
    }

    for (const pt of targets) {
      try {
        await fetch('/api/v1/game/landscape/paint/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: pt.x, y: pt.y, brush_type: brushType })
        });
      } catch (err) {
        console.error('Landscape paint fetch error', err);
      }
    }

    // Optimistically update local farm_grid
    setGameState((prev) => {
      if (!prev || !prev.farm_grid) return prev;
      const nextGrid = prev.farm_grid.map(row => [...row]);
      targets.forEach(pt => {
        if (nextGrid[pt.y] && nextGrid[pt.y][pt.x]) {
          nextGrid[pt.y][pt.x] = { ...nextGrid[pt.y][pt.x], tile_type: brushType };
        }
      });
      return { ...prev, farm_grid: nextGrid };
    });
  };

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

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('eg_lang', newLang);
  };

  // Initialize Game Data
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
        }
      } catch (err) {
        console.error('Error connecting to backend engine:', err);
      } finally {
        setLoading(false);
      }
    }

    initGameData();

    // Subscribe to multiplayer events
    const unsub = multiplayer.subscribe((ev) => {
      if (ev.type === 'roster_update') {
        setOnlineCount((ev.players?.length || 0) + 1);
      } else if (ev.type === 'ping_update') {
        setPingMs(ev.ping);
      }
    });

    return () => unsub();
  }, []);

  // Periodic Auto-Save
  useEffect(() => {
    if (!gameState || !inGame) return;
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
  }, [gameState, inGame]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (!inGame) return;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'KeyE') {
        e.preventDefault();
        setInventoryOpen((prev) => !prev);
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setCivDashboardOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyX') {
        e.preventDefault();
        setCraftingOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        setSkillsOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setMountsOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        setFishingOpen((prev) => !prev);
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        setTechTreeOpen((prev) => !prev);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setMiningOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        setPortalsOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyY') {
        e.preventDefault();
        setCollectionsOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyO') {
        e.preventDefault();
        setWorldMapOpen((prev) => !prev);
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        setQuestLogOpen((prev) => !prev);
      } else if (e.code === 'KeyU') {
        e.preventDefault();
        setAffectionOpen((prev) => !prev);
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        setStorylineOpen((prev) => !prev);
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        setCharacterStudioOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        setLandscapePainterOpen((prev) => !prev);
        sounds.playClick();
      } else if (e.code === 'KeyZ') {
        e.preventDefault();
        setBedOpen((prev) => !prev);
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setViewMode((prev) => (prev === 'topdown' ? '3d' : 'topdown'));
        sounds.playClick();
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        setViewMode((prev) => (prev === 'blueprint' ? 'topdown' : 'blueprint'));
        sounds.playClick();
      } else if (e.code === 'KeyH' || e.key === '?') {
        e.preventDefault();
        setGuideOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setInventoryOpen(false);
        setCraftingOpen(false);
        setCookingOpen(false);
        setFishingOpen(false);
        setTechTreeOpen(false);
        setDungeonOpen(false);
        setWorldMapOpen(false);
        setQuestLogOpen(false);
        setAffectionOpen(false);
        setStorylineOpen(false);
        setCharacterStudioOpen(false);
        setLandscapePainterOpen(false);
        setCivDashboardOpen(false);
        setSkillsOpen(false);
        setMountsOpen(false);
        setMiningOpen(false);
        setPortalsOpen(false);
        setCollectionsOpen(false);
        setBedOpen(false);
        setGuideOpen(false);
        setRosterOpen(false);
        setActiveDialogueNpc(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [inGame]);

  const handleStartSingleplayer = () => {
    if (gameState) {
      multiplayer.connect(gameState.player?.name || 'Fahmi', '#3b82f6');
    }
    setInGame(true);
  };

  const handleStartMultiplayer = (customName, customColor) => {
    if (gameState) {
      setGameState({
        ...gameState,
        player: {
          ...gameState.player,
          name: customName || 'Pengelana'
        }
      });
      multiplayer.connect(customName || 'Pengelana', customColor || '#3b82f6');
    }
    setInGame(true);
  };

  const handleSelfChat = (text) => {
    setLocalChatBubble(text);
    setTimeout(() => {
      setLocalChatBubble(null);
    }, 4500);
  };

  const equippedSlot = gameState?.player?.inventory?.[gameState.player.equipped_index];
  const equippedItemMeta = equippedSlot ? itemCatalog[equippedSlot.item_id] : null;

  // 1. MAIN TITLE MENU SCREEN (Not in game)
  if (!inGame) {
    return (
      <>
        <MainMenu
          onStartSingleplayer={handleStartSingleplayer}
          onStartMultiplayer={handleStartMultiplayer}
          onOpenControls={() => setGuideOpen(true)}
          lang={lang}
          setLang={handleSetLang}
          isAudioMuted={isMuted}
          onToggleAudio={handleToggleMute}
        />
        <ControlsGuideModal
          isOpen={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      </>
    );
  }

  // 2. IN-GAME SCREEN
  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-stone-950 text-stone-100 overflow-hidden select-none font-sans relative">
      {/* 1. TOP HUD */}
      <HUD
        gameState={gameState}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isTractorMounted={isTractorMounted}
        tractorAttachment={tractorAttachment}
        onChangeAttachment={setTractorAttachment}
        onToggleTractorMount={() => setIsTractorMounted((prev) => !prev)}
        onHonkTractor={() => {
          sounds.playTractorHorn();
          showNotification('🎺 HONK HONK!', 'info');
        }}
        onOpenInventory={() => setInventoryOpen(true)}
        onOpenCrafting={() => setCraftingOpen(true)}
        onOpenCooking={() => setCookingOpen(true)}
        onOpenFishing={() => setFishingOpen(true)}
        onOpenTechTree={() => setTechTreeOpen(true)}
        onOpenDungeon={() => setDungeonOpen(true)}
        onOpenWorldMap={() => setWorldMapOpen(true)}
        onOpenQuestLog={() => setQuestLogOpen(true)}
        onOpenAffection={() => setAffectionOpen(true)}
        onOpenStoryline={() => setStorylineOpen(true)}
        onOpenCivilization={() => setCivDashboardOpen(true)}
        onOpenCharacterStudio={() => setCharacterStudioOpen(true)}
        onOpenSkills={() => setSkillsOpen(true)}
        onOpenMounts={() => setMountsOpen(true)}
        onOpenMining={() => setMiningOpen(true)}
        onOpenPortals={() => setPortalsOpen(true)}
        onOpenCollections={() => setCollectionsOpen(true)}
        onToggleLandscapePainter={() => setLandscapePainterOpen((prev) => !prev)}
        isLandscapePainterActive={landscapePainterOpen}
        onOpenBed={() => setBedOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenRoster={() => setRosterOpen(true)}
        onReturnToMenu={() => setInGame(false)}
        onlineCount={onlineCount}
        pingMs={pingMs}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        lang={lang}
        setLang={handleSetLang}
      />

      {/* 2. MAIN GAME CANVAS & ONLINE PLAYERS */}
      <main className="flex-1 flex items-center justify-center relative p-2 overflow-hidden">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          equippedItem={equippedItemMeta}
          currentZone={currentZoneId}
          viewMode={viewMode}
          activeBlueprint={activeBlueprint}
          onClearActiveBlueprint={() => setActiveBlueprint(null)}
          isTractorMounted={isTractorMounted}
          setIsTractorMounted={setIsTractorMounted}
          tractorAttachment={tractorAttachment}
          setTractorAttachment={setTractorAttachment}
          isLandscapePainterActive={landscapePainterOpen}
          activeLandscapeBrush={activeLandscapeBrush}
          landscapeBrushRadius={landscapeBrushRadius}
          onPaintLandscape={handlePaintLandscape}
          onOpenShipping={() => setInventoryOpen(true)}
          onOpenBed={() => setBedOpen(true)}
          onOpenFishing={() => setFishingOpen(true)}
          onOpenNpcDialogue={(npc) => setActiveDialogueNpc(npc)}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          showNotification={showNotification}
          localPlayerChatBubble={localChatBubble}
        />

        {/* BLUEPRINT CAD ARCHITECTURAL DOCK */}
        <BlueprintDock
          isOpen={viewMode === 'blueprint'}
          onClose={() => setViewMode('topdown')}
          activeBlueprint={activeBlueprint}
          onSelectBlueprint={setActiveBlueprint}
          playerInventory={gameState?.player?.inventory || []}
          playerGold={gameState?.player?.gold || 0}
        />

        {/* TOP-RIGHT: NEWCOMER TUTORIAL GUIDE */}
        <TutorialGuide
          gameState={gameState}
          setGameState={setGameState}
          showNotification={showNotification}
        />

        {/* SIDEBAR: LIVING VILLAGE NPCS */}
        <aside className="absolute right-4 top-4 hidden xl:flex flex-col space-y-2 bg-stone-900/80 backdrop-blur-md p-2 rounded-xl border border-amber-900/60 shadow-xl max-w-[160px]">
          <span className="text-[11px] font-bold text-amber-300 font-medieval px-1">
            Warga Berkelana:
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

        {/* BOTTOM-LEFT: ONLINE CHAT */}
        <OnlineChat
          playerName={gameState.player?.name || 'Kamu'}
          onSelfChat={handleSelfChat}
        />
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

      <CookingModal
        isOpen={cookingOpen}
        onClose={() => setCookingOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        itemCatalog={itemCatalog}
        showNotification={showNotification}
      />

      <FishingModal
        isOpen={fishingOpen}
        onClose={() => setFishingOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
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

      <WorldMapModal
        isOpen={worldMapOpen}
        onClose={() => setWorldMapOpen(false)}
        currentZoneId={currentZoneId}
        onTravelToZone={(zone) => setCurrentZoneId(zone.id)}
        showNotification={showNotification}
      />

      <RosterDrawer
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        pingMs={pingMs}
        localPlayerName={gameState.player?.name}
      />

      <QuestLogModal
        isOpen={questLogOpen}
        onClose={() => setQuestLogOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
        onOpenStoryline={() => setStorylineOpen(true)}
      />

      <AffectionModal
        isOpen={affectionOpen}
        onClose={() => setAffectionOpen(false)}
        gameState={gameState}
        onOpenDialogue={(npc) => setActiveDialogueNpc(npc)}
        onOpenQuests={() => setQuestLogOpen(true)}
      />

      <StorylineModal
        isOpen={storylineOpen}
        onClose={() => setStorylineOpen(false)}
      />

      {/* CHARACTER STUDIO & WARDROBE MODAL */}
      <CharacterStudioModal
        isOpen={characterStudioOpen}
        onClose={() => setCharacterStudioOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      {/* LANDSCAPE & TERRAIN PAINTER DOCK */}
      <LandscapePainterDock
        isOpen={landscapePainterOpen}
        onClose={() => setLandscapePainterOpen(false)}
        activeBrush={activeLandscapeBrush}
        onSelectBrush={setActiveLandscapeBrush}
        brushRadius={landscapeBrushRadius}
        onChangeRadius={setLandscapeBrushRadius}
      />

      {/* CIVILIZATION & LIVING WORLD DASHBOARD */}
      <CivilizationDashboardModal
        isOpen={civDashboardOpen}
        onClose={() => setCivDashboardOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      {/* V4 ULTIMATE EXPANSION MODALS */}
      <SkillsProgressionModal
        isOpen={skillsOpen}
        onClose={() => setSkillsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <MountsStableModal
        isOpen={mountsOpen}
        onClose={() => setMountsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <UndergroundMiningModal
        isOpen={miningOpen}
        onClose={() => setMiningOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <PortalsEventModal
        isOpen={portalsOpen}
        onClose={() => setPortalsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
      />

      <CollectionJournalModal
        isOpen={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        showNotification={showNotification}
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
