import React, { useRef, useEffect, useState } from 'react';
import { sounds } from './SoundFx';
import { multiplayer } from './MultiplayerManager';

const TILE_SIZE = 40;
const GRID_COLS = 16;
const GRID_ROWS = 16;

export default function GameCanvas({
  gameState,
  setGameState,
  equippedItem,
  onOpenShipping,
  onOpenBed,
  onOpenFishing,
  onOpenNpcDialogue,
  showNotification,
  localPlayerChatBubble
}) {
  const canvasRef = useRef(null);

  // Player position in pixel coordinates
  const playerPosRef = useRef({ x: 7 * TILE_SIZE, y: 7 * TILE_SIZE });
  const playerDirRef = useRef('down');
  const isMovingRef = useRef(false);
  const walkFrameRef = useRef(0);
  const toolSwingRef = useRef(null);

  // Hovered tile coordinates
  const [hoverTile, setHoverTile] = useState({ x: 7, y: 7 });

  // Floating text particles
  const floatingTextsRef = useRef([]);

  // Farm Animals (Pasture)
  const animalsRef = useRef([
    { id: 'sheep_1', type: 'sheep', x: 2.2 * TILE_SIZE, y: 9.5 * TILE_SIZE, vx: 0.1, vy: 0.1, timer: 0 },
    { id: 'chicken_1', type: 'chicken', x: 2.8 * TILE_SIZE, y: 11.2 * TILE_SIZE, vx: -0.15, vy: 0.1, timer: 0 },
    { id: 'chicken_2', type: 'chicken', x: 1.5 * TILE_SIZE, y: 10.5 * TILE_SIZE, vx: 0.1, vy: -0.1, timer: 0 }
  ]);

  // Rain particles
  const rainDropsRef = useRef(
    Array.from({ length: 45 }, () => ({
      x: Math.random() * (GRID_COLS * TILE_SIZE),
      y: Math.random() * (GRID_ROWS * TILE_SIZE),
      speed: 350 + Math.random() * 150,
      len: 8 + Math.random() * 6
    }))
  );

  // Night fireflies
  const firefliesRef = useRef(
    Array.from({ length: 15 }, () => ({
      x: Math.random() * (GRID_COLS * TILE_SIZE),
      y: Math.random() * (GRID_ROWS * TILE_SIZE),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random()
    }))
  );

  // Input keys tracking
  const keysDown = useRef({});

  const addFloatingText = (text, x, y, color = '#fef08a') => {
    floatingTextsRef.current.push({
      text,
      x,
      y,
      alpha: 1.0,
      color,
      vy: -0.7
    });
  };

  // Listen to remote world action sync
  useEffect(() => {
    const unsub = multiplayer.subscribe((event) => {
      if (event.type === 'world_action_sync') {
        const { action_type, x, y, details } = event.action;
        setGameState((prev) => {
          if (!prev || !prev.farm_grid) return prev;
          const grid = [...prev.farm_grid.map((r) => [...r])];
          if (grid[y] && grid[y][x]) {
            const tile = grid[y][x];
            if (action_type === 'till') tile.tile_type = 'tilled';
            else if (action_type === 'water') {
              tile.tile_type = 'watered';
              if (tile.crop) tile.crop.watered_today = true;
            } else if (action_type === 'plant') {
              tile.crop = {
                crop_id: details.crop_id || 'crop_parsnip',
                stage: 0,
                max_stage: 4,
                days_grown: 0,
                watered_today: tile.tile_type === 'watered'
              };
            } else if (action_type === 'harvest') {
              tile.crop = null;
              tile.tile_type = 'tilled';
            } else if (action_type === 'clear') {
              tile.tile_type = 'grass';
            } else if (action_type === 'place') {
              tile.structure_type = details.structure_type || 'sprinkler';
            }
          }
          return { ...prev, farm_grid: grid };
        });
      }
    });

    return () => unsub();
  }, [setGameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
        if (!e.repeat) keysDown.current[e.code] = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        triggerEquippedAction(hoverTile.x, hoverTile.y);
      }
      if (e.code === 'KeyF') {
        e.preventDefault();
        onOpenFishing();
      }
    };

    const handleKeyUp = (e) => {
      delete keysDown.current[e.code];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hoverTile, equippedItem, gameState]);

  // Main 60 FPS Render & Update Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let animTimer = 0;

    const gameLoop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      animTimer += dt;

      // 1. UPDATE PLAYER MOVEMENT
      const speed = 135;
      let dx = 0;
      let dy = 0;

      if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) dy -= 1;
      if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) dy += 1;
      if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) dx -= 1;
      if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const isMoving = dx !== 0 || dy !== 0;
      isMovingRef.current = isMoving;

      if (isMoving) {
        if (Math.abs(dx) > Math.abs(dy)) {
          playerDirRef.current = dx > 0 ? 'right' : 'left';
        } else {
          playerDirRef.current = dy > 0 ? 'down' : 'up';
        }
        walkFrameRef.current += dt * 8;

        const newX = playerPosRef.current.x + dx * speed * dt;
        const newY = playerPosRef.current.y + dy * speed * dt;

        const minX = 1 * TILE_SIZE;
        const maxX = (GRID_COLS - 2) * TILE_SIZE;
        const minY = 1 * TILE_SIZE;
        const maxY = (GRID_ROWS - 2) * TILE_SIZE;

        playerPosRef.current.x = Math.max(minX, Math.min(maxX, newX));
        playerPosRef.current.y = Math.max(minY, Math.min(maxY, newY));
      }

      // Sync movement to Multiplayer WebSocket
      multiplayer.sendMovement(
        playerPosRef.current.x,
        playerPosRef.current.y,
        playerDirRef.current,
        isMoving,
        toolSwingRef.current ? toolSwingRef.current.type : null
      );

      // Tool swing timer
      if (toolSwingRef.current) {
        toolSwingRef.current.timer -= dt;
        if (toolSwingRef.current.timer <= 0) toolSwingRef.current = null;
      }

      // Update Floating text
      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.alpha -= dt * 0.9;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      // Update Animals wander
      animalsRef.current.forEach((a) => {
        a.timer += dt;
        if (a.timer > 2.5) {
          a.timer = 0;
          a.vx = (Math.random() - 0.5) * 15;
          a.vy = (Math.random() - 0.5) * 15;
        }
        a.x = Math.max(1.2 * TILE_SIZE, Math.min(3.8 * TILE_SIZE, a.x + a.vx * dt));
        a.y = Math.max(8.5 * TILE_SIZE, Math.min(12.0 * TILE_SIZE, a.y + a.vy * dt));
      });

      // Update Rain
      const isRaining = gameState?.world?.weather === 'Rainy';
      if (isRaining) {
        rainDropsRef.current.forEach((drop) => {
          drop.y += drop.speed * dt;
          drop.x += (drop.speed * 0.3) * dt;
          if (drop.y > GRID_ROWS * TILE_SIZE) {
            drop.y = -10;
            drop.x = Math.random() * (GRID_COLS * TILE_SIZE);
          }
        });
      }

      // Update Fireflies
      firefliesRef.current.forEach((ff) => {
        ff.x += ff.vx;
        ff.y += ff.vy;
        if (ff.x < 0) ff.x = GRID_COLS * TILE_SIZE;
        if (ff.x > GRID_COLS * TILE_SIZE) ff.x = 0;
        if (ff.y < 0) ff.y = GRID_ROWS * TILE_SIZE;
        if (ff.y > GRID_ROWS * TILE_SIZE) ff.y = 0;
        ff.alpha = 0.3 + 0.5 * Math.sin(animTimer * 2 + ff.x);
      });

      // 2. RENDER PIPELINE
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      renderGround(ctx);
      renderFarmhouse(ctx);
      renderShippingBin(ctx);
      renderWaterPond(ctx, animTimer);
      renderPastureFence(ctx);
      renderAnimals(ctx);
      renderFarmGrid(ctx, animTimer);

      // Living NPCs with A* Pathfinding
      renderPathfindingNPCs(ctx, animTimer);

      // Remote Multiplayer Players
      renderRemotePlayers(ctx, dt);

      // Local Player
      renderPlayer(ctx);

      // Hover Reticle
      renderReticle(ctx, animTimer);

      // Rain / Night / Sunset Lighting
      if (isRaining) renderRain(ctx);
      renderLighting(ctx);

      // Floating Texts
      renderFloatingTexts(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, hoverTile, localPlayerChatBubble]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    if (tileX >= 0 && tileX < GRID_COLS && tileY >= 0 && tileY < GRID_ROWS) {
      if (tileX !== hoverTile.x || tileY !== hoverTile.y) {
        setHoverTile({ x: tileX, y: tileY });
      }
    }
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();
    const tx = hoverTile.x;
    const ty = hoverTile.y;

    // Check click on Animal
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    for (const a of animalsRef.current) {
      const dist = Math.hypot(px - a.x, py - a.y);
      const mDist = Math.hypot(tx * TILE_SIZE + 20 - a.x, ty * TILE_SIZE + 20 - a.y);
      if (mDist < 30) {
        if (dist < 80) {
          handlePetAnimal(a.type);
          return;
        } else {
          addFloatingText('Mendekatlah untuk membelai!', a.x, a.y, '#f87171');
          return;
        }
      }
    }

    // Check click on Pond for fishing
    if (tx >= 2 && tx <= 3 && ty >= 2 && ty <= 3) {
      sounds.playClick();
      onOpenFishing();
      return;
    }

    // Check click on NPC to talk
    for (const [npcId, npc] of multiplayer.npcs.entries()) {
      const npcPx = npc.x * TILE_SIZE;
      const npcPy = npc.y * TILE_SIZE;
      const distFromPlayer = Math.hypot(px - npcPx, py - npcPy);
      const distFromClick = Math.hypot(tx * TILE_SIZE + 20 - npcPx, ty * TILE_SIZE + 20 - npcPy);

      if (distFromClick < 35) {
        if (distFromPlayer < 90) {
          const profile = (gameState.npcs || []).find((n) => n.id === npcId);
          if (profile) {
            sounds.playClick();
            onOpenNpcDialogue(profile);
            return;
          }
        } else {
          addFloatingText('Mendekatlah untuk mengobrol!', npcPx, npcPy, '#f87171');
          return;
        }
      }
    }

    triggerEquippedAction(tx, ty);
  };

  const handlePetAnimal = async (animalType) => {
    try {
      const res = await fetch('/api/v1/game/animals/pet/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animal_type: animalType })
      });
      const data = await res.json();
      sounds.playHarvest();
      showNotification(data.message, 'success');
      addFloatingText('❤️ Bahagia!', playerPosRef.current.x, playerPosRef.current.y - 20, '#f43f5e');

      setGameState({
        ...gameState,
        player: {
          ...gameState.player,
          gold: data.current_gold
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const triggerEquippedAction = (tx, ty) => {
    if (!gameState) return;

    if (tx >= 11 && tx <= 14 && ty >= 1 && ty <= 3) {
      sounds.playClick();
      onOpenBed();
      return;
    }

    if (tx === 14 && ty === 5) {
      sounds.playClick();
      onOpenShipping();
      return;
    }

    const px = Math.floor((playerPosRef.current.x + TILE_SIZE / 2) / TILE_SIZE);
    const py = Math.floor((playerPosRef.current.y + TILE_SIZE / 2) / TILE_SIZE);
    const dist = Math.hypot(tx - px, ty - py);

    if (dist > 2.8) {
      addFloatingText('Terlalu jauh!', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#f87171');
      return;
    }

    const grid = [...gameState.farm_grid.map((row) => [...row])];
    const targetTile = grid[ty] && grid[ty][tx];
    if (!targetTile) return;

    let player = { ...gameState.player };
    const curItem = equippedItem;

    if (curItem?.stamina_cost && player.stamina < curItem.stamina_cost) {
      addFloatingText('Kelelahan! Istirahatlah.', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#f87171');
      return;
    }

    let modified = false;

    // Harvest
    if (targetTile.crop && targetTile.crop.stage >= targetTile.crop.max_stage) {
      const harvestId = targetTile.crop.crop_id;
      addItemToInventory(player, harvestId, 1);
      targetTile.crop = null;
      targetTile.tile_type = 'tilled';
      sounds.playHarvest();
      addFloatingText('Panen Selesai! ✨', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#4ade80');
      modified = true;
      toolSwingRef.current = { type: 'harvest', timer: 0.18 };
      multiplayer.sendWorldAction('harvest', tx, ty, { harvest_id: harvestId });
    }
    // Hoe
    else if (curItem?.id === 'tool_hoe') {
      if (targetTile.tile_type === 'grass' || targetTile.tile_type === 'obstacle_weed') {
        targetTile.tile_type = 'tilled';
        player.stamina -= curItem.stamina_cost || 2;
        sounds.playHoe();
        addFloatingText('-2 Stamina', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#fde047');
        modified = true;
        toolSwingRef.current = { type: 'hoe', timer: 0.2 };
        multiplayer.sendWorldAction('till', tx, ty);
      }
    }
    // Water
    else if (curItem?.id === 'tool_watering_can') {
      if (targetTile.tile_type === 'tilled') {
        targetTile.tile_type = 'watered';
        if (targetTile.crop) targetTile.crop.watered_today = true;
        player.stamina -= curItem.stamina_cost || 2;
        sounds.playWater();
        addFloatingText('Disiram! 💧', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#38bdf8');
        modified = true;
        toolSwingRef.current = { type: 'water', timer: 0.2 };
        multiplayer.sendWorldAction('water', tx, ty);
      }
    }
    // Pickaxe
    else if (curItem?.id === 'tool_pickaxe') {
      if (targetTile.tile_type === 'obstacle_rock') {
        targetTile.tile_type = 'grass';
        player.stamina -= curItem.stamina_cost || 3;
        sounds.playPickaxe();
        addItemToInventory(player, 'mat_stone', 2);
        if (Math.random() < 0.35) addItemToInventory(player, 'mat_copper_ore', 1);
        addFloatingText('+Batu Kali', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#94a3b8');
        modified = true;
        toolSwingRef.current = { type: 'pickaxe', timer: 0.2 };
        multiplayer.sendWorldAction('clear', tx, ty);
      }
    }
    // Axe
    else if (curItem?.id === 'tool_axe') {
      if (targetTile.tile_type === 'obstacle_wood') {
        targetTile.tile_type = 'grass';
        player.stamina -= curItem.stamina_cost || 3;
        sounds.playAxe();
        addItemToInventory(player, 'mat_wood', 3);
        addFloatingText('+Kayu (+3)', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#fb923c');
        modified = true;
        toolSwingRef.current = { type: 'axe', timer: 0.2 };
        multiplayer.sendWorldAction('clear', tx, ty);
      }
    }
    // Seeds
    else if (curItem?.category === 'seed') {
      if ((targetTile.tile_type === 'tilled' || targetTile.tile_type === 'watered') && !targetTile.crop) {
        targetTile.crop = {
          crop_id: curItem.harvest_item_id,
          stage: 0,
          max_stage: 4,
          days_grown: 0,
          watered_today: targetTile.tile_type === 'watered'
        };
        consumeEquippedItem(player);
        sounds.playHoe();
        addFloatingText(`Tanam ${curItem.name}!`, tx * TILE_SIZE + 20, ty * TILE_SIZE, '#86efac');
        modified = true;
        multiplayer.sendWorldAction('plant', tx, ty, { crop_id: curItem.harvest_item_id });
      }
    }
    // Sprinkler
    else if (curItem?.id === 'tech_sprinkler_basic' || curItem?.id === 'tech_sprinkler_modern') {
      if (targetTile.tile_type === 'tilled' || targetTile.tile_type === 'grass') {
        targetTile.structure_type = 'sprinkler';
        consumeEquippedItem(player);
        sounds.playClick();
        addFloatingText('Sprinkler Terpasang! ⚙️', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#22d3ee');
        modified = true;
        multiplayer.sendWorldAction('place', tx, ty, { structure_type: 'sprinkler' });
      }
    }

    if (modified) {
      setGameState({
        ...gameState,
        player,
        farm_grid: grid
      });
    }
  };

  const addItemToInventory = (player, itemId, count) => {
    let inventory = [...player.inventory];
    let stacked = false;
    for (let slot of inventory) {
      if (slot && slot.item_id === itemId) {
        slot.count += count;
        stacked = true;
        break;
      }
    }
    if (!stacked) {
      const idx = inventory.findIndex((s) => s === null);
      if (idx !== -1) inventory[idx] = { item_id: itemId, count };
    }
    player.inventory = inventory;
  };

  const consumeEquippedItem = (player) => {
    let inventory = [...player.inventory];
    const eq = inventory[player.equipped_index];
    if (eq) {
      eq.count -= 1;
      if (eq.count <= 0) inventory[player.equipped_index] = null;
    }
    player.inventory = inventory;
  };

  // ==================== RENDERING METHODS ====================

  const renderGround = (ctx) => {
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);

    ctx.fillStyle = '#264e21';
    for (let x = 0; x < GRID_COLS; x += 2) {
      for (let y = 0; y < GRID_ROWS; y += 2) {
        if ((x + y) % 3 === 0) {
          ctx.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE + 12, 4, 6);
          ctx.fillRect(x * TILE_SIZE + 24, y * TILE_SIZE + 28, 4, 5);
        }
      }
    }

    // Fence
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, 8);
    ctx.fillRect(0, (GRID_ROWS * TILE_SIZE) - 8, GRID_COLS * TILE_SIZE, 8);
    ctx.fillRect(0, 0, 8, GRID_ROWS * TILE_SIZE);
    ctx.fillRect((GRID_COLS * TILE_SIZE) - 8, 0, 8, GRID_ROWS * TILE_SIZE);
  };

  const renderPastureFence = (ctx) => {
    // Fenced Animal pasture at (1..4, 8..12)
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.strokeRect(1 * TILE_SIZE, 8.5 * TILE_SIZE, 3.5 * TILE_SIZE, 4.5 * TILE_SIZE);

    // Sign
    ctx.fillStyle = '#fef3c7';
    ctx.font = '9px sans-serif';
    ctx.fillText('🐑 Peternakan', 1.2 * TILE_SIZE, 8.3 * TILE_SIZE);
  };

  const renderAnimals = (ctx) => {
    animalsRef.current.forEach((a) => {
      ctx.font = a.type === 'sheep' ? '22px sans-serif' : '16px sans-serif';
      ctx.fillText(a.type === 'sheep' ? '🐑' : '🐔', a.x, a.y);
    });
  };

  const renderFarmhouse = (ctx) => {
    const hx = 11 * TILE_SIZE;
    const hy = 1 * TILE_SIZE;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(hx, hy + 70, 120, 20);

    ctx.fillStyle = '#b45309';
    ctx.fillRect(hx + 10, hy + 25, 100, 50);

    ctx.fillStyle = '#991b1b';
    ctx.fillRect(hx + 85, hy - 15, 18, 35);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(hx + 82, hy - 18, 24, 6);

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 25);
    ctx.lineTo(hx + 60, hy - 10);
    ctx.lineTo(hx + 120, hy + 25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.fillRect(hx + 45, hy + 45, 30, 42);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(hx + 70, hy + 66, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(hx + 20, hy + 40, 18, 18);
    ctx.fillRect(hx + 82, hy + 40, 18, 18);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '10px sans-serif';
    ctx.fillText('🏡 Rumah Petani', hx + 18, hy + 86);
  };

  const renderShippingBin = (ctx) => {
    const sx = 14 * TILE_SIZE;
    const sy = 5 * TILE_SIZE;

    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(sx + 2, sy + 6, 36, 28);
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(sx + 5, sy + 9, 30, 22);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx + 8, sy + 6, 4, 28);
    ctx.fillRect(sx + 28, sy + 6, 4, 28);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx + 16, sy + 18, 8, 8);

    ctx.fillStyle = '#fef3c7';
    ctx.font = '9px monospace';
    ctx.fillText('KOTAK JUAL', sx - 8, sy + 44);
  };

  const renderWaterPond = (ctx, animTimer) => {
    const px = 2 * TILE_SIZE;
    const py = 2 * TILE_SIZE;

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(px + 30, py + 30, 36, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(px + 30, py + 30, 31, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const offset = Math.sin(animTimer * 2) * 4;
    ctx.beginPath();
    ctx.ellipse(px + 30 + offset, py + 26, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px + 20, py + 34, 6, 0, Math.PI * 1.8);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.font = '9px sans-serif';
    ctx.fillText('🎣 Kolam Ikan [F]', px + 5, py + 54);
  };

  const renderFarmGrid = (ctx, animTimer) => {
    if (!gameState || !gameState.farm_grid) return;

    gameState.farm_grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const tx = x * TILE_SIZE;
        const ty = y * TILE_SIZE;

        if (x >= 11 && x <= 14 && y >= 1 && y <= 3) return;
        if (x >= 2 && x <= 3 && y >= 2 && y <= 3) return;
        if (x === 14 && y === 5) return;

        if (tile.tile_type === 'tilled') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx + 6, ty + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        } else if (tile.tile_type === 'watered') {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#291002';
          ctx.fillRect(tx + 6, ty + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(tx + 4, ty + 4, TILE_SIZE - 8, 4);
        } else if (tile.tile_type === 'obstacle_weed') {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(tx + 12, ty + 16, 6, 16);
          ctx.fillRect(tx + 22, ty + 12, 6, 20);
        } else if (tile.tile_type === 'obstacle_rock') {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 24, 14, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile.tile_type === 'obstacle_wood') {
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 24, 13, 9, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (tile.structure_type === 'sprinkler') {
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(tx + 17, ty + 14, 6, 18);
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 12, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        if (tile.crop) {
          renderCrop(ctx, tile.crop, tx, ty, animTimer);
        }
      });
    });
  };

  const renderCrop = (ctx, crop, tx, ty, animTimer) => {
    const stage = crop.stage;
    if (stage === 0) {
      ctx.fillStyle = '#86efac';
      ctx.fillRect(tx + 18, ty + 26, 4, 8);
    } else if (stage === 1) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(tx + 17, ty + 22, 6, 12);
    } else if (stage === 2) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(tx + 16, ty + 16, 8, 16);
    } else if (stage === 3) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(tx + 14, ty + 12, 12, 20);
    } else {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath();
      ctx.arc(tx + 20, ty + 20, 16 + Math.sin(animTimer * 5) * 2, 0, Math.PI * 2);
      ctx.fill();

      if (crop.crop_id === 'crop_parsnip') {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(tx + 20, ty + 22, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (crop.crop_id === 'crop_strawberry') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 22, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (crop.crop_id === 'crop_potato') {
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(tx + 17, ty + 23, 8, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(tx + 23, ty + 24, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 20, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Render Living A* Pathfinding NPCs
  const renderPathfindingNPCs = (ctx, animTimer) => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;

    for (const [npcId, npc] of multiplayer.npcs.entries()) {
      const nx = npc.x * TILE_SIZE;
      const ny = npc.y * TILE_SIZE;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(nx + 20, ny + 35, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // NPC Body
      ctx.fillStyle = npcId === 'npc_elara' ? '#15803d' : npcId === 'npc_rowan' ? '#78350f' : npcId === 'npc_nessa' ? '#0891b2' : '#c2410c';
      ctx.fillRect(nx + 13, ny + 17, 14, 15);

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(nx + 14, ny + 8, 12, 10);

      // Name & Title Badge
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(npc.name, nx + 8, ny + 4);

      // Check distance from player to show interact prompt
      const dist = Math.hypot(px - nx, py - ny);
      if (dist < 75) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx - 12, ny - 16, 64, 15);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('💬 [Klik/E] Bicara', nx - 10, ny - 6);
      }
    }
  };

  // Render Remote Online Players with linear lerp
  const renderRemotePlayers = (ctx, dt) => {
    for (const [clientId, p] of multiplayer.remotePlayers.entries()) {
      // Lerp position smoothly
      p.x += (p.targetX - p.x) * Math.min(1.0, dt * 14);
      p.y += (p.targetY - p.y) * Math.min(1.0, dt * 14);

      const rx = p.x;
      const ry = p.y;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(rx + 20, ry + 36, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tunic
      ctx.fillStyle = p.color || '#3b82f6';
      ctx.fillRect(rx + 12, ry + 16, 16, 14);

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(rx + 13, ry + 6, 14, 11);

      // Nameplate
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(rx + 2, ry - 10, 36, 13);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(p.name ? p.name.substring(0, 7) : 'Pemain', rx + 4, ry - 1);

      // Speech Bubble
      if (p.chat_message && p.chat_timer > 0) {
        p.chat_timer -= dt;
        renderSpeechBubble(ctx, p.chat_message, rx + 20, ry - 16);
      }
    }
  };

  // Render Local Player
  const renderPlayer = (ctx) => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const dir = playerDirRef.current;
    const isMoving = isMovingRef.current;
    const step = isMoving ? Math.floor(walkFrameRef.current) % 2 : 0;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 20, py + 36, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = isMoving ? (step === 0 ? -3 : 3) : 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(px + 12, py + 26, 6, 10 + legOffset);
    ctx.fillRect(px + 22, py + 26, 6, 10 - legOffset);

    ctx.fillStyle = '#451a03';
    ctx.fillRect(px + 10, py + 34 + legOffset, 8, 4);
    ctx.fillRect(px + 22, py + 34 - legOffset, 8, 4);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 12, py + 16, 16, 12);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(px + 15, py + 18, 10, 10);

    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px + 13, py + 6, 14, 12);

    ctx.fillStyle = '#1c1917';
    if (dir === 'down') {
      ctx.fillRect(px + 15, py + 11, 2, 3);
      ctx.fillRect(px + 23, py + 11, 2, 3);
    } else if (dir === 'left') {
      ctx.fillRect(px + 14, py + 11, 2, 3);
    } else if (dir === 'right') {
      ctx.fillRect(px + 24, py + 11, 2, 3);
    }

    // Straw Hat
    ctx.fillStyle = '#eab308';
    ctx.fillRect(px + 8, py + 4, 24, 4);
    ctx.fillRect(px + 12, py - 2, 16, 6);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px + 12, py + 2, 16, 2);

    // Nameplate
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(px + 2, py - 12, 36, 13);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('Kamu', px + 10, py - 3);

    // Local Chat Bubble
    if (localPlayerChatBubble) {
      renderSpeechBubble(ctx, localPlayerChatBubble, px + 20, py - 18);
    }
  };

  const renderSpeechBubble = (ctx, text, cx, cy) => {
    ctx.font = 'bold 9px sans-serif';
    const textWidth = ctx.measureText(text).width;
    const boxW = Math.max(50, textWidth + 14);
    const boxH = 18;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - boxW / 2, cy - boxH, boxW, boxH, 6);
    ctx.fill();

    // Pointer tail
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx + 4, cy);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, cx - textWidth / 2, cy - 6);
  };

  const renderReticle = (ctx, animTimer) => {
    const rx = hoverTile.x * TILE_SIZE;
    const ry = hoverTile.y * TILE_SIZE;

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  };

  const renderRain = (ctx) => {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
    ctx.lineWidth = 1.5;
    rainDropsRef.current.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 3, d.y + d.len);
      ctx.stroke();
    });
  };

  const renderLighting = (ctx) => {
    if (!gameState || !gameState.world) return;
    const hour = gameState.world.time_hour || 12;

    if (hour >= 17 && hour < 20) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.18)';
      ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);
    } else if (hour >= 20 || hour < 6) {
      ctx.save();
      const px = playerPosRef.current.x + 20;
      const py = playerPosRef.current.y + 20;

      const grad = ctx.createRadialGradient(px, py, 20, px, py, 140);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
      grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.55)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);

      firefliesRef.current.forEach((ff) => {
        ctx.fillStyle = `rgba(163, 230, 53, ${ff.alpha})`;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  };

  const renderFloatingTexts = (ctx) => {
    ctx.font = 'bold 13px sans-serif';
    floatingTextsRef.current.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1.0;
    });
  };

  return (
    <div className="relative flex justify-center items-center select-none">
      <canvas
        ref={canvasRef}
        width={GRID_COLS * TILE_SIZE}
        height={GRID_ROWS * TILE_SIZE}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="rounded-xl border-4 border-amber-900/80 shadow-2xl cursor-crosshair bg-stone-900 pixel-art"
        style={{
          width: `${GRID_COLS * TILE_SIZE}px`,
          height: `${GRID_ROWS * TILE_SIZE}px`,
          maxHeight: 'calc(100vh - 160px)',
          maxWidth: '100vw'
        }}
      />
      <div className="absolute top-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/30 text-xs text-amber-200 pointer-events-none">
        Petak: ({hoverTile.x}, {hoverTile.y}) • [WASD] Gerak • [Spasi/Klik] Aksi • [F] Mancing • [Enter] Chat
      </div>
    </div>
  );
}
