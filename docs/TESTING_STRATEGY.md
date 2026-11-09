# EVERGREEN CHRONICLES — TESTING STRATEGY & QA SPECIFICATION
**Date**: November 9, 2026  
**Standards**: Zero Tolerance for Fake Features, Data Loss, Broken Projections, or Frame Drops  

---

## 1. Testing Hierarchy & Verification Gates

```
                    ┌────────────────────────┐
                    │  Stress & Concurrency  │ (30+ Clients, 100k Tiles)
                    ├────────────────────────┤
                    │ End-to-End Acceptance  │ (Full Game Loops & Playtesting)
                    ├────────────────────────┤
                    │   Integration Tests    │ (Save/Load, Websockets, API)
                    ├────────────────────────┤
                    │    Unit Test Suite     │ (A*, Math Projections, Schemas)
                    └────────────────────────┘
```

---

## 2. Test Execution Categories

### 2.1 Backend Unit & Integration Tests (`backend/tests/test_game_api.py`)
Run command:
```powershell
cd "backend" ; python -m pytest tests -v
```
**Verification Coverage**:
1. Health check & system metrics (`/api/v1/health`, `/api/v1/metrics`).
2. Catalog completeness (all items, tools, crops, seeds, recipes, zones, blueprints).
3. Save/load lifecycle (`GET /api/v1/game/save/1`, `POST /api/v1/game/save/1`) ensuring complete state preservation.
4. Overnight sleep calculations (`POST /api/v1/game/sleep/1`) verifying crop stage advancement and gold earnings.
5. Blueprint build placement (`POST /api/v1/game/blueprints/build/1`) verifying resource deduction and tile updates.
6. Tractor mount & attachment switching (`POST /api/v1/game/tractor/mount/1`, `POST /api/v1/game/tractor/attachment/1`).
7. NPC AI pathfinding (`a_star_search`) ensuring obstacle avoidance and waypoint generation.
8. NPC affection levels & gift limits (`POST /api/v1/game/npc/gift/1`).
9. Character studio profile & race attributes persistence roundtrip.

### 2.2 Multiplayer WebSocket Stress Benchmark (`backend/tests/stress_test.py`)
Run command:
```powershell
cd "backend" ; python tests/stress_test.py
```
**Acceptance Criteria**:
- **30 Concurrent Simulated Players** broadcasting 50Hz movements, world actions, and chats.
- **Zero Connection Drop**: 30/30 (100.0%) successful connections.
- **Sub-15ms Latency**: Average ping latency < 15.0 ms.
- **High Packet Throughput**: > 500 packets/second handled smoothly without event loop stalls.

### 2.3 Frontend Compilation & Linting (`frontend`)
Run command:
```powershell
cd "frontend" ; npm run build
```
**Acceptance Criteria**:
- Zero build errors.
- Clean JSX parsing.
- Production bundle size < 400 KB gzipped.

---

## 3. Feature-by-Feature Definition of Done (DoD)

| Feature | Acceptance Criteria | Automated Test Required |
|---|---|---|
| **Character Studio** | Modifying skin, hair, face, horns, wings, or race immediately reflects in canvas sprite and persists after page refresh. | `test_character_profile_persistence()` |
| **Playable Races** | Selecting any of the 10 races applies specific visual features and passive gameplay perks. | `test_race_traits_and_perks()` |
| **Personality & Background** | Selecting personality traits and background origins modifies dialogue choices and NPC relationship rates. | `test_personality_dialogue_branches()` |
| **Landscape Editor** | Painting terrain (Grass, Sand, Snow, Swamp, Water) persists across saves without corrupting crop tiles. | `test_landscape_terrain_persistence()` |
| **3D Isometric View** | Canvas accurately converts `(gx, gy, gz)` to screen coordinates with depth sorting; no z-fighting or clipping. | `test_iso_math_roundtrip()` |
| **Blueprint CAD Mode** | Ghost cursor snaps to 16x16 grid; displays green for valid tiles, red for blocked tiles; builds structure upon click. | `test_blueprint_build_validation()` |
| **Driveable Tractor** | Player mounts with `KeyT`; speed increases to 235 px/s; 3 attachments (tiller, sprayer, mower) affect 3-tile wide swath. | `test_tractor_swath_mechanics()` |
| **Tree Species** | Chopping any of the 8 tree species with an axe decreases tree HP, shakes tree, flies wood chips, and grants species-specific wood. | `test_tree_chopping_and_drops()` |

---

## 4. Performance Budget & Memory Guardrails
- **Frame Rate**: Strictly 60 FPS (16.6ms frame budget).
- **Canvas Rendering Overhead**: < 7.0ms per frame.
- **Memory Consumption**: Chrome heap allocated < 100 MB; zero memory leaks across 1,000 game loop cycles.
- **Garbage Collection**: Particles, floating texts, and transient effects auto-purged from memory when expired.
