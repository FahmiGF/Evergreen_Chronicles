# EVERGREEN CHRONICLES — SYSTEM INVENTORY
**Date**: November 9, 2026  
**Version**: 1.1.0  
**Repository**: `C:\Kuliah Sisfor\Github Project\evergreen-chronicles`

---

## 1. Directory & Component Inventory

```
evergreen-chronicles/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Package indicator
│   │   ├── main.py               # FastAPI application entry, routes, WebSockets & static mounting
│   │   ├── game_store.py         # In-memory & JSON state store, catalogs, recipes, blueprints
│   │   ├── npc_engine.py         # A* Pathfinding, NPC schedules, dialogue AI handlers
│   │   └── websocket_manager.py  # WebSocket connection manager, broadcast loops, client tracking
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_game_api.py      # Pytest test suite (17 comprehensive test cases)
│   │   └── stress_test.py        # 30 concurrent player async WebSocket benchmark
│   └── run.py                    # Server launch script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AffectionModal.jsx       # NPC affection & heart levels (1-10) display
│   │   │   ├── BlueprintDock.jsx        # Floating CAD blueprint dock & catalog selector
│   │   │   ├── ControlsGuideModal.jsx   # Keyboard & gamepad shortcut guidebook
│   │   │   ├── CookingModal.jsx         # Kitchen cooking recipe craft interface
│   │   │   ├── CraftingModal.jsx        # Workbench craft modal for tools, materials, tech
│   │   │   ├── CutscenePlayerModal.jsx  # Storyline trailer & cutscene cinematic player
│   │   │   ├── DialogueBox.jsx          # NPC conversation box with voice AI & affection gifts
│   │   │   ├── DungeonCombatModal.jsx   # Mine dungeon crawler with monsters & loot
│   │   │   ├── FishingModal.jsx         # Interactive fishing mini-game with cast/reel
│   │   │   ├── HUD.jsx                  # Top status bar, calendar, clock, 2D/3D/CAD toggles, tractor controls
│   │   │   ├── InventoryModal.jsx       # 24-slot backpack inventory & item inspector
│   │   │   ├── MainMenu.jsx             # Title screen (Singleplayer, Multiplayer, Credits, Testers)
│   │   │   ├── OnlineChat.jsx           # Real-time in-game chat interface
│   │   │   ├── QuestLogModal.jsx        # Active & completed village quests tracker
│   │   │   ├── Quickbar.jsx             # 10-slot bottom quick action hotbar
│   │   │   ├── RosterDrawer.jsx         # Connected online players list & ping display
│   │   │   ├── ShippingSummaryModal.jsx # Overnight sleep & shipping bin profit report
│   │   │   ├── StorylineModal.jsx       # Campaign storyline chapters & cutscenes
│   │   │   ├── TechTreeModal.jsx        # Civilization era research & technology tree
│   │   │   ├── TutorialGuide.jsx        # Newcomer onboarding step-by-step questline
│   │   │   └── WorldMapModal.jsx        # 8-region world map fast travel interface
│   │   ├── game/
│   │   │   ├── GameCanvas.jsx           # Triple-perspective render engine (2D, 3D Iso, CAD)
│   │   │   ├── MultiplayerManager.js    # Client-side WebSocket client with lerp interpolation
│   │   │   ├── NpcPortraits.jsx         # Pixel art NPC expressive portraits (Elara, Rowan, etc.)
│   │   │   ├── SoundFx.js               # Procedural Web Audio API sound synthesizer
│   │   │   └── VoiceAiEngine.js         # Text-to-speech procedural voice generator for NPCs
│   │   ├── i18n/
│   │   │   └── translations.js          # Localization dictionary (Indonesian, English, Japanese)
│   │   ├── App.jsx                      # Root container, global shortcuts, modal orchestration
│   │   ├── main.jsx                     # Vite entry point
│   │   └── index.css                    # Tailwind CSS imports & medieval font rules
│   └── dist/                            # Production static assets served by FastAPI
```

---

## 2. API Endpoint Catalog (`backend/app/main.py`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check endpoint |
| `GET` | `/api/v1/metrics` | System uptime & memory metrics |
| `GET` | `/api/v1/game/items` | Full item catalog (seeds, crops, tools, materials, tech) |
| `GET` | `/api/v1/game/crafting-recipes` | Crafting recipes database |
| `GET` | `/api/v1/game/cooking-recipes` | Cooking recipes database |
| `GET` | `/api/v1/game/fish-catalog` | Fish species and catch difficulty |
| `GET` | `/api/v1/game/zones` | 8-region world travel zones |
| `GET` | `/api/v1/game/blueprints` | Blueprint structures catalog |
| `POST` | `/api/v1/game/blueprints/build/{slot_id}` | Build blueprint structure onto farm grid |
| `POST` | `/api/v1/game/tractor/mount/{slot_id}` | Mount or dismount farm tractor |
| `POST` | `/api/v1/game/tractor/attachment/{slot_id}` | Switch active tractor attachment |
| `POST` | `/api/v1/game/zones/travel/{slot_id}` | Travel player to another region |
| `GET` | `/api/v1/game/tutorial/{slot_id}` | Get newcomer tutorial state |
| `POST` | `/api/v1/game/tutorial/claim/{slot_id}` | Claim completed tutorial reward |
| `GET` | `/api/v1/game/npc-quests/{slot_id}` | Available NPC side quests |
| `POST` | `/api/v1/game/npc-quests/accept/{slot_id}` | Accept NPC side quest |
| `POST` | `/api/v1/game/npc-quests/turn-in/{slot_id}`| Turn in completed NPC side quest |
| `POST` | `/api/v1/game/npc/gift/{slot_id}` | Give gift item to NPC for affection |
| `GET` | `/api/v1/game/storyline/{slot_id}` | Storyline chapters progression |
| `GET` | `/api/v1/game/save/{slot_id}` | Retrieve game save slot state |
| `POST` | `/api/v1/game/save/{slot_id}` | Save complete game state snapshot |
| `POST` | `/api/v1/game/sleep/{slot_id}` | End day, advance crops, calculate profits |
| `POST` | `/api/v1/game/unlock-tech/{slot_id}` | Unlock tech tree node |
| `POST` | `/api/v1/game/dungeon-clear/{slot_id}`| Clear dungeon floor and claim rewards |
| `POST` | `/api/v1/game/cook/{slot_id}` | Cook dish using ingredients |
| `POST` | `/api/v1/game/catch-fish/{slot_id}` | Record caught fish to inventory |
| `POST` | `/api/v1/game/animals/pet/{slot_id}` | Pet sheep or chicken for happiness & gold |
| `WS` | `/ws/world/{world_id}` | WebSocket multiplayer real-time channel |

---

## 3. Data Models Inventory (`backend/app/game_store.py`)

1. **`Item`**: `id`, `name`, `category`, `description`, `sell_price`, `energy_gain`, `stamina_cost`, `era_tier`.
2. **`CropState`**: `crop_id`, `stage`, `max_stage`, `days_grown`, `watered_today`.
3. **`FarmTile`**: `tile_type` (`grass`, `tilled`, `watered`, `obstacle_rock`, `obstacle_wood`, `obstacle_weed`), `crop` (Optional `CropState`), `structure_type` (Optional str), `fertilizer` (Optional str).
4. **`NPCProfile`**: `id`, `name`, `title`, `personality`, `likes`, `dislikes`, `dialogues`, `affection_level`, `affection_points`, `gifted_today`, `schedule`.
5. **`TechNode`**: `id`, `name`, `era`, `cost_gold`, `cost_aether`, `required_nodes`, `unlocked`.
6. **`GameSave`**: Comprehensive model encompassing `slot_id`, `save_name`, `saved_at`, `player`, `world`, `farm_grid`, `npcs`, `tech_tree`, `active_quests`, `completed_quests`, `active_npc_quests`, `completed_npc_quests`, `storyline_unlocked`, `shipping_bin`.

---

## 4. Audio Synthesizer Inventory (`frontend/src/game/SoundFx.js`)

All sounds synthesized procedurally with Web Audio API (Zero external assets):
- `playHoe()`: 120Hz -> 45Hz triangle wave
- `playWater()`: 380Hz, 520Hz, 680Hz stepped sine waves
- `playHarvest()`: A Major arpeggio (440, 554, 659, 880 Hz)
- `playChopTree()`: 160Hz -> 60Hz sawtooth wave with wood impulse
- `playTractorEngine()`: 45Hz - 65Hz rhythmic low rumble
- `playTractorHorn()`: 311Hz & 370Hz dual harmonic horn chord
- `playBlueprintPlace()`: 587Hz, 880Hz, 1174Hz sine resonance
- `playPickaxe()`, `playAxe()`, `playFishBite()`, `playLevelUp()`, `playClick()`.
