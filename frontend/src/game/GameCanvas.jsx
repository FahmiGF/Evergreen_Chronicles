import React, { useRef, useEffect, useState } from 'react';
import { sounds } from './SoundFx';
import { multiplayer } from './MultiplayerManager';

const TILE_SIZE = 40;
const GRID_COLS = 16;
const GRID_ROWS = 16;

// 3D Isometric Projection Constants
const ISO_W = 38;
const ISO_H = 19;
const ISO_OX = 320;
const ISO_OY = 75;

export default function GameCanvas({
  gameState,
  setGameState,
  equippedItem,
  currentZone = 'zone_farm',
  viewMode = 'topdown',
  activeBlueprint = null,
  onClearActiveBlueprint,
  isTractorMounted = false,
  setIsTractorMounted,
  tractorAttachment = 'tiller',
  setTractorAttachment,
  isLandscapePainterActive = false,
  activeLandscapeBrush = 'grass',
  landscapeBrushRadius = 1,
  onPaintLandscape,
  onOpenShipping,
  onOpenBed,
  onOpenFishing,
  onOpenNpcDialogue,
  onOpenWorldMap,
  showNotification,
  localPlayerChatBubble
}) {
  const canvasRef = useRef(null);

  // Player position in 2D pixel coordinates
  const playerPosRef = useRef({ x: 7 * TILE_SIZE, y: 7 * TILE_SIZE });
  const playerDirRef = useRef('down');
  const isMovingRef = useRef(false);
  const walkFrameRef = useRef(0);
  const toolSwingRef = useRef(null);

  // Tractor state
  const tractorRef = useRef({
    x: 11 * TILE_SIZE,
    y: 8 * TILE_SIZE,
    dir: 'down',
    moving: false,
    engineSoundTimer: 0
  });
  const isMountedRef = useRef(isTractorMounted);
  useEffect(() => {
    isMountedRef.current = isTractorMounted;
  }, [isTractorMounted]);

  // Hovered tile coordinates
  const [hoverTile, setHoverTile] = useState({ x: 7, y: 7 });

  // Floating text particles
  const floatingTextsRef = useRef([]);

  // Particles for smoke, water spray, wood chips, fertilizer sparkles
  const particlesRef = useRef([]);

  // 8 Unique Tree Species across the Farm
  const treesRef = useRef([
    { id: 't_lumina_1', species: 'lumina', x: 1, y: 1, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_cherry_1', species: 'cherry', x: 5, y: 1, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_golden_apple_1', species: 'golden_apple', x: 8, y: 1, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_willow_1', species: 'willow', x: 1, y: 5, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_oak_1', species: 'oak', x: 1, y: 8, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_oak_2', species: 'oak', x: 2, y: 14, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_pine_1', species: 'pine', x: 14, y: 8, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_pine_2', species: 'pine', x: 14, y: 12, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_birch_1', species: 'birch', x: 8, y: 14, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_birch_2', species: 'birch', x: 11, y: 14, hp: 3, maxHp: 3, shake: 0 },
    { id: 't_ironbark_1', species: 'ironbark', x: 14, y: 14, hp: 3, maxHp: 3, shake: 0 }
  ]);

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
    Array.from({ length: 18 }, () => ({
      x: Math.random() * (GRID_COLS * TILE_SIZE),
      y: Math.random() * (GRID_ROWS * TILE_SIZE),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random()
    }))
  );

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

  const spawnParticles = (x, y, count, color, type = 'generic') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 45,
        vy: (Math.random() - 0.7) * 45,
        color,
        size: 2 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        type
      });
    }
  };

  // Convert Grid to 3D Isometric Screen Coordinates
  const toIso = (gx, gy, gz = 0) => {
    return {
      x: ISO_OX + (gx - gy) * (ISO_W / 2),
      y: ISO_OY + (gx + gy) * (ISO_H / 2) - gz
    };
  };

  // Convert Screen Coordinates to Grid Coordinates (3D Isometric)
  const toIsoGrid = (screenX, screenY) => {
    const rx = screenX - ISO_OX;
    const ry = screenY - ISO_OY;
    const gx = (rx / (ISO_W / 2) + ry / (ISO_H / 2)) / 2;
    const gy = (ry / (ISO_H / 2) - rx / (ISO_W / 2)) / 2;
    return { gx: Math.floor(gx), gy: Math.floor(gy) };
  };

  // Listen to remote world action sync
  useEffect(() => {
    const unsub = multiplayer.subscribe((event) => {
      if (event.type === 'world_action_sync') {
        const action_type = event.action_type || event.action?.action_type;
        const x = event.x ?? event.action?.x;
        const y = event.y ?? event.action?.y;
        const details = event.details || event.action?.details || {};

        setGameState((prev) => {
          if (!prev || !prev.farm_grid) return prev;
          const grid = [...prev.farm_grid.map((r) => [...r])];
          if (grid[y] && grid[y][x]) {
            const tile = grid[y][x];
            if (action_type === 'till') tile.tile_type = 'tilled';
            else if (action_type === 'paint_terrain') tile.tile_type = details.tile_type || 'grass';
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

  // Keyboard handler for movement, tools, and tractor
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
      // Tractor Mount / Dismount [T]
      if (e.code === 'KeyT') {
        e.preventDefault();
        handleToggleTractorMount();
      }
      // Tractor Horn [H]
      if (e.code === 'KeyH' && isMountedRef.current) {
        e.preventDefault();
        sounds.playTractorHorn();
        addFloatingText('🎺 HONK HONK!', playerPosRef.current.x, playerPosRef.current.y - 30, '#fde047');
      }
      // Switch Tractor Attachments [1, 2, 3]
      if (isMountedRef.current) {
        if (e.code === 'Digit1') {
          e.preventDefault();
          setTractorAttachment && setTractorAttachment('tiller');
          sounds.playClick();
          addFloatingText('⚙️ Alat: BAJAK TANAH', playerPosRef.current.x, playerPosRef.current.y - 20, '#f59e0b');
        } else if (e.code === 'Digit2') {
          e.preventDefault();
          setTractorAttachment && setTractorAttachment('sprayer');
          sounds.playClick();
          addFloatingText('💧 Alat: PENYEMPROT AIR', playerPosRef.current.x, playerPosRef.current.y - 20, '#38bdf8');
        } else if (e.code === 'Digit3') {
          e.preventDefault();
          setTractorAttachment && setTractorAttachment('mower');
          sounds.playClick();
          addFloatingText('🌾 Alat: PEMANEN OTOMATIS', playerPosRef.current.x, playerPosRef.current.y - 20, '#4ade80');
        }
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
  }, [hoverTile, equippedItem, gameState, tractorAttachment]);

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

      // 1. UPDATE PLAYER & TRACTOR MOVEMENT
      // Mounted on tractor = 235 px/s, Mounted on Mount = 215 px/s (normal = 135 px/s)
      const isMounted = isMountedRef.current;
      const isRidingMount = gameState?.player?.mounts_data?.is_mounted;
      const speed = isMounted ? 235 : (isRidingMount ? 215 : 135);
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
        walkFrameRef.current += dt * (isMounted ? 14 : 8);

        const newX = playerPosRef.current.x + dx * speed * dt;
        const newY = playerPosRef.current.y + dy * speed * dt;

        const minX = 1 * TILE_SIZE;
        const maxX = (GRID_COLS - 2) * TILE_SIZE;
        const minY = 1 * TILE_SIZE;
        const maxY = (GRID_ROWS - 2) * TILE_SIZE;

        playerPosRef.current.x = Math.max(minX, Math.min(maxX, newX));
        playerPosRef.current.y = Math.max(minY, Math.min(maxY, newY));

        // When mounted, tractor moves along with player and does mechanized farming
        if (isMounted) {
          tractorRef.current.x = playerPosRef.current.x;
          tractorRef.current.y = playerPosRef.current.y;
          tractorRef.current.dir = playerDirRef.current;
          tractorRef.current.moving = true;

          // Sound engine rumble periodically
          tractorRef.current.engineSoundTimer += dt;
          if (tractorRef.current.engineSoundTimer > 0.35) {
            tractorRef.current.engineSoundTimer = 0;
            sounds.playTractorEngine();
          }

          // Spawn tractor exhaust smoke
          if (Math.random() < 0.4) {
            particlesRef.current.push({
              x: playerPosRef.current.x + 20,
              y: playerPosRef.current.y + 10,
              vx: -dx * 20 + (Math.random() - 0.5) * 10,
              vy: -dy * 20 - 15 - Math.random() * 10,
              color: '#64748b',
              size: 4 + Math.random() * 4,
              life: 0.6,
              maxLife: 0.6,
              type: 'smoke'
            });
          }

          // Mechanized Agricultural Swath (3 tiles wide!)
          applyTractorSwath(playerPosRef.current.x, playerPosRef.current.y, playerDirRef.current, tractorAttachment);
        }
      } else {
        if (isMounted) tractorRef.current.moving = false;
      }

      // Sync movement to Multiplayer WebSocket
      multiplayer.sendMovement(
        playerPosRef.current.x,
        playerPosRef.current.y,
        playerDirRef.current,
        isMoving,
        toolSwingRef.current ? toolSwingRef.current.type : (isMounted ? 'tractor' : null)
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

      // Update Particles (smoke, sparks, wood chips)
      particlesRef.current.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.type === 'smoke') p.size += dt * 3;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // Update Tree Shaking
      treesRef.current.forEach((tree) => {
        if (tree.shake > 0) tree.shake = Math.max(0, tree.shake - dt);
      });

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

      // 2. RENDER PIPELINE BASED ON VIEW MODE
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (viewMode === '3d') {
        // === 3D ISOMETRIC PROJECTION ENGINE ===
        render3DIsometric(ctx, animTimer, dt);
      } else if (viewMode === 'blueprint') {
        // === BLUEPRINT CAD ARCHITECTURAL ENGINE ===
        renderBlueprintCAD(ctx, animTimer);
      } else {
        // === CLASSIC 2D TOP-DOWN ENGINE ===
        if (currentZone === 'zone_village') {
          renderZoneVillage(ctx, animTimer);
        } else if (currentZone === 'zone_woods') {
          renderZoneWoods(ctx, animTimer);
        } else if (currentZone === 'zone_lab') {
          renderZoneLab(ctx, animTimer);
        } else if (currentZone === 'zone_lake') {
          renderZoneLake(ctx, animTimer);
        } else if (currentZone === 'zone_mines') {
          renderZoneMines(ctx, animTimer);
        } else if (currentZone === 'zone_ruins') {
          renderZoneRuins(ctx, animTimer);
        } else if (currentZone === 'zone_summit') {
          renderZoneSummit(ctx, animTimer);
        } else {
          // Default: Aetherwyn Farm
          renderGround(ctx);
          renderIrrigationPipes2D(ctx);
          renderFarmhouse(ctx);
          renderShippingBin(ctx);
          renderWaterPond(ctx, animTimer);
          renderPastureFence(ctx);
          renderAnimals(ctx);
          renderFarmGrid(ctx, animTimer);
          renderTrees2D(ctx, animTimer);
          renderTractor2D(ctx, animTimer);
        }

        // Living NPCs with Unique Sprites & A* Pathfinding
        renderPathfindingNPCs(ctx, animTimer);

        // Remote Multiplayer Players
        renderRemotePlayers(ctx, dt);

        // Local Player (only if not mounted on tractor)
        if (!isMounted) renderPlayer(ctx);

        // Particles
        renderParticles(ctx);

        // Hover Reticle
        renderReticle(ctx, animTimer);

        // Weather & Lighting Overlay
        if (isRaining) renderRain(ctx);
        renderLighting(ctx);
      }

      // Floating Texts (always on top)
      renderFloatingTexts(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, hoverTile, localPlayerChatBubble, currentZone, viewMode, activeBlueprint, isTractorMounted, tractorAttachment]);

  // Mechanized Agricultural Swath: center + 2 flanking tiles
  const applyTractorSwath = (px, py, dir, att) => {
    if (!gameState || !gameState.farm_grid) return;
    const cx = Math.floor((px + TILE_SIZE / 2) / TILE_SIZE);
    const cy = Math.floor((py + TILE_SIZE / 2) / TILE_SIZE);

    const tiles = [];
    if (dir === 'left' || dir === 'right') {
      tiles.push({ x: cx, y: cy - 1 }, { x: cx, y: cy }, { x: cx, y: cy + 1 });
    } else {
      tiles.push({ x: cx - 1, y: cy }, { x: cx, y: cy }, { x: cx + 1, y: cy });
    }

    let modified = false;
    const grid = [...gameState.farm_grid.map((r) => [...r])];
    let player = { ...gameState.player };

    tiles.forEach(({ x, y }) => {
      if (x < 1 || x >= GRID_COLS - 1 || y < 1 || y >= GRID_ROWS - 1) return;
      if (x >= 11 && x <= 14 && y >= 1 && y <= 3) return; // Farmhouse
      if (x >= 2 && x <= 3 && y >= 2 && y <= 3) return; // Pond

      const tile = grid[y] && grid[y][x];
      if (!tile) return;

      if (att === 'tiller') {
        if (tile.tile_type === 'grass' || tile.tile_type === 'obstacle_weed') {
          tile.tile_type = 'tilled';
          modified = true;
          spawnParticles(x * TILE_SIZE + 20, y * TILE_SIZE + 20, 3, '#78350f', 'dirt');
        }
      } else if (att === 'sprayer') {
        if (tile.tile_type === 'tilled') {
          tile.tile_type = 'watered';
          if (tile.crop) tile.crop.watered_today = true;
          modified = true;
          spawnParticles(x * TILE_SIZE + 20, y * TILE_SIZE + 20, 3, '#38bdf8', 'water');
        }
      } else if (att === 'mower') {
        if (tile.crop && tile.crop.stage >= tile.crop.max_stage) {
          addItemToInventory(player, tile.crop.crop_id, 1);
          tile.crop = null;
          tile.tile_type = 'tilled';
          modified = true;
          sounds.playHarvest();
          addFloatingText('🌾 Auto-Panen!', x * TILE_SIZE + 20, y * TILE_SIZE, '#4ade80');
        } else if (tile.tile_type === 'obstacle_weed') {
          tile.tile_type = 'grass';
          modified = true;
          addItemToInventory(player, 'mat_fiber', 1);
        }
      }
    });

    if (modified) {
      setGameState({
        ...gameState,
        player,
        farm_grid: grid
      });
    }
  };

  const handleToggleTractorMount = () => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const tx = tractorRef.current.x;
    const ty = tractorRef.current.y;
    const dist = Math.hypot(px - tx, py - ty);

    if (isMountedRef.current) {
      // Dismount
      isMountedRef.current = false;
      setIsTractorMounted && setIsTractorMounted(false);
      sounds.playClick();
      playerPosRef.current.x = tx + 35;
      addFloatingText('🚶 Turun Traktor', px, py, '#cbd5e1');
    } else {
      // Mount if within 2.5 tiles
      if (dist < 100) {
        isMountedRef.current = true;
        setIsTractorMounted && setIsTractorMounted(true);
        sounds.playClick();
        addFloatingText('🚜 Naik Traktor (+75% Kec.)', px, py, '#34d399');
      } else {
        addFloatingText('Mendekatlah ke Traktor untuk naik!', px, py, '#f87171');
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (viewMode === '3d') {
      const { gx, gy } = toIsoGrid(mouseX, mouseY);
      if (gx >= 0 && gx < GRID_COLS && gy >= 0 && gy < GRID_ROWS) {
        if (gx !== hoverTile.x || gy !== hoverTile.y) {
          setHoverTile({ x: gx, y: gy });
        }
      }
    } else {
      const tileX = Math.floor(mouseX / TILE_SIZE);
      const tileY = Math.floor(mouseY / TILE_SIZE);

      if (tileX >= 0 && tileX < GRID_COLS && tileY >= 0 && tileY < GRID_ROWS) {
        if (tileX !== hoverTile.x || tileY !== hoverTile.y) {
          setHoverTile({ x: tileX, y: tileY });
        }
      }
    }
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();
    const tx = hoverTile.x;
    const ty = hoverTile.y;

    // Check Landscape Painter Mode
    if (isLandscapePainterActive && activeLandscapeBrush) {
      if (onPaintLandscape) {
        onPaintLandscape(tx, ty, activeLandscapeBrush, landscapeBrushRadius);
      }
      return;
    }

    // Check Blueprint Mode placement
    if (viewMode === 'blueprint') {
      if (activeBlueprint) {
        handleBuildBlueprint(activeBlueprint, tx, ty);
        return;
      }
    }

    // Check click on Tractor to mount
    const tractDist = Math.hypot(
      (tx * TILE_SIZE + 20) - tractorRef.current.x,
      (ty * TILE_SIZE + 20) - tractorRef.current.y
    );
    if (tractDist < 40 && !isMountedRef.current) {
      handleToggleTractorMount();
      return;
    }

    // Check click on Tree to chop with Axe
    const treeOnTile = treesRef.current.find((t) => t.x === tx && t.y === ty);
    if (treeOnTile) {
      handleChopTree(treeOnTile);
      return;
    }

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

  // Blueprint Build Handler communicating with FastAPI backend
  const handleBuildBlueprint = async (blueprint, x, y) => {
    try {
      const res = await fetch('/api/v1/game/blueprints/build/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint_id: blueprint.id, x, y })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.detail || 'Tidak dapat membangun di sini!', 'error');
        return;
      }
      sounds.playBlueprintPlace();
      showNotification(data.message, 'success');
      addFloatingText(`✨ ${data.structure_name} Selesai!`, x * TILE_SIZE + 20, y * TILE_SIZE, '#22d3ee');
      spawnParticles(x * TILE_SIZE + 20, y * TILE_SIZE + 20, 12, '#38bdf8', 'blueprint');

      setGameState(data.updated_game_state);
      onClearActiveBlueprint && onClearActiveBlueprint();
    } catch (err) {
      console.error('Build blueprint error:', err);
    }
  };

  // Tree Chopping with Axe
  const handleChopTree = (tree) => {
    const px = Math.floor((playerPosRef.current.x + TILE_SIZE / 2) / TILE_SIZE);
    const py = Math.floor((playerPosRef.current.y + TILE_SIZE / 2) / TILE_SIZE);
    const dist = Math.hypot(tree.x - px, tree.y - py);

    if (dist > 3.0) {
      addFloatingText('Terlalu jauh untuk menebang!', tree.x * TILE_SIZE + 20, tree.y * TILE_SIZE, '#f87171');
      return;
    }

    if (equippedItem?.id !== 'tool_axe') {
      addFloatingText('Gunakan Kapak untuk menebang!', tree.x * TILE_SIZE + 20, tree.y * TILE_SIZE, '#fde047');
      return;
    }

    tree.shake = 0.22;
    tree.hp -= 1;
    sounds.playChopTree();

    const woodColors = {
      oak: '#854d0e',
      pine: '#065f46',
      birch: '#e2e8f0',
      willow: '#166534',
      lumina: '#06b6d4',
      cherry: '#f472b6',
      ironbark: '#334155',
      golden_apple: '#eab308'
    };
    spawnParticles(tree.x * TILE_SIZE + 20, tree.y * TILE_SIZE + 20, 8, woodColors[tree.species] || '#78350f', 'wood');

    if (tree.hp <= 0) {
      // Tree Felled! Give unique wood species drops
      treesRef.current = treesRef.current.filter((t) => t.id !== tree.id);
      let player = { ...gameState.player };

      const drops = {
        oak: [{ id: 'mat_oak_wood', count: 3 }, { id: 'mat_wood', count: 2 }],
        pine: [{ id: 'mat_pine_wood', count: 3 }, { id: 'mat_resin', count: 2 }],
        birch: [{ id: 'mat_birch_wood', count: 3 }, { id: 'mat_tree_sap', count: 2 }],
        willow: [{ id: 'mat_willow_hardwood', count: 3 }],
        lumina: [{ id: 'mat_lumina_wood', count: 3 }, { id: 'mat_mystic_sap', count: 2 }],
        cherry: [{ id: 'mat_cherry_wood', count: 3 }, { id: 'crop_cherry_nectar', count: 1 }],
        ironbark: [{ id: 'mat_ironbark_wood', count: 3 }],
        golden_apple: [{ id: 'crop_golden_apple', count: 2 }, { id: 'mat_wood', count: 2 }]
      };

      const speciesDrops = drops[tree.species] || [{ id: 'mat_wood', count: 4 }];
      speciesDrops.forEach((d) => addItemToInventory(player, d.id, d.count));

      addFloatingText(`Pohon ${tree.species.toUpperCase()} Tumbang! 🪓`, tree.x * TILE_SIZE + 20, tree.y * TILE_SIZE, '#4ade80');
      setGameState({ ...gameState, player });
    } else {
      addFloatingText(`Kapak! (${tree.hp}/${tree.maxHp})`, tree.x * TILE_SIZE + 20, tree.y * TILE_SIZE, '#fde047');
    }
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

    // Harvest Crop
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
    // Watering Can
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
    // Axe on Weeds or Logs
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
    // Planting Crop Seeds
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
    // Planting Tree Saplings (8 Species)
    else if (curItem?.id?.startsWith('sapling_')) {
      const species = curItem.id.replace('sapling_', '');
      const existingTree = treesRef.current.find((t) => t.x === tx && t.y === ty);
      if (!existingTree && (targetTile.tile_type === 'grass' || targetTile.tile_type === 'tilled')) {
        treesRef.current.push({
          id: `t_${species}_${Date.now()}`,
          species,
          x: tx,
          y: ty,
          hp: 3,
          maxHp: 3,
          shake: 0
        });
        consumeEquippedItem(player);
        sounds.playHoe();
        addFloatingText(`🌱 Tanam Pohon ${species.toUpperCase()}!`, tx * TILE_SIZE + 20, ty * TILE_SIZE, '#4ade80');
        spawnParticles(tx * TILE_SIZE + 20, ty * TILE_SIZE + 20, 6, '#22c55e', 'leaves');
        modified = true;
      }
    }
    // Applying Fertilizers (Organic or Speed Grow)
    else if (curItem?.id === 'item_fertilizer_organic' || curItem?.id === 'item_fertilizer_speed') {
      if ((targetTile.tile_type === 'tilled' || targetTile.tile_type === 'watered') && !targetTile.fertilizer) {
        targetTile.fertilizer = curItem.id;
        consumeEquippedItem(player);
        sounds.playWater();
        addFloatingText('✨ Pupuk Diberikan!', tx * TILE_SIZE + 20, ty * TILE_SIZE, '#f59e0b');
        spawnParticles(tx * TILE_SIZE + 20, ty * TILE_SIZE + 20, 8, '#fbbf24', 'sparkle');
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

  // =========================================================================
  // VIEW MODE 1: 3D ISOMETRIC PROJECTION RENDERING ENGINE
  // =========================================================================
  const render3DIsometric = (ctx, animTimer, dt) => {
    // 1. Sky backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, 640);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.4, '#1e293b');
    grad.addColorStop(1, '#0c1322');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 640);

    // 2. Bedrock Foundation Pedestal
    const baseP1 = toIso(0, 0, -22);
    const baseP2 = toIso(GRID_COLS, 0, -22);
    const baseP3 = toIso(GRID_COLS, GRID_ROWS, -22);
    const baseP4 = toIso(0, GRID_ROWS, -22);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(baseP1.x, baseP1.y);
    ctx.lineTo(baseP2.x, baseP2.y);
    ctx.lineTo(baseP3.x, baseP3.y);
    ctx.lineTo(baseP4.x, baseP4.y);
    ctx.closePath();
    ctx.fill();

    // 3. Painter's Algorithm: Depth Sort from back (0) to front (30)
    for (let depth = 0; depth <= (GRID_COLS + GRID_ROWS - 2); depth++) {
      for (let gx = 0; gx < GRID_COLS; gx++) {
        const gy = depth - gx;
        if (gy < 0 || gy >= GRID_ROWS) continue;

        // Skip Farmhouse interior tiles (drawn together as big 3D building)
        const isHouseTile = gx >= 11 && gx <= 14 && gy >= 1 && gy <= 3;
        const isPondTile = gx >= 2 && gx <= 3 && gy >= 2 && gy <= 3;

        // Draw Extruded 3D Voxel Tile
        draw3DTile(ctx, gx, gy, isPondTile, animTimer);

        // Draw 3D Farmhouse when reaching origin tile (14, 3)
        if (gx === 14 && gy === 3) {
          draw3DFarmhouse(ctx, animTimer);
        }

        // Draw 3D Shipping Bin at (14, 5)
        if (gx === 14 && gy === 5) {
          draw3DShippingBin(ctx);
        }

        // Draw 3D Water Pond at (3, 3)
        if (gx === 3 && gy === 3) {
          draw3DPondSurface(ctx, animTimer);
        }

        // Draw 3D Blueprint Structure if placed on tile
        const tile = gameState?.farm_grid?.[gy]?.[gx];
        if (tile && tile.structure_type) {
          draw3DStructure(ctx, tile.structure_type, gx, gy, animTimer);
        }

        // Draw 3D Crop
        if (tile && tile.crop && !isHouseTile && !isPondTile) {
          draw3DCrop(ctx, tile.crop, gx, gy, animTimer);
        }

        // Draw 3D Tree if planted here
        const tree = treesRef.current.find((t) => t.x === gx && t.y === gy);
        if (tree) {
          draw3DTree(ctx, tree, animTimer);
        }

        // Draw 3D Animals on this tile
        animalsRef.current.forEach((a) => {
          const agx = Math.floor(a.x / TILE_SIZE);
          const agy = Math.floor(a.y / TILE_SIZE);
          if (agx === gx && agy === gy) {
            draw3DAnimal(ctx, a);
          }
        });

        // Draw 3D Tractor
        const tgx = Math.floor(tractorRef.current.x / TILE_SIZE);
        const tgy = Math.floor(tractorRef.current.y / TILE_SIZE);
        if (tgx === gx && tgy === gy) {
          draw3DTractor(ctx, tractorRef.current, isMountedRef.current, animTimer);
        }

        // Draw 3D Living NPCs
        for (const [npcId, npc] of multiplayer.npcs.entries()) {
          if (Math.floor(npc.x) === gx && Math.floor(npc.y) === gy) {
            draw3DNPC(ctx, npcId, npc);
          }
        }

        // Draw 3D Local Player (if not mounted)
        const pgx = Math.floor(playerPosRef.current.x / TILE_SIZE);
        const pgy = Math.floor(playerPosRef.current.y / TILE_SIZE);
        if (pgx === gx && pgy === gy && !isMountedRef.current) {
          draw3DPlayer(ctx);
        }
      }
    }

    // 4. 3D Hover Reticle
    draw3DReticle(ctx, hoverTile.x, hoverTile.y, animTimer);

    // 5. 3D Atmospheric Particles & Rain
    renderParticles(ctx);
    if (gameState?.world?.weather === 'Rainy') renderRain(ctx);
  };

  // Draw Extruded 3D Tile with Top, Left & Right shading
  const draw3DTile = (ctx, gx, gy, isPond, animTimer) => {
    const tile = gameState?.farm_grid?.[gy]?.[gx];
    const tileType = tile ? tile.tile_type : 'grass';
    const height = isPond ? -6 : 10;

    const pTop = toIso(gx, gy, height);
    const pRight = toIso(gx + 1, gy, height);
    const pBottom = toIso(gx + 1, gy + 1, height);
    const pLeft = toIso(gx, gy + 1, height);

    const bLeft = toIso(gx, gy + 1, 0);
    const bBottom = toIso(gx + 1, gy + 1, 0);
    const bRight = toIso(gx + 1, gy, 0);

    // Colors
    let topColor = '#225a27';
    let leftColor = '#163b1a';
    let rightColor = '#1b451f';

    if (tileType === 'tilled') {
      topColor = '#78350f';
      leftColor = '#451a03';
      rightColor = '#592205';
    } else if (tileType === 'watered') {
      topColor = '#3b1a06';
      leftColor = '#241003';
      rightColor = '#2c1404';
    } else if (tileType === 'sand') {
      topColor = '#d97706';
      leftColor = '#b45309';
      rightColor = '#92400e';
    } else if (tileType === 'snow') {
      topColor = '#f1f5f9';
      leftColor = '#cbd5e1';
      rightColor = '#94a3b8';
    } else if (tileType === 'marsh') {
      topColor = '#3f4f24';
      leftColor = '#2a3617';
      rightColor = '#1e2710';
    } else if (tileType === 'cobblestone') {
      topColor = '#64748b';
      leftColor = '#475569';
      rightColor = '#334155';
    } else if (tileType === 'volcanic') {
      topColor = '#292524';
      leftColor = '#1c1917';
      rightColor = '#0c0a09';
    } else if (tileType === 'water_shallow') {
      topColor = '#38bdf8';
      leftColor = '#0284c7';
      rightColor = '#0369a1';
    } else if (tileType === 'water_deep') {
      topColor = '#0369a1';
      leftColor = '#075985';
      rightColor = '#0c4a6e';
    }

    if (isPond || tileType === 'water_shallow' || tileType === 'water_deep') {
      if (!isPond && tileType === 'water_shallow') {
        topColor = '#38bdf8';
        leftColor = '#0284c7';
        rightColor = '#0369a1';
      } else {
        topColor = '#0369a1';
        leftColor = '#075985';
        rightColor = '#0c4a6e';
      }
    }

    // Left Vertical Wall
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(pLeft.x, pLeft.y);
    ctx.lineTo(pBottom.x, pBottom.y);
    ctx.lineTo(bBottom.x, bBottom.y);
    ctx.lineTo(bLeft.x, bLeft.y);
    ctx.closePath();
    ctx.fill();

    // Right Vertical Wall
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(pBottom.x, pBottom.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(bRight.x, bRight.y);
    ctx.lineTo(bBottom.x, bBottom.y);
    ctx.closePath();
    ctx.fill();

    // Top Diamond Face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pBottom.x, pBottom.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();
    ctx.fill();

    // Tile Grid Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fertilizer Sparkle
    if (tile && tile.fertilizer) {
      const center = toIso(gx + 0.5, gy + 0.5, height);
      ctx.fillStyle = tile.fertilizer === 'item_fertilizer_speed' ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(center.x, center.y - 2, 2.5 + Math.sin(animTimer * 6) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 3D Volumetric Farmhouse
  const draw3DFarmhouse = (ctx, animTimer) => {
    const pBase = toIso(12.5, 2.5, 10);

    // 3D House Body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(pBase.x - 38, pBase.y - 10);
    ctx.lineTo(pBase.x, pBase.y - 28);
    ctx.lineTo(pBase.x + 38, pBase.y - 10);
    ctx.lineTo(pBase.x + 38, pBase.y + 18);
    ctx.lineTo(pBase.x - 38, pBase.y + 18);
    ctx.closePath();
    ctx.fill();

    // 3D Sloped Terracotta Roof
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(pBase.x - 42, pBase.y - 10);
    ctx.lineTo(pBase.x, pBase.y - 48);
    ctx.lineTo(pBase.x + 42, pBase.y - 10);
    ctx.lineTo(pBase.x, pBase.y - 26);
    ctx.closePath();
    ctx.fill();

    // Chimney & Animated Smoke
    ctx.fillStyle = '#475569';
    ctx.fillRect(pBase.x + 18, pBase.y - 58, 8, 22);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.beginPath();
    ctx.arc(pBase.x + 22, pBase.y - 64 - (animTimer * 12) % 18, 4 + ((animTimer * 10) % 6), 0, Math.PI * 2);
    ctx.fill();

    // Glowing Window
    ctx.fillStyle = '#fde047';
    ctx.fillRect(pBase.x - 18, pBase.y - 2, 10, 10);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(pBase.x + 8, pBase.y, 10, 18);
  };

  // 3D Shipping Bin
  const draw3DShippingBin = (ctx) => {
    const p = toIso(14.5, 5.5, 10);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(p.x - 10, p.y - 14, 20, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(p.x - 4, p.y - 10, 8, 5);
  };

  // 3D Water Pond Surface
  const draw3DPondSurface = (ctx, animTimer) => {
    const p = toIso(3.0, 3.0, 4);
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glistening wave
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(p.x + Math.sin(animTimer * 2) * 5, p.y - 2, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // 3D Volumetric Trees (8 Species!)
  const draw3DTree = (ctx, tree, animTimer) => {
    const p = toIso(tree.x + 0.5, tree.y + 0.5, 10);
    const shakeX = tree.shake > 0 ? Math.sin(animTimer * 40) * 4 : 0;

    // 3D Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D Trunk
    const trunkColor = {
      oak: '#78350f',
      pine: '#451a03',
      birch: '#e2e8f0',
      willow: '#5b2909',
      lumina: '#0f172a',
      cherry: '#581c87',
      ironbark: '#1e293b',
      golden_apple: '#78350f'
    }[tree.species] || '#78350f';

    ctx.fillStyle = trunkColor;
    ctx.fillRect(p.x - 3 + shakeX, p.y - 24, 6, 24);

    if (tree.species === 'birch') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x - 3 + shakeX, p.y - 18, 6, 2);
      ctx.fillRect(p.x - 3 + shakeX, p.y - 10, 6, 2);
    }

    // 3D Volumetric Foliage Canopy
    const cx = p.x + shakeX;
    const cy = p.y - 38;

    if (tree.species === 'pine') {
      // Tiered Evergreen Cone
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx + 14, cy);
      ctx.lineTo(cx - 14, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 18, cy + 12);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.closePath();
      ctx.fill();
    } else if (tree.species === 'lumina') {
      // Luminescent Cyan Crystal Crown
      ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (tree.species === 'cherry') {
      // Sakura Blossom Fluffy Cloud
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(cx - 7, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx, cy - 8, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (tree.species === 'willow') {
      // Drooping Cascading Vines
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx - 14, cy + 18);
      ctx.moveTo(cx + 12, cy);
      ctx.lineTo(cx + 14, cy + 18);
      ctx.stroke();
    } else if (tree.species === 'golden_apple') {
      // Emerald Foliage with Golden Apples
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx - 6, cy + 2, 4, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard Oak / Birch / Ironbark Volumetric Sphere
      const folColor = tree.species === 'ironbark' ? '#3f6212' : (tree.species === 'birch' ? '#65a30d' : '#15803d');
      ctx.fillStyle = folColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 5, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar if hit
    if (tree.hp < tree.maxHp) {
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(cx - 12, cy - 24, 24, 3);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(cx - 12, cy - 24, (24 * tree.hp) / tree.maxHp, 3);
    }
  };

  // 3D Tractor Model
  const draw3DTractor = (ctx, tractor, mounted, animTimer) => {
    const gx = tractor.x / TILE_SIZE;
    const gy = tractor.y / TILE_SIZE;
    const p = toIso(gx + 0.5, gy + 0.5, 10);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 2, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D Giant Rear Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p.x - 16, p.y - 12, 6, 14);
    ctx.fillRect(p.x + 10, p.y - 12, 6, 14);

    // 3D Green Tractor Chassis
    ctx.fillStyle = '#15803d';
    ctx.fillRect(p.x - 10, p.y - 16, 20, 15);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(p.x - 8, p.y - 20, 16, 6);

    // Cabin Glass
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(p.x - 6, p.y - 28, 12, 9);

    // Smokestack & Smoke
    ctx.fillStyle = '#475569';
    ctx.fillRect(p.x + 6, p.y - 32, 3, 16);

    // Front Attachment
    const att = tractorAttachment;
    if (att === 'tiller') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x - 14, p.y - 2, 28, 4);
    } else if (att === 'sprayer') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(p.x - 16, p.y - 2, 32, 4);
    } else if (att === 'mower') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(p.x - 12, p.y - 2, 24, 6);
    }

    // Floating Label
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('🚜 TRAKTOR', p.x - 22, p.y - 34);
  };

  // 3D Player Avatar with Full Race & Wardrobe Customization
  const draw3DPlayer = (ctx) => {
    const gx = playerPosRef.current.x / TILE_SIZE;
    const gy = playerPosRef.current.y / TILE_SIZE;
    const p = toIso(gx + 0.5, gy + 0.5, 10);

    const charProfile = gameState?.player?.character_profile || {};
    const wardrobe = gameState?.player?.wardrobe || {};

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottoms
    let bottomColor = '#1e3a8a';
    if (wardrobe.bottom === 'pants_hardy_leather') bottomColor = '#78350f';
    else if (wardrobe.bottom === 'trousers_silk_gold') bottomColor = '#ca8a04';
    else if (wardrobe.bottom === 'skirt_pleated_green') bottomColor = '#166534';
    ctx.fillStyle = bottomColor;
    ctx.fillRect(p.x - 4, p.y - 10, 8, 8);

    // Tops
    let topColor = '#dc2626';
    if (wardrobe.top === 'armor_iron_mail') topColor = '#64748b';
    else if (wardrobe.top === 'robe_velvet_royal') topColor = '#831843';
    else if (wardrobe.top === 'coat_engineer_cyan') topColor = '#0891b2';
    else if (wardrobe.top === 'tunic_emerald_druid') topColor = '#15803d';
    ctx.fillStyle = topColor;
    ctx.fillRect(p.x - 4, p.y - 16, 8, 6);

    // Head / Skin Tone
    const skinTone = charProfile.skin_tone || '#fed7aa';
    ctx.fillStyle = skinTone;
    ctx.fillRect(p.x - 3, p.y - 22, 6, 6);

    // Hair
    const hairColor = charProfile.hair_color || '#78350f';
    ctx.fillStyle = hairColor;
    ctx.fillRect(p.x - 4, p.y - 24, 8, 3);

    // Horns (Draconic/Crystal)
    if (charProfile.appendages?.horns && charProfile.appendages.horns !== 'none') {
      ctx.fillStyle = charProfile.appendages.horns === 'horns_crystal' ? '#38bdf8' : '#78350f';
      ctx.fillRect(p.x - 5, p.y - 27, 2, 4);
      ctx.fillRect(p.x + 3, p.y - 27, 2, 4);
    }

    // Headwear
    if (wardrobe.headwear === 'hat_straw') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(p.x - 6, p.y - 25, 12, 3);
    } else if (wardrobe.headwear === 'helm_iron') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(p.x - 4, p.y - 26, 8, 5);
    } else if (wardrobe.headwear === 'crown_laurel') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(p.x - 4, p.y - 25, 8, 2);
    } else if (wardrobe.headwear === 'hat_beret_merchant') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(p.x - 5, p.y - 26, 10, 3);
    }
  };

  // 3D Living NPC
  const draw3DNPC = (ctx, npcId, npc) => {
    const p = toIso(npc.x + 0.5, npc.y + 0.5, 10);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const npcColor = npcId === 'npc_elara' ? '#15803d' : (npcId === 'npc_rowan' ? '#78350f' : (npcId === 'npc_nessa' ? '#0891b2' : '#831843'));
    ctx.fillStyle = npcColor;
    ctx.fillRect(p.x - 4, p.y - 14, 8, 12);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(p.x - 3, p.y - 20, 6, 6);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(npc.name, p.x - 12, p.y - 24);
  };

  // 3D Animal
  const draw3DAnimal = (ctx, a) => {
    const gx = a.x / TILE_SIZE;
    const gy = a.y / TILE_SIZE;
    const p = toIso(gx, gy, 10);
    ctx.font = a.type === 'sheep' ? '18px sans-serif' : '14px sans-serif';
    ctx.fillText(a.type === 'sheep' ? '🐑' : '🐔', p.x - 9, p.y - 2);
  };

  // 3D Crop
  const draw3DCrop = (ctx, crop, gx, gy, animTimer) => {
    const p = toIso(gx + 0.5, gy + 0.5, 12);
    const stage = crop.stage;

    if (stage >= crop.max_stage) {
      // Mature glowing crop
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(p.x - 2, p.y - 4 - stage * 2, 4, 4 + stage * 2);
    }
  };

  // 3D Blueprint Structure
  const draw3DStructure = (ctx, structType, gx, gy, animTimer) => {
    const p = toIso(gx + 0.5, gy + 0.5, 10);

    if (structType === 'sprinkler' || structType === 'struct_sprinkler_basic' || structType === 'struct_sprinkler_modern') {
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(p.x - 3, p.y - 12, 6, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 14, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (structType === 'struct_mana_pylon') {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 24);
      ctx.lineTo(p.x + 6, p.y - 8);
      ctx.lineTo(p.x - 6, p.y - 8);
      ctx.closePath();
      ctx.fill();
    } else if (structType === 'struct_street_lamp') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x - 2, p.y - 22, 4, 22);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 24, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x - 7, p.y - 10, 14, 10);
    }
  };

  // 3D Isometric Hover Reticle
  const draw3DReticle = (ctx, gx, gy, animTimer) => {
    const pTop = toIso(gx, gy, 11);
    const pRight = toIso(gx + 1, gy, 11);
    const pBottom = toIso(gx + 1, gy + 1, 11);
    const pLeft = toIso(gx, gy + 1, 11);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2 + Math.sin(animTimer * 6) * 0.5;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pBottom.x, pBottom.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();
    ctx.stroke();
  };

  // =========================================================================
  // VIEW MODE 2: BLUEPRINT CAD ARCHITECTURAL ENGINE
  // =========================================================================
  const renderBlueprintCAD = (ctx, animTimer) => {
    // 1. Deep blueprint navy background
    ctx.fillStyle = '#071322';
    ctx.fillRect(0, 0, 640, 640);

    // 2. High-Tech Precision CAD Grid (10px minor, 40px major)
    ctx.strokeStyle = '#0d2847';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#155e75';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 640; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y <= 640; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // 3. Coordinate Labels in Neon Cyan
    ctx.fillStyle = '#06b6d4';
    ctx.font = '8px monospace';
    for (let i = 0; i < GRID_COLS; i++) {
      ctx.fillText(`X:${i < 10 ? '0' + i : i}`, i * TILE_SIZE + 4, 10);
      ctx.fillText(`Y:${i < 10 ? '0' + i : i}`, 2, i * TILE_SIZE + 12);
    }

    // 4. Blueprint Wireframes for Structures & Farm Tiles
    if (gameState?.farm_grid) {
      gameState.farm_grid.forEach((row, y) => {
        row.forEach((tile, x) => {
          const tx = x * TILE_SIZE;
          const ty = y * TILE_SIZE;

          if (tile.tile_type === 'tilled') {
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1;
            // Crosshatch CAD pattern
            ctx.beginPath();
            ctx.moveTo(tx + 4, ty + 4);
            ctx.lineTo(tx + 36, ty + 36);
            ctx.stroke();
          } else if (tile.tile_type === 'watered') {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(tx + 3, ty + 3, 34, 34);
          }

          if (tile.crop) {
            ctx.fillStyle = '#4ade80';
            ctx.font = '9px monospace';
            ctx.fillText(`🌱C${tile.crop.stage}`, tx + 6, ty + 24);
          }

          if (tile.structure_type) {
            drawBlueprintStructureWireframe(ctx, tile.structure_type, tx, ty, animTimer);
          }
        });
      });
    }

    // Farmhouse Blueprint Box
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(11 * TILE_SIZE, 1 * TILE_SIZE, 4 * TILE_SIZE, 3 * TILE_SIZE);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('RUMAH PETANI [16m×12m]', 11 * TILE_SIZE + 8, 2 * TILE_SIZE);

    // Water Pond Blueprint Box
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(2 * TILE_SIZE, 2 * TILE_SIZE, 2 * TILE_SIZE, 2 * TILE_SIZE);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('KOLAM AIR [8m×8m]', 2 * TILE_SIZE + 4, 3 * TILE_SIZE);

    // 5. Holographic Placement Ghost Cursor (if Blueprint is active)
    if (activeBlueprint) {
      const hx = hoverTile.x * TILE_SIZE;
      const hy = hoverTile.y * TILE_SIZE;
      const radius = activeBlueprint.area_radius || 1;

      // Area Coverage Circle (e.g. 3x3 or 5x5)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx + 20, hy + 20, (radius * TILE_SIZE) / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ghost Box (Green if valid, Red if occupied)
      const targetTile = gameState?.farm_grid?.[hoverTile.y]?.[hoverTile.x];
      const isBlocked = targetTile?.structure_type || (hoverTile.x >= 11 && hoverTile.y <= 3) || (hoverTile.x >= 2 && hoverTile.x <= 3 && hoverTile.y >= 2 && hoverTile.y <= 3);

      ctx.fillStyle = isBlocked ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)';
      ctx.fillRect(hx + 2, hy + 2, 36, 36);
      ctx.strokeStyle = isBlocked ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 2, hy + 2, 36, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(isBlocked ? 'BLOCKED ✗' : `${activeBlueprint.name} ✓`, hx - 10, hy - 6);
    }
  };

  const drawBlueprintStructureWireframe = (ctx, structType, tx, ty, animTimer) => {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx + 6, ty + 6, 28, 28);

    if (structType.includes('sprinkler')) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(tx + 20, ty + 20, TILE_SIZE * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText('SPRINKLER', tx + 2, ty + 22);
    } else {
      ctx.fillStyle = '#67e8f9';
      ctx.font = '8px monospace';
      ctx.fillText('STRUKTUR', tx + 4, ty + 22);
    }
  };

  // =========================================================================
  // VIEW MODE 3: CLASSIC 2D TOP-DOWN RENDERING PIPELINE
  // =========================================================================
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

  const renderIrrigationPipes2D = (ctx) => {
    if (!gameState?.farm_grid) return;
    gameState.farm_grid.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.structure_type === 'struct_irrigation_pipe') {
          const tx = x * TILE_SIZE;
          const ty = y * TILE_SIZE;
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(tx + 16, ty + 6, 8, 28);
          ctx.fillRect(tx + 6, ty + 16, 28, 8);
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 20, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
  };

  const renderPastureFence = (ctx) => {
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.strokeRect(1 * TILE_SIZE, 8.5 * TILE_SIZE, 3.5 * TILE_SIZE, 4.5 * TILE_SIZE);
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
        } else if (tile.tile_type === 'sand') {
          ctx.fillStyle = '#fcd34d';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(tx + 6, ty + 8, 14, 2);
          ctx.fillRect(tx + 18, ty + 20, 16, 2);
        } else if (tile.tile_type === 'snow') {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(tx + 8, ty + 12, 4, 4);
          ctx.fillRect(tx + 24, ty + 22, 5, 5);
        } else if (tile.tile_type === 'marsh') {
          ctx.fillStyle = '#365314';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#14532d';
          ctx.fillRect(tx + 4, ty + 14, 12, 6);
          ctx.fillStyle = '#713f12';
          ctx.fillRect(tx + 20, ty + 8, 10, 8);
        } else if (tile.tile_type === 'cobblestone') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 3, ty + 3, 16, 14);
          ctx.strokeRect(tx + 21, ty + 3, 16, 14);
          ctx.strokeRect(tx + 11, ty + 19, 18, 14);
        } else if (tile.tile_type === 'volcanic') {
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(tx + 8, ty + 14, 12, 2);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(tx + 18, ty + 24, 10, 2);
        } else if (tile.tile_type === 'water_shallow') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(tx + 4, ty + 10, 16, 3);
          ctx.fillRect(tx + 16, ty + 24, 18, 3);
        } else if (tile.tile_type === 'water_deep') {
          ctx.fillStyle = '#0369a1';
          ctx.fillRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#075985';
          ctx.fillRect(tx + 6, ty + 12, 14, 4);
          ctx.fillRect(tx + 14, ty + 26, 18, 4);
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

        // Fertilizer Particle Indicator
        if (tile.fertilizer) {
          ctx.fillStyle = tile.fertilizer === 'item_fertilizer_speed' ? '#38bdf8' : '#fbbf24';
          ctx.beginPath();
          ctx.arc(tx + 8, ty + 8, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sprinkler or Blueprint structure
        if (tile.structure_type === 'sprinkler' || tile.structure_type === 'struct_sprinkler_basic') {
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(tx + 17, ty + 14, 6, 18);
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 12, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile.structure_type === 'struct_sprinkler_modern') {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(tx + 15, ty + 10, 10, 22);
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath();
          ctx.arc(tx + 20, ty + 10, 8, 0, Math.PI * 2);
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
      } else if (crop.crop_id === 'crop_beetroot') {
        ctx.fillStyle = '#831843';
        ctx.beginPath();
        ctx.ellipse(tx + 20, ty + 23, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (crop.crop_id === 'crop_wheat') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(tx + 16, ty + 10, 8, 22);
      } else if (crop.crop_id === 'crop_golden_pumpkin') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 22, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (crop.crop_id === 'crop_frostberry') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tx + 17, ty + 20, 6, 0, Math.PI * 2);
        ctx.arc(tx + 23, ty + 22, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(tx + 20, ty + 20, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // 2D Trees Rendering (8 Species!)
  const renderTrees2D = (ctx, animTimer) => {
    treesRef.current.forEach((tree) => {
      const tx = tree.x * TILE_SIZE;
      const ty = tree.y * TILE_SIZE;
      const shakeX = tree.shake > 0 ? Math.sin(animTimer * 40) * 4 : 0;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(tx + 20, ty + 36, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = tree.species === 'birch' ? '#e2e8f0' : (tree.species === 'lumina' ? '#0f172a' : '#78350f');
      ctx.fillRect(tx + 16 + shakeX, ty + 16, 8, 22);

      // Crown
      const cx = tx + 20 + shakeX;
      const cy = ty + 10;

      if (tree.species === 'pine') {
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24);
        ctx.lineTo(cx + 18, cy + 12);
        ctx.lineTo(cx - 18, cy + 12);
        ctx.closePath();
        ctx.fill();
      } else if (tree.species === 'cherry') {
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (tree.species === 'lumina') {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (tree.species === 'golden_apple') {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(cx - 7, cy + 2, 4, 0, Math.PI * 2);
        ctx.arc(cx + 7, cy - 3, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = tree.species === 'ironbark' ? '#3f6212' : '#15803d';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tree Label & HP bar
      if (tree.hp < tree.maxHp) {
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx - 12, cy - 24, 24, 4);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 12, cy - 24, (24 * tree.hp) / tree.maxHp, 4);
      }
    });
  };

  // 2D Tractor Rendering
  const renderTractor2D = (ctx, animTimer) => {
    const tx = tractorRef.current.x;
    const ty = tractorRef.current.y;
    const dir = tractorRef.current.dir;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(tx + 20, ty + 24, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tx + 2, ty + 6, 8, 28);
    ctx.fillRect(tx + 30, ty + 6, 8, 28);

    // Green Chassis Body
    ctx.fillStyle = '#15803d';
    ctx.fillRect(tx + 8, ty + 8, 24, 24);

    // Cabin
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(tx + 12, ty + 12, 16, 12);

    // Front/Rear Attachment Swath Bar
    const att = tractorAttachment;
    ctx.fillStyle = att === 'tiller' ? '#b45309' : (att === 'sprayer' ? '#0284c7' : '#eab308');
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(dir === 'right' ? tx + 34 : tx - 4, ty + 2, 6, 36);
    } else {
      ctx.fillRect(tx + 2, dir === 'down' ? ty + 34 : ty - 4, 36, 6);
    }

    // Driver inside if mounted
    if (isMountedRef.current) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(tx + 16, ty + 14, 8, 6);
    }

    // Floating Prompt if player is nearby and not mounted
    const dist = Math.hypot(playerPosRef.current.x - tx, playerPosRef.current.y - ty);
    if (dist < 90 && !isMountedRef.current) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx - 12, ty - 18, 64, 15);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('🚜 [T] Naik Traktor', tx - 8, ty - 7);
    }
  };

  // Particles (Smoke, Sparks, Fertilizer)
  const renderParticles = (ctx) => {
    particlesRef.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  // Render Zone Maps (Preserved from existing code)
  const renderZoneVillage = (ctx) => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('🏘️ Greenvale Village Square', 20, 30);
  };
  const renderZoneWoods = (ctx) => {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('🌲 Hutan Belantara Whispering Woods', 20, 30);
  };
  const renderZoneLab = (ctx) => {
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('🔬 Laboratorium Steam & Magic', 20, 30);
  };
  const renderZoneLake = (ctx) => {
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('⛵ Danau Kristal Azure', 20, 30);
  };
  const renderZoneMines = (ctx) => {
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('⛏️ Gua Tambang Batubara & Aether', 20, 30);
  };
  const renderZoneRuins = (ctx) => {
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('🏛️ Reruntuhan Kuno Aetheria', 20, 30);
  };
  const renderZoneSummit = (ctx) => {
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '12px sans-serif';
    ctx.fillText('🌾 Puncak Kincir Angin Gunung', 20, 30);
  };

  // Render Living A* Pathfinding NPCs
  const renderPathfindingNPCs = (ctx) => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;

    for (const [npcId, npc] of multiplayer.npcs.entries()) {
      const nx = npc.x * TILE_SIZE;
      const ny = npc.y * TILE_SIZE;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(nx + 20, ny + 35, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (npcId === 'npc_elara') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(nx + 13, ny + 18, 14, 14);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 14, ny + 8, 12, 10);
      } else if (npcId === 'npc_rowan') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(nx + 12, ny + 17, 16, 15);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(nx + 14, ny + 8, 12, 10);
      } else if (npcId === 'npc_nessa') {
        ctx.fillStyle = '#0891b2';
        ctx.fillRect(nx + 13, ny + 17, 14, 15);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 14, ny + 8, 12, 10);
      } else {
        ctx.fillStyle = '#831843';
        ctx.fillRect(nx + 13, ny + 17, 14, 15);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(nx + 14, ny + 8, 12, 10);
      }

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(npc.name, nx + 8, ny + 4);

      const dist = Math.hypot(px - nx, py - ny);
      if (dist < 75) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(nx - 12, ny - 16, 64, 15);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('💬 [Klik] Bicara', nx - 10, ny - 6);
      }
    }
  };

  const renderRemotePlayers = (ctx, dt) => {
    for (const [clientId, p] of multiplayer.remotePlayers.entries()) {
      p.x += (p.targetX - p.x) * Math.min(1.0, dt * 14);
      p.y += (p.targetY - p.y) * Math.min(1.0, dt * 14);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(p.x + 20, p.y + 36, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.shirt_color || '#3b82f6';
      ctx.fillRect(p.x + 13, p.y + 16, 14, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(p.x + 14, p.y + 7, 12, 10);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(p.name, p.x + 6, p.y - 4);
    }
  };

  const renderPlayer = (ctx) => {
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const dir = playerDirRef.current;
    const isMoving = isMovingRef.current;
    const step = isMoving ? Math.floor(walkFrameRef.current) % 2 : 0;

    const charProfile = gameState?.player?.character_profile || {};
    const wardrobe = gameState?.player?.wardrobe || {};

    // 1. Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(px + 20, py + 36, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mount (Tunggangan) under player if mounted
    const mountData = gameState?.player?.mounts_data;
    if (mountData?.is_mounted) {
      const activeMount = mountData.active_mount_id || 'horse';
      const mColors = {
        horse: '#854d0e',
        pony: '#a16207',
        deer: '#b45309',
        giant_rabbit: '#f1f5f9',
        alpaca: '#fef08a',
        wolf_mount: '#64748b',
        crystal_fox: '#38bdf8',
        unicorn: '#f472b6',
        griffin: '#f59e0b',
        dragon: '#ef4444'
      };
      const mColor = mColors[activeMount] || '#854d0e';

      ctx.save();
      ctx.fillStyle = mColor;
      ctx.beginPath();
      ctx.ellipse(px + 20, py + 28, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      const hx = dir === 'right' ? px + 32 : dir === 'left' ? px + 8 : px + 20;
      const hy = dir === 'up' ? py + 18 : py + 26;
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + 15, py + 24, 10, 6);

      if (['crystal_fox', 'unicorn', 'dragon'].includes(activeMount)) {
        ctx.strokeStyle = activeMount === 'crystal_fox' ? '#38bdf8' : activeMount === 'unicorn' ? '#f472b6' : '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(px + 20, py + 28, 17, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Wings (Behind body)
    if (charProfile.appendages?.wings && charProfile.appendages.wings !== 'none') {
      if (charProfile.appendages.wings === 'wings_fairy_glimmer') {
        ctx.fillStyle = 'rgba(165, 243, 252, 0.7)';
        ctx.fillRect(px + 4, py + 12, 8, 12);
        ctx.fillRect(px + 28, py + 12, 8, 12);
      } else if (charProfile.appendages.wings === 'wings_dragon_leather') {
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(px + 2, py + 10, 10, 14);
        ctx.fillRect(px + 28, py + 10, 10, 14);
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(px + 4, py + 12, 8, 12);
        ctx.fillRect(px + 28, py + 12, 8, 12);
      }
    }

    // 3. Tail (Behind body)
    if (charProfile.appendages?.tail && charProfile.appendages.tail !== 'none') {
      ctx.fillStyle = charProfile.hair_color || '#d97706';
      ctx.fillRect(px + 28, py + 24, 7, 6);
    }

    // 4. Back Item (Cape / Backpack)
    if (wardrobe.back_item === 'cape_crimson_knight') {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(px + 10, py + 18, 20, 14);
    } else if (wardrobe.back_item === 'backpack_leather') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 11, py + 16, 18, 12);
    }

    // 5. Legs / Bottoms & Footwear
    let bottomColor = '#1e3a8a';
    if (wardrobe.bottom === 'pants_hardy_leather') bottomColor = '#78350f';
    else if (wardrobe.bottom === 'trousers_silk_gold') bottomColor = '#ca8a04';
    else if (wardrobe.bottom === 'skirt_pleated_green') bottomColor = '#166534';

    const legOffset = isMoving ? (step === 0 ? -3 : 3) : 0;
    ctx.fillStyle = bottomColor;
    ctx.fillRect(px + 12, py + 26, 6, 10 + legOffset);
    ctx.fillRect(px + 22, py + 26, 6, 10 - legOffset);

    // Footwear
    let bootColor = '#451a03';
    if (wardrobe.footwear === 'boots_iron_greaves') bootColor = '#475569';
    else if (wardrobe.footwear === 'sandals_elven_woven') bootColor = '#b45309';
    ctx.fillStyle = bootColor;
    ctx.fillRect(px + 11, py + 34 + legOffset, 7, 3);
    ctx.fillRect(px + 22, py + 34 - legOffset, 7, 3);

    // 6. Torso / Top
    let topColor = '#dc2626';
    if (wardrobe.top === 'armor_iron_mail') topColor = '#64748b';
    else if (wardrobe.top === 'robe_velvet_royal') topColor = '#831843';
    else if (wardrobe.top === 'coat_engineer_cyan') topColor = '#0891b2';
    else if (wardrobe.top === 'tunic_emerald_druid') topColor = '#15803d';

    ctx.fillStyle = topColor;
    ctx.fillRect(px + 12, py + 16, 16, 12);

    // 7. Head & Skin Tone
    const skinTone = charProfile.skin_tone || '#fed7aa';
    ctx.fillStyle = skinTone;
    ctx.fillRect(px + 13, py + 6, 14, 12);

    // Ears
    if (charProfile.appendages?.ears === 'ears_elven_long') {
      ctx.fillStyle = skinTone;
      ctx.fillRect(px + 9, py + 8, 4, 3);
      ctx.fillRect(px + 27, py + 8, 4, 3);
    } else if (charProfile.appendages?.ears === 'ears_beast_fluffy') {
      ctx.fillStyle = charProfile.hair_color || '#d97706';
      ctx.fillRect(px + 11, py + 1, 4, 5);
      ctx.fillRect(px + 25, py + 1, 4, 5);
    }

    // Facial Markings & Eyes
    const eyeCol = charProfile.eye_color || '#2563eb';
    ctx.fillStyle = eyeCol;
    ctx.fillRect(px + 15, py + 10, 2, 2);
    ctx.fillRect(px + 23, py + 10, 2, 2);

    if (charProfile.facial_markings === 'mystic_rune') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 19, py + 7, 2, 2);
    } else if (charProfile.facial_markings === 'scar_cheek') {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(px + 23, py + 13, 3, 1);
    }

    // 8. Hair
    const hairColor = charProfile.hair_color || '#78350f';
    ctx.fillStyle = hairColor;
    if (charProfile.hair_style === 'braided_long') {
      ctx.fillRect(px + 11, py + 3, 18, 5);
      ctx.fillRect(px + 10, py + 6, 3, 14);
      ctx.fillRect(px + 27, py + 6, 3, 14);
    } else if (charProfile.hair_style === 'spiky') {
      ctx.fillRect(px + 11, py + 2, 18, 6);
      ctx.fillRect(px + 13, py - 1, 4, 4);
      ctx.fillRect(px + 23, py - 1, 4, 4);
    } else {
      ctx.fillRect(px + 11, py + 3, 18, 5);
    }

    // 9. Horns
    if (charProfile.appendages?.horns && charProfile.appendages.horns !== 'none') {
      ctx.fillStyle = charProfile.appendages.horns === 'horns_crystal' ? '#38bdf8' : '#78350f';
      ctx.fillRect(px + 12, py - 3, 3, 6);
      ctx.fillRect(px + 25, py - 3, 3, 6);
    }

    // 10. Headwear
    if (wardrobe.headwear === 'hat_straw') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(px + 8, py + 4, 24, 4);
      ctx.fillRect(px + 12, py - 2, 16, 6);
    } else if (wardrobe.headwear === 'helm_iron') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + 11, py + 1, 18, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 14, py + 8, 12, 2);
    } else if (wardrobe.headwear === 'crown_laurel') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 12, py + 3, 16, 3);
    } else if (wardrobe.headwear === 'hat_beret_merchant') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(px + 10, py - 1, 20, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 24, py - 4, 3, 5);
    }

    // Nameplate with Race
    const playerName = gameState?.player?.name || 'Kamu';
    const raceId = charProfile.race || 'human';
    const raceShort = raceId === 'human' ? '' : ` [${raceId.substring(0, 3).toUpperCase()}]`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(px - 4, py - 14, 48, 13);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(`${playerName}${raceShort}`, px, py - 5);

    if (localPlayerChatBubble) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 10, py - 30, 60, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillText(localPlayerChatBubble, px - 6, py - 18);
    }
  };

  const renderReticle = (ctx, animTimer) => {
    const rx = hoverTile.x * TILE_SIZE;
    const ry = hoverTile.y * TILE_SIZE;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2 + Math.sin(animTimer * 6) * 0.5;
    ctx.strokeRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  };

  const renderRain = (ctx) => {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    rainDropsRef.current.forEach((d) => {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 3, d.y + d.len);
    });
    ctx.stroke();
  };

  const renderLighting = (ctx) => {
    const hour = gameState?.world?.time_hour ?? 12;
    let alpha = 0;
    if (hour >= 20 || hour < 5) alpha = 0.55; // Night
    else if (hour >= 18) alpha = (hour - 18) * 0.25; // Dusk
    else if (hour < 7) alpha = (7 - hour) * 0.15; // Dawn

    if (alpha > 0) {
      ctx.fillStyle = `rgba(10, 15, 35, ${alpha})`;
      ctx.fillRect(0, 0, 640, 640);

      // Night Fireflies
      firefliesRef.current.forEach((ff) => {
        ctx.fillStyle = `rgba(253, 224, 71, ${ff.alpha})`;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  const renderFloatingTexts = (ctx) => {
    floatingTextsRef.current.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1.0;
  };

  return (
    <div className="relative border-4 border-amber-950/80 rounded-2xl overflow-hidden shadow-2xl bg-stone-950 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="cursor-crosshair max-w-[85vmin] max-h-[85vmin] aspect-square object-contain"
      />
    </div>
  );
}