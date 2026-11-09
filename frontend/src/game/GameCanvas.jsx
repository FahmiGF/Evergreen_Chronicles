import React, { useRef, useEffect, useState } from 'react';
import { sounds } from './SoundFx';

const TILE_SIZE = 40;
const GRID_COLS = 16;
const GRID_ROWS = 16;

export default function GameCanvas({
  gameState,
  setGameState,
  equippedItem,
  onOpenShipping,
  onOpenBed,
  showNotification
}) {
  const canvasRef = useRef(null);

  // Player position in pixel coordinates
  const playerPosRef = useRef({ x: 7 * TILE_SIZE, y: 7 * TILE_SIZE });
  const playerDirRef = useRef('down'); // 'down', 'up', 'left', 'right'
  const isMovingRef = useRef(false);
  const walkFrameRef = useRef(0);
  const toolSwingRef = useRef(null); // { type, timer }

  // Hovered tile coordinates
  const [hoverTile, setHoverTile] = useState({ x: 7, y: 7 });

  // Floating text particles
  const floatingTextsRef = useRef([]);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling on WASD and arrows
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space'].includes(e.code)) {
        if (!e.repeat) keysDown.current[e.code] = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        triggerEquippedAction(hoverTile.x, hoverTile.y);
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
      const speed = 135; // pixels per second
      let dx = 0;
      let dy = 0;

      if (keysDown.current['KeyW'] || keysDown.current['ArrowUp']) dy -= 1;
      if (keysDown.current['KeyS'] || keysDown.current['ArrowDown']) dy += 1;
      if (keysDown.current['KeyA'] || keysDown.current['ArrowLeft']) dx -= 1;
      if (keysDown.current['KeyD'] || keysDown.current['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        // Normalize diagonal
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

        // Boundaries: 1 tile margin from fence
        const minX = 1 * TILE_SIZE;
        const maxX = (GRID_COLS - 2) * TILE_SIZE;
        const minY = 1 * TILE_SIZE;
        const maxY = (GRID_ROWS - 2) * TILE_SIZE;

        playerPosRef.current.x = Math.max(minX, Math.min(maxX, newX));
        playerPosRef.current.y = Math.max(minY, Math.min(maxY, newY));
      }

      // Update tool swing animation
      if (toolSwingRef.current) {
        toolSwingRef.current.timer -= dt;
        if (toolSwingRef.current.timer <= 0) {
          toolSwingRef.current = null;
        }
      }

      // Update floating texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.alpha -= dt * 0.9;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      // Update fireflies
      firefliesRef.current.forEach((ff) => {
        ff.x += ff.vx;
        ff.y += ff.vy;
        if (ff.x < 0) ff.x = GRID_COLS * TILE_SIZE;
        if (ff.x > GRID_COLS * TILE_SIZE) ff.x = 0;
        if (ff.y < 0) ff.y = GRID_ROWS * TILE_SIZE;
        if (ff.y > GRID_ROWS * TILE_SIZE) ff.y = 0;
        ff.alpha = 0.3 + 0.5 * Math.sin(animTimer * 2 + ff.x);
      });

      // 2. RENDER SCENE
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. Ground Base Tiles
      renderGround(ctx, animTimer);

      // B. Farmhouse & Fixed Props
      renderFarmhouse(ctx);
      renderShippingBin(ctx);
      renderWaterPond(ctx, animTimer);

      // C. Grid Tiles (Tilled, Watered, Crops, Obstacles, Sprinklers)
      renderFarmGrid(ctx, animTimer);

      // D. Hover Reticle
      renderReticle(ctx, animTimer);

      // E. Player Character
      renderPlayer(ctx);

      // F. Day / Sunset / Night Lighting Overlay
      renderLighting(ctx);

      // G. Floating Particles & Numbers
      renderFloatingTexts(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, hoverTile]);

  // Handle Mouse movement over canvas
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

  // Handle Mouse Click on Canvas
  const handleCanvasClick = (e) => {
    e.preventDefault();
    triggerEquippedAction(hoverTile.x, hoverTile.y);
  };

  // ACTION RESOLVER
  const triggerEquippedAction = (tx, ty) => {
    if (!gameState) return;

    // Check interaction with House / Bed
    if (tx >= 11 && tx <= 14 && ty >= 1 && ty <= 3) {
      sounds.playClick();
      onOpenBed();
      return;
    }

    // Check interaction with Shipping Bin
    if (tx === 14 && ty === 5) {
      sounds.playClick();
      onOpenShipping();
      return;
    }

    // Check distance from player
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

    // Check Stamina
    if (curItem?.stamina_cost && player.stamina < curItem.stamina_cost) {
      addFloatingText('Kelelahan! Istirahatlah.', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#f87171');
      return;
    }

    let modified = false;

    // 1. HARVEST CROP (Free action if mature)
    if (targetTile.crop && targetTile.crop.stage >= targetTile.crop.max_stage) {
      const harvestId = targetTile.crop.crop_id;
      // Add to inventory
      let inventory = [...player.inventory];
      let stacked = false;
      for (let slot of inventory) {
        if (slot && slot.item_id === harvestId) {
          slot.count += 1;
          stacked = true;
          break;
        }
      }
      if (!stacked) {
        const emptyIdx = inventory.findIndex((s) => s === null);
        if (emptyIdx !== -1) {
          inventory[emptyIdx] = { item_id: harvestId, count: 1 };
        } else {
          addFloatingText('Tas Penuh!', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#ef4444');
          return;
        }
      }

      targetTile.crop = null;
      targetTile.tile_type = 'tilled';
      player.inventory = inventory;
      sounds.playHarvest();
      addFloatingText('Panen Selesai! ✨', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#4ade80');
      modified = true;
      toolSwingRef.current = { type: 'harvest', timer: 0.18 };
    }
    // 2. TOOL: HOE
    else if (curItem?.id === 'tool_hoe') {
      if (targetTile.tile_type === 'grass') {
        targetTile.tile_type = 'tilled';
        player.stamina -= curItem.stamina_cost || 2;
        sounds.playHoe();
        addFloatingText('-2 Stamina', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#fde047');
        modified = true;
        toolSwingRef.current = { type: 'hoe', timer: 0.2 };
      } else if (targetTile.tile_type === 'obstacle_weed') {
        targetTile.tile_type = 'tilled';
        player.stamina -= 1;
        sounds.playHoe();
        addFloatingText('Rumput Liar Bersih!', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#86efac');
        modified = true;
      }
    }
    // 3. TOOL: WATERING CAN
    else if (curItem?.id === 'tool_watering_can') {
      if (targetTile.tile_type === 'tilled') {
        targetTile.tile_type = 'watered';
        if (targetTile.crop) targetTile.crop.watered_today = true;
        player.stamina -= curItem.stamina_cost || 2;
        sounds.playWater();
        addFloatingText('Disiram! 💧', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#38bdf8');
        modified = true;
        toolSwingRef.current = { type: 'water', timer: 0.2 };
      }
    }
    // 4. TOOL: PICKAXE (Break stone / rocks)
    else if (curItem?.id === 'tool_pickaxe') {
      if (targetTile.tile_type === 'obstacle_rock') {
        targetTile.tile_type = 'grass';
        player.stamina -= curItem.stamina_cost || 3;
        sounds.playPickaxe();
        // Give stone or copper
        addItemToInventory(player, 'mat_stone', 2);
        if (Math.random() < 0.35) addItemToInventory(player, 'mat_copper_ore', 1);
        addFloatingText('+Batu Kali', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#94a3b8');
        modified = true;
        toolSwingRef.current = { type: 'pickaxe', timer: 0.2 };
      }
    }
    // 5. TOOL: AXE (Chop wood / stumps)
    else if (curItem?.id === 'tool_axe') {
      if (targetTile.tile_type === 'obstacle_wood') {
        targetTile.tile_type = 'grass';
        player.stamina -= curItem.stamina_cost || 3;
        sounds.playAxe();
        addItemToInventory(player, 'mat_wood', 3);
        addFloatingText('+Kayu (+3)', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#fb923c');
        modified = true;
        toolSwingRef.current = { type: 'axe', timer: 0.2 };
      }
    }
    // 6. SEED PLANTING
    else if (curItem?.category === 'seed') {
      if ((targetTile.tile_type === 'tilled' || targetTile.tile_type === 'watered') && !targetTile.crop) {
        targetTile.crop = {
          crop_id: curItem.harvest_item_id,
          stage: 0,
          max_stage: 4,
          days_grown: 0,
          watered_today: targetTile.tile_type === 'watered'
        };
        // Deduct 1 seed
        consumeEquippedItem(player);
        sounds.playHoe();
        addFloatingText(`Tanam ${curItem.name}!`, tx * TILE_SIZE + 20, ty * TILE_SIZE, '#86efac');
        modified = true;
      } else {
        addFloatingText('Harus tanah dicangkul!', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#f87171');
      }
    }
    // 7. PLACE SPRINKLER / STRUCTURE
    else if (curItem?.id === 'tech_sprinkler_basic' || curItem?.id === 'tech_sprinkler_modern') {
      if (targetTile.tile_type === 'tilled' || targetTile.tile_type === 'grass') {
        targetTile.structure_type = 'sprinkler';
        consumeEquippedItem(player);
        sounds.playClick();
        addFloatingText('Sprinkler Terpasang! ⚙️', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#22d3ee');
        modified = true;
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
      if (idx !== -1) {
        inventory[idx] = { item_id: itemId, count };
      }
    }
    player.inventory = inventory;
  };

  const consumeEquippedItem = (player) => {
    let inventory = [...player.inventory];
    const eq = inventory[player.equipped_index];
    if (eq) {
      eq.count -= 1;
      if (eq.count <= 0) {
        inventory[player.equipped_index] = null;
      }
    }
    player.inventory = inventory;
  };

  // ==================== RENDERING METHODS ====================

  const renderGround = (ctx, animTimer) => {
    // Farm soil backdrop
    ctx.fillStyle = '#2d5a27'; // Rich medieval grass green
    ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);

    // Subtle grass texture noise
    ctx.fillStyle = '#264e21';
    for (let x = 0; x < GRID_COLS; x += 2) {
      for (let y = 0; y < GRID_ROWS; y += 2) {
        if ((x + y) % 3 === 0) {
          ctx.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE + 12, 4, 6);
          ctx.fillRect(x * TILE_SIZE + 24, y * TILE_SIZE + 28, 4, 5);
        }
      }
    }

    // Wooden Perimeter Fence
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, 8); // Top fence
    ctx.fillRect(0, (GRID_ROWS * TILE_SIZE) - 8, GRID_COLS * TILE_SIZE, 8); // Bottom fence
    ctx.fillRect(0, 0, 8, GRID_ROWS * TILE_SIZE); // Left fence
    ctx.fillRect((GRID_COLS * TILE_SIZE) - 8, 0, 8, GRID_ROWS * TILE_SIZE); // Right fence

    // Fence Posts
    ctx.fillStyle = '#92400e';
    for (let i = 0; i <= GRID_COLS * TILE_SIZE; i += 40) {
      ctx.fillRect(i - 4, 0, 8, 12);
      ctx.fillRect(i - 4, (GRID_ROWS * TILE_SIZE) - 12, 8, 12);
    }
  };

  const renderFarmhouse = (ctx) => {
    const hx = 11 * TILE_SIZE;
    const hy = 1 * TILE_SIZE;

    // Stone Foundation
    ctx.fillStyle = '#64748b';
    ctx.fillRect(hx, hy + 70, 120, 20);

    // Wooden Cottage Walls
    ctx.fillStyle = '#b45309';
    ctx.fillRect(hx + 10, hy + 25, 100, 50);

    // Red Brick Chimney
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(hx + 85, hy - 15, 18, 35);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(hx + 82, hy - 18, 24, 6);

    // Roof (Gabled slate)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 25);
    ctx.lineTo(hx + 60, hy - 10);
    ctx.lineTo(hx + 120, hy + 25);
    ctx.closePath();
    ctx.fill();

    // Front Wooden Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(hx + 45, hy + 45, 30, 42);
    ctx.fillStyle = '#f59e0b'; // Brass Knob
    ctx.beginPath();
    ctx.arc(hx + 70, hy + 66, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Warm Windows
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(hx + 20, hy + 40, 18, 18);
    ctx.fillRect(hx + 82, hy + 40, 18, 18);
    // Window mullions
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx + 20, hy + 40, 18, 18);
    ctx.strokeRect(hx + 82, hy + 40, 18, 18);

    // Sign "Rumah Fahmi"
    ctx.fillStyle = '#fef3c7';
    ctx.font = '10px sans-serif';
    ctx.fillText('🏡 Rumah Petani', hx + 18, hy + 86);
  };

  const renderShippingBin = (ctx) => {
    const sx = 14 * TILE_SIZE;
    const sy = 5 * TILE_SIZE;

    // Wooden Bin Body
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(sx + 2, sy + 6, 36, 28);
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(sx + 5, sy + 9, 30, 22);

    // Metal Hinges
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx + 8, sy + 6, 4, 28);
    ctx.fillRect(sx + 28, sy + 6, 4, 28);

    // Gold Lock
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx + 16, sy + 18, 8, 8);

    // Label
    ctx.fillStyle = '#fef3c7';
    ctx.font = '9px monospace';
    ctx.fillText('KOTAK JUAL', sx - 8, sy + 44);
  };

  const renderWaterPond = (ctx, animTimer) => {
    const px = 2 * TILE_SIZE;
    const py = 2 * TILE_SIZE;

    // Cobblestone border
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(px + 30, py + 30, 36, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clear Blue Water
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(px + 30, py + 30, 31, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water Shimmer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const offset = Math.sin(animTimer * 2) * 4;
    ctx.beginPath();
    ctx.ellipse(px + 30 + offset, py + 26, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lilypad
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px + 20, py + 34, 6, 0, Math.PI * 1.8);
    ctx.fill();
    ctx.fillStyle = '#ec4899'; // Lotus flower
    ctx.fillRect(px + 22, py + 32, 4, 4);
  };

  const renderFarmGrid = (ctx, animTimer) => {
    if (!gameState || !gameState.farm_grid) return;

    gameState.farm_grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        const tx = x * TILE_SIZE;
        const ty = y * TILE_SIZE;

        // Skip rendering tiles covered by cottage and pond
        if (x >= 11 && x <= 14 && y >= 1 && y <= 3) return;
        if (x >= 2 && x <= 3 && y >= 2 && y <= 3) return;
        if (x === 14 && y === 5) return;

        // Tilled Soil
        if (tile.tile_type === 'tilled') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx + 6, ty + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        }
        // Watered Soil (Darker, rich moisture)
        else if (tile.tile_type === 'watered') {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#291002';
          ctx.fillRect(tx + 6, ty + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          // Moisture sheen
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(tx + 4, ty + 4, TILE_SIZE - 8, 4);
        }
        // Obstacle: Weed
        else if (tile.tile_type === 'obstacle_weed') {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(tx + 12, ty + 16, 6, 16);
          ctx.fillRect(tx + 22, ty + 12, 6, 20);
          ctx.fillRect(tx + 18, ty + 8, 5, 22);
        }
        // Obstacle: Rock
        else if (tile.tile_type === 'obstacle_rock') {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 24, 14, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(tx + 18, ty + 21, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Obstacle: Wood Stump
        else if (tile.tile_type === 'obstacle_wood') {
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 24, 13, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#d97706'; // Tree ring
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 22, 9, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Structure: Sprinkler
        if (tile.structure_type === 'sprinkler') {
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(tx + 17, ty + 14, 6, 18);
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 12, 7, 0, Math.PI * 2);
          ctx.fill();

          // Mist particles
          ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
          const mistX = Math.sin(animTimer * 4) * 12;
          const mistY = Math.cos(animTimer * 4) * 12;
          ctx.fillRect(tx + 20 + mistX, ty + 12 + mistY, 3, 3);
          ctx.fillRect(tx + 20 - mistX, ty + 12 - mistY, 3, 3);
        }

        // Crop Rendering
        if (tile.crop) {
          renderCrop(ctx, tile.crop, tx, ty, animTimer);
        }
      });
    });
  };

  const renderCrop = (ctx, crop, tx, ty, animTimer) => {
    const stage = crop.stage;

    // Stage 0: Little green seedling sprouting
    if (stage === 0) {
      ctx.fillStyle = '#86efac';
      ctx.fillRect(tx + 18, ty + 26, 4, 8);
      ctx.fillRect(tx + 15, ty + 24, 4, 3);
      ctx.fillRect(tx + 21, ty + 24, 4, 3);
    }
    // Stage 1: Leafy cluster
    else if (stage === 1) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(tx + 17, ty + 22, 6, 12);
      ctx.fillRect(tx + 12, ty + 18, 6, 6);
      ctx.fillRect(tx + 22, ty + 18, 6, 6);
    }
    // Stage 2: Tall lush foliage
    else if (stage === 2) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(tx + 16, ty + 16, 8, 16);
      ctx.fillRect(tx + 10, ty + 14, 8, 8);
      ctx.fillRect(tx + 22, ty + 14, 8, 8);
    }
    // Stage 3: Pre-mature budding
    else if (stage === 3) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(tx + 14, ty + 12, 12, 20);
      // Small color bud depending on crop
      if (crop.crop_id === 'crop_parsnip') ctx.fillStyle = '#fef08a';
      else if (crop.crop_id === 'crop_potato') ctx.fillStyle = '#d97706';
      else if (crop.crop_id === 'crop_strawberry') ctx.fillStyle = '#f87171';
      else ctx.fillStyle = '#a855f7';
      ctx.fillRect(tx + 17, ty + 18, 6, 6);
    }
    // Stage 4: Mature & Ready to Harvest! ✨
    else {
      // Golden / Sparkling Harvest Halo
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath();
      ctx.arc(tx + 20, ty + 20, 16 + Math.sin(animTimer * 5) * 2, 0, Math.PI * 2);
      ctx.fill();

      if (crop.crop_id === 'crop_parsnip') {
        // Golden Parsnip tuber peaking out
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(tx + 20, ty + 22, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a'; // leaves
        ctx.fillRect(tx + 18, ty + 6, 4, 10);
        ctx.fillRect(tx + 12, ty + 9, 6, 5);
        ctx.fillRect(tx + 22, ty + 9, 6, 5);
      } else if (crop.crop_id === 'crop_strawberry') {
        // Red Strawberry
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 22, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a'; // seed dots
        ctx.fillRect(tx + 18, ty + 20, 2, 2);
        ctx.fillRect(tx + 22, ty + 23, 2, 2);
        ctx.fillStyle = '#15803d'; // top leaves
        ctx.fillRect(tx + 16, ty + 9, 8, 4);
      } else if (crop.crop_id === 'crop_potato') {
        // Potatoes
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(tx + 17, ty + 23, 8, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(tx + 23, ty + 24, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(tx + 18, ty + 12, 5, 9);
      } else {
        // Moonberry / Rare Crop
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 20, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(tx + 18, ty + 17, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkle stars
      const spark = Math.floor(animTimer * 6) % 3;
      ctx.fillStyle = '#ffffff';
      if (spark === 0) ctx.fillRect(tx + 12, ty + 8, 3, 3);
      else if (spark === 1) ctx.fillRect(tx + 26, ty + 10, 3, 3);
      else ctx.fillRect(tx + 20, ty + 4, 3, 3);
    }
  };

  const renderReticle = (ctx, animTimer) => {
    const rx = hoverTile.x * TILE_SIZE;
    const ry = hoverTile.y * TILE_SIZE;

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Subtle yellow pulsing interior
    ctx.fillStyle = `rgba(254, 240, 138, ${0.12 + Math.sin(animTimer * 4) * 0.06})`;
    ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  };

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

    // Farmer Body & Legs
    const legOffset = isMoving ? (step === 0 ? -3 : 3) : 0;
    ctx.fillStyle = '#1e3a8a'; // Blue overalls trousers
    ctx.fillRect(px + 12, py + 26, 6, 10 + legOffset);
    ctx.fillRect(px + 22, py + 26, 6, 10 - legOffset);

    // Boots
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px + 10, py + 34 + legOffset, 8, 4);
    ctx.fillRect(px + 22, py + 34 - legOffset, 8, 4);

    // Torso / Tunic
    ctx.fillStyle = '#dc2626'; // Red flannel shirt
    ctx.fillRect(px + 12, py + 16, 16, 12);
    ctx.fillStyle = '#1e3a8a'; // Overalls bib
    ctx.fillRect(px + 15, py + 18, 10, 10);

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.fillRect(px + 13, py + 6, 14, 12);

    // Eyes based on direction
    ctx.fillStyle = '#1c1917';
    if (dir === 'down') {
      ctx.fillRect(px + 15, py + 11, 2, 3);
      ctx.fillRect(px + 23, py + 11, 2, 3);
    } else if (dir === 'left') {
      ctx.fillRect(px + 14, py + 11, 2, 3);
    } else if (dir === 'right') {
      ctx.fillRect(px + 24, py + 11, 2, 3);
    }
    // Up: back of head (hair)
    if (dir === 'up') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 13, py + 6, 14, 10);
    }

    // Farmer Straw Hat
    ctx.fillStyle = '#eab308'; // Straw yellow
    ctx.fillRect(px + 8, py + 4, 24, 4); // Hat brim
    ctx.fillRect(px + 12, py - 2, 16, 6); // Hat crown
    ctx.fillStyle = '#b45309'; // Hat ribbon
    ctx.fillRect(px + 12, py + 2, 16, 2);

    // Tool swinging visual arc
    if (toolSwingRef.current) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + 20, py + 20, 22, 0, Math.PI);
      ctx.stroke();
    }
  };

  const renderLighting = (ctx) => {
    if (!gameState || !gameState.world) return;
    const hour = gameState.world.time_hour || 12;

    // Golden Sunset (17:00 - 19:59)
    if (hour >= 17 && hour < 20) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.18)';
      ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);
    }
    // Deep Night (20:00 - 05:59)
    else if (hour >= 20 || hour < 6) {
      // Dark ambient overlay with lantern cutout
      ctx.save();
      const px = playerPosRef.current.x + 20;
      const py = playerPosRef.current.y + 20;

      const grad = ctx.createRadialGradient(px, py, 20, px, py, 140);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
      grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.55)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE);

      // Render Fireflies
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
        Petak: ({hoverTile.x}, {hoverTile.y}) • [WASD/Panah] Gerak • [Spasi/Klik] Aksi
      </div>
    </div>
  );
}
