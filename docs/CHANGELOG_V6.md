# CHANGELOG — VERSION 6.0.0

## [6.0.0] — MEGA EXPANSION V6: PROGRESSION, ENCYCLOPEDIA, LEADERBOARDS & CONTROL CENTER

### Added
- **Advanced Mastery Engine (`progression_engine.py`)**:
  - 34 Skills across 9 distinct categories (Agriculture, Livestock, Industry, Nature, Adventure, Ocean, Social, Technology, Creativity).
  - 6 Skill Synergies with percentage multipliers (`syn_farm_cook`, `syn_mine_eng`, `syn_fish_cook`, `syn_anim_trade`, `syn_robo_farm`, `syn_sail_fish`).
  - 6 Permanent Prestige Upgrade Branches with idempotent refund and zero inventory loss (`purchase_prestige_upgrade`, `reset_prestige_points`).
  - Prestige Elevation (Rank 1–5, Level 50+ unlock, +10 PP reward, custom titles).
- **Grand Encyclopedia & Journal Engine (`encyclopedia_engine.py`)**:
  - 38 Categorical indices with paginated search (`/api/v1/game/encyclopedia/entries`).
  - Discovery completion tracking and milestone claims (10%, 25%, 50%, 75%, 100%) with gold, PP, and exclusive titles.
- **Global Leaderboard & Anti-Cheat Engine (`leaderboard_engine.py`)**:
  - 20 Competitive ranking categories with All-time, Season, Monthly, Weekly, and Daily period filters.
  - Server-authoritative Net Worth calculation formula combining liquid gold, farm development, inventory valuation, and vehicles.
  - Player profile cards with privacy controls (`public_profile`, `show_net_worth`, `show_guild`).
- **In-Game Admin Control Center (`admin_engine.py`)**:
  - RBAC permission checking across 7 roles (`player` to `super_admin`).
  - 24 Control modules: System Telemetry (60 TPS), Isolated Event Staging (Carnival, Halloween, Starfall), Quest Lab, World Clock, Weather changer, Economy shock simulator, Farming instant mature booster, Robotics fleet diagnostics, and Automated QA suite runner.
  - Append-only immutable audit trail recording admin actions.
- **Frontend Components & HUD Additions**:
  - `GrandEncyclopediaModal.jsx`: 38-category sidebar, search, rarity badges, and milestone claims.
  - `LeaderboardModal.jsx`: Podium 1st/2nd/3rd, competitive rankings, profile card, and privacy toggles.
  - `AdminControlCenterModal.jsx`: High-tech dashboard with telemetry, staging controls, sliders, and QA runner.
  - `HUD.jsx`: Added `[📚 Ensiklopedia]`, `[🏆 Peringkat]`, and glowing `[⚙️ ADMIN]` buttons.
  - `App.jsx`: Global key listeners (`F1`/`~` for Admin, `J` for Encyclopedia) and modal lifecycle integration.

### Updated
- `game_store.py`: Upgraded default GameSave version to `6.0.0`, added `admin_role`, `prestige_points`, `privacy_settings`, and `encyclopedia_discoveries` to default save profile.
- `main.py`: Mounted all V6 REST API endpoints.
- `README.md`: Documented V6 systems, keybindings, and architecture.
