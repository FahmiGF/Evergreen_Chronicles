# EVERGREEN CHRONICLES — MEGA EXPANSION SPECIFICATION V6

**Version:** 6.0.0  
**Status:** IMPLEMENTED & PRODUCTION READY  
**Architecture:** Server-Authoritative Simulation Engine (FastAPI) + React 18 / Vite High-Performance Canvas  
**Compatibility:** Fully backward-compatible with V1 (Core), V2 (Civilization), V3 (Quests/Market), and V4 (Mastery & Events).

---

## 1. ADVANCED SKILL TREE & PRESTIGE OVERHAUL

### 1.1 34 Core Skills across 9 Distinct Categories
The character mastery system supports Level 1–100 progression with non-linear exponential XP scaling (`XP = 100 * (Level - 1)^1.65`).
1. **Agriculture**: Farming, Gardening, Orchard, Soil Science
2. **Livestock**: Animal Care, Ranching, Wildlife Mastery
3. **Industry**: Crafting, Smithing, Engineering, Automation
4. **Nature**: Foraging, Herbalism, Beekeeping, Forestry
5. **Adventure**: Exploration, Mining, Archaeology, Navigation
6. **Ocean**: Freshwater Fishing, Deep Sea Fishing, Sailing, Diving
7. **Social**: Friendship, Trading, Leadership, Cooking
8. **Technology**: Robotics, AI Systems, Research, Energy Systems
9. **Creativity**: Construction & Architecture, Interior Design, Landscaping, Photography

### 1.2 Skill Synergies Matrix
Dynamic multiplier bonuses activate when pairs of complementary skills develop:
- **Agronomy & Culinary** (`syn_farm_cook`): +25% bonus energy & sell value for prepared meals.
- **Mining & Mechanical Engineering** (`syn_mine_eng`): +30% yield from smelting furnaces.
- **Ocean Fisher & Master Chef** (`syn_fish_cook`): +20% recipe mastery for abyssal seafood.
- **Pastoralist & Merchant** (`syn_anim_trade`): +35% price premium on certified organic wool and dairy.
- **Robotics Swarm & Precision Farming** (`syn_robo_farm`): +40% automaton harvesting speed.
- **Sea Navigator & Deep Sea Diver** (`syn_sail_fish`): +50% sunken kingdom treasure drop rates.

### 1.3 Permanent Prestige Progression & Safe Refund
- Reaching Level 50+ in any skill unlocks **Skill Prestige Elevation**, awarding +10 Prestige Points (PP) and legendary titles.
- **6 Permanent Upgrade Branches**:
  1. *Prosperity*: Seed discounts, high-value contracts, warehouse expansion.
  2. *Nature*: Giant crops (+25%), greenhouse auras, eternal soil moisture.
  3. *Industry*: Blueprint access, zero-jam diagnostics, twin-bar casting.
  4. *Discovery*: Secret path overlays, rapid relic identification, portal longevity.
  5. *Fellowship*: Gift preferences insight, voluntary village watering aid, max happiness.
  6. *Innovation*: AI weather/market forecast, quantum battery lifespans, titan automata.
- **Idempotent Safe Reset**: Spending points can be refunded at any time via `/api/v1/game/prestige/reset` with 100% PP returned and **zero risk** to items, farm tiles, or quest progression.

---

## 2. GRAND ENCYCLOPEDIA & WORLD JOURNAL

### 2.1 38 Comprehensive Index Categories
Indexed, paginated, and searchable catalog tracking everything discoverable across the realm:
`crops`, `vegetables`, `fruits`, `flowers`, `trees`, `fish`, `minerals`, `gems`, `artifacts`, `foods`, `recipes`, `drinks`, `animals`, `pets`, `mounts`, `npcs`, `buildings`, `furniture`, `tools`, `equipment`, `robots`, `machines`, `vehicles`, `boats`, `biomes`, `islands`, `portals`, `quests`, `events`, `achievements`, `skills`, `blueprints`, `research`, `treasures`, `weather`, `music`, `photos`, `museum`.

### 2.2 Discovery Details & Tier Completion Rewards
- Each entry features: Unique ID, localized name, rarity tier, seasonal availability, geographic location, and gameplay hints.
- Unrevealed items display mystery silhouettes and discovery prompts.
- **Milestone Rewards** (10%, 25%, 50%, 75%, 100%):
  - *10% Pengamat Pemula*: +500 Gold, +1 PP, Gelar "Kolektor Pemula"
  - *25% Pencari Jejak*: +1,500 Gold, +2 PP, Gelar "Naturalis Handal"
  - *50% Penjelajah Ulung*: +4,000 Gold, +3 PP, Gelar "Pakar Ensiklopedia"
  - *75% Cendekiawan Alam*: +10,000 Gold, +5 PP, Gelar "Kurator Utama"
  - *100% Master Penguasa*: +25,000 Gold, +10 PP, Gelar "Legenda Abadi Evergreen"

---

## 3. GLOBAL LEADERBOARDS & ANTI-CHEAT ARCHITECTURE

### 3.1 20 Competitive Categories
1. Overall Mastery
2. Farming Legends
3. Mining Masters
4. Fishing Grandmasters
5. Culinary Masters
6. Ranchers & Animal Care
7. Wealth & Net Worth
8. Master Builders
9. Realm Explorers
10. Mount Collectors
11. Pet Caretakers
12. Robotics Pioneers
13. Guild Renown
14. Festival Champions
15. Museum Curators
16. Prestige Grandmasters
17. Archaeology Scholars
18. Deep Sea Divers
19. Foresters
20. Technology Architects

### 3.2 Period Filters & Server-Authoritative Net Worth
- Time horizons: `all_time`, `season`, `monthly`, `weekly`, `daily`.
- Client scores are never accepted at face value; the backend calculates Net Worth from liquid gold, farm developments (tilled/fertilized tiles, mature crops), inventory asset valuations, vehicle investments, and PP balances.
- Granular player privacy toggles: Public Profile, Show Net Worth, Show Guild.

---

## 4. IN-GAME ADMIN CONTROL CENTER (EVERGREEN DASHBOARD)

### 4.1 RBAC Roles Hierarchy
- `player`
- `moderator`
- `qa_tester`
- `event_manager`
- `developer`
- `administrator`
- `super_admin`

### 4.2 24 Core Administrative Modules
1. **Telemetry & Real-Time Monitoring**: 60 TPS, latency, active entities breakdown, memory usage.
2. **Event Staging**: Isolated test instances for Carnival, Halloween Madness, and Starfall Solstice.
3. **Quest Lab**: Objective simulation, acyclic graph validation, reward allocation testing.
4. **World Clock & Weather**: Advancement sliders, season shifts, instant weather triggers.
5. **Economy Lab**: Commodity market price shocks (+/- 50%, 3x multiplier) and volatility simulations.
6. **Farming Lab**: Instant whole-grid crop maturation to Stage 4.
7. **Robotics Lab**: Fleet diagnostics (Harvester Alpha MK-4, Sprinkler Drone Beta, Planter Delta).
8. **QA Automation Runner**: Live test matrix execution with pass/fail metrics and AI QA analysis.
9. **Immutable Audit Trail**: Append-only log recording admin ID, action, target, timestamp, and justification.
