# CHANGELOG — EVERGREEN CHRONICLES

All notable changes to this project will be documented in this file.

---

## [2.0.0] — 2026-11-09
### Major Expansion: Living Civilization Engine, Dynamic Economy & Interactive NPC Brain

#### Added
- **7-Layer Civilization Simulation Engine**:
  - Implemented 7 interconnected societal layers: Population, Economy, Infrastructure, Social, Governance, Environment, and Culture.
  - Added Civilization Era Progression across 4 eras: Medieval Realm, Industrial Expansion, Modern Metropolitan, and Arcane Future with research and material advancement criteria.
- **Dynamic Market & Business Simulation**:
  - Fully simulated supply-demand commodity pricing with price ceilings, price floors, and price smoothing.
  - Added Town Enterprises & Workshops: Cedric's Bakery, Rowan's Blacksmith, Elara's Botanicals, and Nessa's Aether Engineering Lab with active status and daily revenue tracking.
  - Implemented atomic buy/sell commodity trading endpoints.
- **Living NPC Brain & Routine System**:
  - Autonomous 24-hour routine schedules for living NPCs (Elara, Rowan, Nessa, Cedric) dynamically adapting based on in-game time of day and weather.
  - Multi-dimensional relationship tracking: Trust, Respect, Friendship, Familiarity, and Cooperation.
  - Persistent, bounded NPC Memory Bank storing significant player actions and emotional impacts.
  - Procedural Dynamic Quest Generator creating town missions driven by actual resource shortages.
- **Client & UI Systems**:
  - Built `CivilizationDashboardModal.jsx` with tabbed views: Civilization Overview & Era Upgrade, Dynamic Market & Ticker, Living NPCs & Schedule Timeline, and Dynamic Town Quests.
  - Integrated HUD button `[🏛️ Peradaban [C]]` and keyboard shortcut `KeyC`.
  - Upgraded `DialogueBox.jsx` with contextual interaction topics (`routine`, `gossip`) and relationship feedback.
- **Technical Excellence & Data Integrity**:
  - Upgraded `GameSave` data model with SHA-256 cryptographic checksums and atomic serialization protocols.
  - Simulation Level of Detail (LOD) architecture for efficient CPU utilization.
  - Expanded automated test suite to 25 test cases with 100% pass rate.
  - Published comprehensive architectural specifications: `DESIGN_SYSTEM.md`, `ART_BIBLE.md`, `SERVER_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `PERFORMANCE_REPORT.md`, `TESTING_REPORT.md`.

---

## [1.5.0] — 2026-11-09
### Expansion: Character Studio & World Landscape Editor
- 10 playable races with unique lore and passive perks.
- Complete anatomical and wardrobe customization with live 60 FPS pixel preview.
- 8 terrain landscape painter brushes with 2D and 3D isometric projection support.
- Realtime WebSocket multiplayer delta action synchronization.
