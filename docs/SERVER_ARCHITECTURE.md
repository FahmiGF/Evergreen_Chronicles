# EVERGREEN CHRONICLES — SERVER & MULTIPLAYER ARCHITECTURE
**Document Version:** 2.0.0  
**Status:** Approved Technical Architecture  
**Scope:** Client-Server Lifecycle, WebSocket State Synchronization, Simulation LOD, Reliability

---

## 1. High-Level Modular Monolith Architecture

```
                    ┌────────────────────────────┐
                    │     Vite React Client      │
                    │  (Canvas 2D/3D + WebAudio) │
                    └─────────────┬──────────────┘
                                  │
                   HTTPS REST API │ WebSocket (Realtime)
                   (/api/v1/...)  │ (/ws/world/{id})
                                  │
                    ┌─────────────▼──────────────┐
                    │      FastAPI Gateway       │
                    │   CORS, Auth, Compression │
                    └─────────────┬──────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
┌──────▼───────┐          ┌───────▼──────┐           ┌───────▼──────┐
│  Civilization│          │  World State │           │  WebSocket   │
│  & Economy   │          │  Repository  │           │  Hub Manager │
│  Engine      │          │  (Pydantic)  │           │  (Pub/Sub)   │
└──────┬───────┘          └───────┬──────┘           └───────┬──────┘
       │                          │                          │
       │     Atomic File Engine   │                          │
       └──────────────► ┌─────────▼────────┐ ◄───────────────┘
                        │ SHA-256 Checksum │
                        │  Storage Engine  │
                        │ (save_1.json)    │
                        └──────────────────┘
```

---

## 2. Simulation LOD (Level of Detail)

To ensure boundless scalability without CPU choking:

| LOD Tier | Distance from Player | AI Decision Cycle | Visual Details | Audio Footprint |
|---|---|---|---|---|
| **Tier 0: Near** | $\le 6$ tiles | Every tick (16ms) | Full skeletal layers, breathing idle, facial emotes | Local footstep & tool audio |
| **Tier 1: Nearby**| 7 - 20 tiles | Every 500ms | Pathfinding waypoint interpolation, simplified routine | Ambient distant activity |
| **Tier 2: Distant**| Outside current chunk | Every 10 seconds | Statistical schedule calculation (no rendering) | Silent |

---

## 3. Realtime Networking & Delta Replication

- **WebSocket Connection**: Persistent bi-directional channel on `/ws/world/{client_id}`.
- **Heartbeat / Ping**: Periodic 5-second ping-pong monitoring network round-trip time (RTT).
- **Delta Actions**: Actions are transmitted as structured events rather than full snapshot blasts:
  - `paint_terrain`: `{ x, y, tile_type }`
  - `build_blueprint`: `{ x, y, structure_id }`
  - `world_action`: `{ action_type: 'till' | 'water' | 'plant' | 'harvest', x, y }`
  - `player_moved`: `{ x, y, direction, is_moving, action }`

---

## 4. Atomic Save & Data Integrity Protocol

1. **In-Memory Mutex Lock**: Write operations are serialized to prevent concurrent race conditions.
2. **Two-Stage Atomic Commit**:
   - Step A: Data is serialized into a temporary checkpoint file (`save_slot_1.json.tmp`).
   - Step B: A SHA-256 cryptographic checksum is calculated and written to the metadata header.
   - Step C: The temporary file is atomically renamed (`os.replace`) to `save_slot_1.json`, guaranteeing zero partial/corrupted writes even if the process is killed mid-save.
   - Step D: Previous healthy save is archived to `save_slot_1_backup.json`.
