import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.game_store import game_store, ITEMS_DATABASE, CRAFTING_RECIPES

app = FastAPI(
    title="Evergreen Chronicles Game Engine API",
    description="Backend engine for the 2D Top-Down RPG Farming Simulation: Evergreen Chronicles",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UnlockTechRequest(BaseModel):
    tech_id: str

class DungeonClearRequest(BaseModel):
    slimes_defeated: int
    floors_cleared: int
    ores_looted: Dict[str, int]
    aether_earned: int
    gold_earned: int

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Evergreen Chronicles Engine",
        "version": "1.0.0",
        "grid_size": f"{game_store.grid_width}x{game_store.grid_height}"
    }

@app.get("/api/v1/game/items")
def get_all_items():
    """Return catalog of all game items (tools, seeds, crops, ores, materials, tech)."""
    return {k: v.model_dump() for k, v in ITEMS_DATABASE.items()}

@app.get("/api/v1/game/crafting-recipes")
def get_crafting_recipes():
    """Return crafting blueprints with materials and unlocking eras."""
    return CRAFTING_RECIPES

@app.get("/api/v1/game/save/{slot_id}")
def load_game(slot_id: int):
    """Retrieve game state for a given save slot (1-3). Initializes slot 1 if empty."""
    save = game_store.get_save(slot_id)
    if not save:
        if slot_id == 1:
            game_store._init_default_save()
            save = game_store.get_save(1)
        else:
            raise HTTPException(status_code=404, detail=f"Save slot {slot_id} is empty.")
    return save.model_dump()

@app.post("/api/v1/game/save/{slot_id}")
def save_game(slot_id: int, payload: Dict[str, Any] = Body(...)):
    """Save user game state into designated slot."""
    saved_obj = game_store.save_game(slot_id, payload)
    return {"message": f"Game successfully saved to Slot {slot_id}", "saved_at": saved_obj.saved_at}

@app.post("/api/v1/game/sleep/{slot_id}")
def sleep_advance_day(slot_id: int):
    """Trigger sleep routine: calculate shipped goods profit, advance crops, water tiles, restore stamina/HP, and evolve era."""
    summary = game_store.advance_day(slot_id)
    updated_save = game_store.get_save(slot_id)
    return {
        "summary": summary,
        "updated_state": updated_save.model_dump() if updated_save else None
    }

@app.post("/api/v1/game/unlock-tech/{slot_id}")
def unlock_tech(slot_id: int, req: UnlockTechRequest):
    """Attempt to unlock a technology node in the research tree."""
    res = game_store.unlock_tech(slot_id, req.tech_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to unlock tech"))
    return res

@app.post("/api/v1/game/dungeon-clear/{slot_id}")
def dungeon_clear(slot_id: int, req: DungeonClearRequest):
    """Process dungeon expedition results: add ores, aether shards, and gold to player save."""
    save = game_store.get_save(slot_id)
    if not save:
        raise HTTPException(status_code=404, detail=f"Save slot {slot_id} not found")

    player = save.player
    player["gold"] += req.gold_earned
    player["aether_shards"] += req.aether_earned

    # Add ores to inventory
    inventory = player.get("inventory", [])
    for ore_id, count in req.ores_looted.items():
        if count <= 0:
            continue
        # Check if already has stack
        stacked = False
        for slot in inventory:
            if slot and slot.get("item_id") == ore_id:
                slot["count"] += count
                stacked = True
                break
        if not stacked:
            for i, slot in enumerate(inventory):
                if slot is None:
                    inventory[i] = {"item_id": ore_id, "count": count}
                    stacked = True
                    break

    return {
        "message": "Dungeon rewards claimed!",
        "gold_earned": req.gold_earned,
        "aether_earned": req.aether_earned,
        "current_gold": player["gold"],
        "current_aether": player["aether_shards"]
    }

# Static file serving for React Frontend
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
