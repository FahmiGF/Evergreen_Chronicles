import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import WebSocket

class WorldWebSocketHub:
    def __init__(self):
        # client_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # client_id -> Player Data
        self.connected_players: Dict[str, Dict[str, Any]] = {}
        # Metrics
        self.messages_received_count = 0
        self.messages_broadcast_count = 0
        self.peak_connections = 0
        self.start_time = time.time()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, client_id: str, name: str = "Pengelana", color: str = "#3b82f6"):
        await websocket.accept()
        async with self._lock:
            self.active_connections[client_id] = websocket
            self.connected_players[client_id] = {
                "id": client_id,
                "name": name,
                "color": color,
                "x": 7.0 * 40,
                "y": 7.0 * 40,
                "direction": "down",
                "is_moving": False,
                "action": None,
                "chat_message": "",
                "chat_timer": 0,
                "joined_at": time.time()
            }
            if len(self.active_connections) > self.peak_connections:
                self.peak_connections = len(self.active_connections)

        # Broadcast player joined
        await self.broadcast({
            "type": "player_joined",
            "player": self.connected_players[client_id],
            "total_online": len(self.connected_players)
        }, exclude_client=client_id)

        # Send initial world roster to the new player
        await websocket.send_text(json.dumps({
            "type": "init_roster",
            "self_id": client_id,
            "players": list(self.connected_players.values()),
            "total_online": len(self.connected_players)
        }))

    async def disconnect(self, client_id: str):
        async with self._lock:
            self.active_connections.pop(client_id, None)
            player_info = self.connected_players.pop(client_id, None)

        if player_info:
            await self.broadcast({
                "type": "player_left",
                "client_id": client_id,
                "name": player_info.get("name", "Pemain"),
                "total_online": len(self.connected_players)
            })

    async def broadcast(self, message: Dict[str, Any], exclude_client: Optional[str] = None):
        msg_str = json.dumps(message)
        dead_connections = []

        async with self._lock:
            targets = [
                (cid, ws) for cid, ws in self.active_connections.items()
                if cid != exclude_client
            ]

        for cid, ws in targets:
            try:
                await ws.send_text(msg_str)
                self.messages_broadcast_count += 1
            except Exception:
                dead_connections.append(cid)

        # Cleanup failed connections
        if dead_connections:
            for cid in dead_connections:
                await self.disconnect(cid)

    async def broadcast_world_action(self, action_type: str, x: int, y: int, details: Optional[Dict[str, Any]] = None):
        """Helper to broadcast world action events to all connected clients."""
        await self.broadcast({
            "type": "world_action_sync",
            "action_type": action_type,
            "x": x,
            "y": y,
            "details": details or {}
        })

    async def handle_client_message(self, client_id: str, raw_data: str, farm_grid: List[List[Dict[str, Any]]]):
        self.messages_received_count += 1
        try:
            data = json.loads(raw_data)
        except Exception:
            return

        msg_type = data.get("type")

        # 1. MOVEMENT & ACTION UPDATE
        if msg_type == "move":
            player = self.connected_players.get(client_id)
            if player:
                player["x"] = data.get("x", player["x"])
                player["y"] = data.get("y", player["y"])
                player["direction"] = data.get("direction", player["direction"])
                player["is_moving"] = data.get("is_moving", False)
                player["action"] = data.get("action", None)

                # Broadcast position to others
                await self.broadcast({
                    "type": "player_moved",
                    "player": player
                }, exclude_client=client_id)

        # 2. CHAT MESSAGE
        elif msg_type == "chat":
            content = data.get("message", "").strip()
            player = self.connected_players.get(client_id)
            sender_name = player.get("name", "Pemain") if player else "Anonim"
            sender_color = player.get("color", "#38bdf8") if player else "#38bdf8"

            if content:
                if player:
                    player["chat_message"] = content
                    player["chat_timer"] = 5.0

                await self.broadcast({
                    "type": "chat_message",
                    "sender_id": client_id,
                    "sender_name": sender_name,
                    "sender_color": sender_color,
                    "message": content,
                    "timestamp": time.strftime("%H:%M:%S")
                })

        # 3. WORLD ACTION (Till, Water, Plant, Harvest, Place Structure)
        elif msg_type == "world_action":
            action_type = data.get("action_type") # "till", "water", "plant", "harvest", "place", "clear"
            tx = data.get("x")
            ty = data.get("y")
            details = data.get("details", {})

            # Apply to persistent farm_grid if valid
            if 0 <= ty < len(farm_grid) and 0 <= tx < len(farm_grid[0]):
                tile = farm_grid[ty][tx]
                if action_type == "till":
                    tile["tile_type"] = "tilled"
                elif action_type == "water":
                    tile["tile_type"] = "watered"
                    if tile.get("crop"):
                        tile["crop"]["watered_today"] = True
                elif action_type == "plant":
                    tile["crop"] = {
                        "crop_id": details.get("crop_id", "crop_parsnip"),
                        "stage": 0,
                        "max_stage": 4,
                        "days_grown": 0,
                        "watered_today": tile["tile_type"] == "watered"
                    }
                elif action_type == "harvest":
                    tile["crop"] = None
                    tile["tile_type"] = "tilled"
                elif action_type == "clear":
                    tile["tile_type"] = "grass"
                elif action_type == "place":
                    tile["structure_type"] = details.get("structure_type", "sprinkler")

            # Broadcast world state mutation to ALL players
            await self.broadcast({
                "type": "world_action_sync",
                "action_type": action_type,
                "x": tx,
                "y": ty,
                "details": details,
                "performer_id": client_id
            })

        # 4. PING / LATENCY CHECK
        elif msg_type == "ping":
            ws = self.active_connections.get(client_id)
            if ws:
                try:
                    await ws.send_text(json.dumps({
                        "type": "pong",
                        "client_time": data.get("client_time", 0),
                        "server_time": time.time() * 1000
                    }))
                except Exception:
                    pass

    def get_metrics(self) -> Dict[str, Any]:
        uptime_sec = max(1, round(time.time() - self.start_time, 1))
        return {
            "online_players": len(self.connected_players),
            "peak_connections": self.peak_connections,
            "messages_received": self.messages_received_count,
            "messages_broadcast": self.messages_broadcast_count,
            "uptime_seconds": uptime_sec,
            "throughput_msg_per_sec": round(
                (self.messages_received_count + self.messages_broadcast_count) / uptime_sec, 2
            )
        }

world_hub = WorldWebSocketHub()
