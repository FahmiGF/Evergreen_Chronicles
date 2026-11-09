import heapq
import math
import random
from typing import List, Tuple, Dict, Any, Optional

def heuristic(a: Tuple[int, int], b: Tuple[int, int]) -> float:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star_search(
    start: Tuple[int, int],
    goal: Tuple[int, int],
    blocked_set: set,
    grid_w: int = 16,
    grid_h: int = 16
) -> List[Tuple[int, int]]:
    """A* Pathfinding algorithm to navigate between grid cells while dodging obstacles."""
    if start == goal:
        return [start]

    frontier = []
    heapq.heappush(frontier, (0, start))
    came_from: Dict[Tuple[int, int], Optional[Tuple[int, int]]] = {start: None}
    cost_so_far: Dict[Tuple[int, int], float] = {start: 0}

    while frontier:
        _, current = heapq.heappop(frontier)

        if current == goal:
            break

        cx, cy = current
        # 4-directional cardinal movement
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            next_node = (cx + dx, cy + dy)
            nx, ny = next_node

            # Within bounds?
            if not (1 <= nx < grid_w - 1 and 1 <= ny < grid_h - 1):
                continue
            # Blocked by obstacle or building?
            if next_node in blocked_set and next_node != goal:
                continue

            new_cost = cost_so_far[current] + 1
            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                priority = new_cost + heuristic(goal, next_node)
                heapq.heappush(frontier, (priority, next_node))
                came_from[next_node] = current

    # Reconstruct path
    if goal not in came_from:
        return []

    path = []
    curr = goal
    while curr:
        path.append(curr)
        curr = came_from[curr]
    path.reverse()
    return path

class NPCAgent:
    def __init__(self, npc_id: str, name: str, title: str, start_pos: Tuple[float, float], waypoints: List[Tuple[int, int]], avatar: str):
        self.id = npc_id
        self.name = name
        self.title = title
        self.x = start_pos[0]
        self.y = start_pos[1]
        self.waypoints = waypoints
        self.wp_index = 0
        self.avatar = avatar
        self.path: List[Tuple[int, int]] = []
        self.direction = "down"
        self.is_walking = False
        self.is_talking = False
        self.talk_timer = 0.0
        self.step_timer = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "direction": self.direction,
            "is_walking": self.is_walking,
            "avatar": self.avatar,
            "is_talking": self.is_talking
        }

    def update(self, dt: float, blocked_set: set, grid_w: int = 16, grid_h: int = 16):
        if self.is_talking:
            self.talk_timer -= dt
            if self.talk_timer <= 0:
                self.is_talking = False
            return

        if not self.waypoints:
            return

        target_wp = self.waypoints[self.wp_index]
        cur_grid_pos = (int(round(self.x)), int(round(self.y)))

        # Need new path?
        if not self.path or len(self.path) <= 1:
            if cur_grid_pos == target_wp:
                # Arrived at waypoint, advance to next
                self.wp_index = (self.wp_index + 1) % len(self.waypoints)
                target_wp = self.waypoints[self.wp_index]

            self.path = a_star_search(cur_grid_pos, target_wp, blocked_set, grid_w, grid_h)
            if len(self.path) > 1 and self.path[0] == cur_grid_pos:
                self.path.pop(0)

        if self.path:
            next_tile = self.path[0]
            tx, ty = next_tile
            dx = tx - self.x
            dy = ty - self.y
            dist = math.hypot(dx, dy)

            # Move towards next tile
            speed = 1.25  # tiles per second
            if dist > 0.05:
                self.is_walking = True
                step = speed * dt
                if step >= dist:
                    self.x = tx
                    self.y = ty
                    self.path.pop(0)
                else:
                    self.x += (dx / dist) * step
                    self.y += (dy / dist) * step

                # Determine direction
                if abs(dx) > abs(dy):
                    self.direction = "right" if dx > 0 else "left"
                else:
                    self.direction = "down" if dy > 0 else "up"
            else:
                self.x = tx
                self.y = ty
                self.path.pop(0)
        else:
            self.is_walking = False

class NPCPathfindingManager:
    def __init__(self):
        self.npcs: Dict[str, NPCAgent] = {
            "npc_elara": NPCAgent(
                "npc_elara", "Elara", "Tabib Desa & Ahli Herbal",
                (4.0, 4.0),
                [(4, 4), (6, 5), (6, 8), (4, 7), (4, 4)],
                "🌿"
            ),
            "npc_rowan": NPCAgent(
                "npc_rowan", "Rowan", "Pandai Besi Kerajaan",
                (9.0, 5.0),
                [(9, 5), (10, 8), (10, 11), (8, 9), (9, 5)],
                "🔨"
            ),
            "npc_nessa": NPCAgent(
                "npc_nessa", "Nessa", "Insinyur Mesin & Penemu",
                (12.0, 9.0),
                [(12, 9), (9, 11), (7, 10), (10, 7), (12, 9)],
                "⚡"
            ),
            "npc_mira": NPCAgent(
                "npc_mira", "Mira", "Pedagang Umum Pasar",
                (14.0, 6.0),
                [(14, 6), (11, 6), (8, 5), (11, 4), (14, 6)],
                "🍎"
            )
        }

    def get_blocked_set(self, farm_grid: List[List[Dict[str, Any]]]) -> set:
        blocked = set()
        # Buildings: Farmhouse (11..14, 1..3)
        for bx in range(11, 15):
            for by in range(1, 4):
                blocked.add((bx, by))
        # Pond: (2..3, 2..3)
        for px in range(2, 4):
            for py in range(2, 4):
                blocked.add((px, py))
        # Shipping Bin (14, 5)
        blocked.add((14, 5))

        # Solid obstacles on grid
        if farm_grid:
            for row in farm_grid:
                for tile in row:
                    ttype = tile.get("tile_type")
                    if ttype in ["obstacle_rock", "obstacle_wood"]:
                        blocked.add((tile["x"], tile["y"]))

        return blocked

    def update_all(self, dt: float, farm_grid: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        blocked = self.get_blocked_set(farm_grid)
        results = []
        for agent in self.npcs.values():
            agent.update(dt, blocked)
            results.append(agent.to_dict())
        return results

    def talk_to_npc(self, npc_id: str, duration: float = 8.0):
        if npc_id in self.npcs:
            self.npcs[npc_id].is_talking = True
            self.npcs[npc_id].is_walking = False
            self.npcs[npc_id].talk_timer = duration

npc_manager = NPCPathfindingManager()
