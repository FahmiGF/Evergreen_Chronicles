# EVERGREEN CHRONICLES — DATA SCHEMAS & SIMULATION STATE
**Document Version:** 2.0.0  
**Scope:** Save Slot Schema, Civilization Layers, Dynamic Economy, NPC Brain, Memory

---

## 1. Top-Level Save Document Schema (`GameSave`)

```json
{
  "version": "2.0.0",
  "slot_id": 1,
  "checksum": "sha256-hash-value",
  "saved_at": 1731154000.0,
  "player": {
    "name": "Fahmi",
    "character_profile": {
      "race": "high_elf",
      "skin_tone": "#fef3c7",
      "hair_style": "adventurer",
      "hair_color": "#78350f",
      "personality": "Curious",
      "background": "Adventurer"
    },
    "wardrobe": {
      "headwear": "hat_straw",
      "top": "tunic_red_classic",
      "bottom": "pants_blue_overalls",
      "footwear": "boots_leather_work",
      "back_item": "backpack_leather"
    },
    "gold": 4500,
    "aether_shards": 32,
    "inventory": []
  },
  "world": {
    "year": 1,
    "season": "Spring",
    "day": 14,
    "time_hour": 10,
    "time_minute": 30,
    "weather": "Sunny"
  },
  "civilization": {
    "current_era": "medieval",
    "prosperity_score": 1250,
    "population_count": 48,
    "layers": {
      "population": { "happiness": 85, "growth_rate": 1.05 },
      "economy": { "market_liquidity": 12000, "trade_volume": 450 },
      "infrastructure": { "road_quality": 78, "water_coverage": 82 },
      "social": { "cohesion": 90, "crime_rate": 2 },
      "governance": { "stability": 92, "tax_rate": 5 },
      "environment": { "soil_fertility": 88, "forest_health": 95 },
      "culture": { "tradition_strength": 80, "festival_readiness": 65 }
    },
    "businesses": [
      {
        "id": "biz_bakery",
        "name": "Toko Roti Hangat Cedric",
        "owner_npc": "npc_cedric",
        "workplace": "Kedai Roti Desa",
        "inputs": ["crop_wheat", "crop_strawberry"],
        "outputs": ["food_bread", "food_berry_pie"],
        "daily_revenue": 140
      }
    ]
  },
  "market": {
    "commodities": {
      "wood": { "base_price": 5, "current_price": 6, "supply": 140, "demand": 180 },
      "stone": { "base_price": 4, "current_price": 4, "supply": 200, "demand": 190 },
      "wheat": { "base_price": 8, "current_price": 10, "supply": 50, "demand": 110 },
      "iron_ore": { "base_price": 20, "current_price": 24, "supply": 30, "demand": 75 },
      "bread": { "base_price": 15, "current_price": 16, "supply": 45, "demand": 60 }
    }
  },
  "npcs": [
    {
      "id": "npc_rowan",
      "name": "Rowan",
      "race": "dwarf",
      "profession": "Blacksmith & Tempa",
      "home": "Rumah Bengkel Tempa",
      "workplace": "Bengkel Tempa Rowan",
      "current_schedule": {
        "activity": "working",
        "location": "bengkel_tempa",
        "status_text": "Menempa beliung baja di atas paron bara"
      },
      "relationships": {
        "trust": 65,
        "respect": 72,
        "friendship": 50,
        "reputation": "Pandai Besi Andal"
      },
      "memories": [
        {
          "event_id": "mem_fixed_forge_01",
          "summary": "Pemain memasok 10 bijih besi saat krisis material.",
          "timestamp": 1731150000.0,
          "emotional_impact": "grateful"
        }
      ]
    }
  ]
}
```
