import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../game/SoundFx';

export default function DungeonCombatModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const canvasRef = useRef(null);
  const [floor, setFloor] = useState(1);
  const [slimesKilled, setSlimesKilled] = useState(0);
  const [lootedOres, setLootedOres] = useState({
    mat_copper_ore: 0,
    mat_iron_ore: 0,
    mat_aether_crystal: 0
  });

  const dungeonPlayerRef = useRef({
    x: 240,
    y: 200,
    hp: 100,
    maxHp: 100,
    isAttacking: false,
    attackTimer: 0
  });

  const monstersRef = useRef([]);
  const oreNodesRef = useRef([]);

  // Initialize floor
  const initFloor = (fl) => {
    // Spawn 3 to 5 slimes
    const slimes = [];
    const count = 3 + fl;
    for (let i = 0; i < count; i++) {
      slimes.push({
        id: i,
        x: 60 + Math.random() * 380,
        y: 60 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        hp: 30 + fl * 10,
        maxHp: 30 + fl * 10,
        type: Math.random() < 0.35 ? 'crystal_bat' : 'slime',
        radius: 14
      });
    }
    monstersRef.current = slimes;

    // Spawn Ore Nodes
    const ores = [];
    for (let i = 0; i < 3 + fl; i++) {
      ores.push({
        id: i,
        x: 50 + Math.random() * 400,
        y: 50 + Math.random() * 280,
        hp: 3,
        type: Math.random() < 0.25 ? 'mat_aether_crystal' : Math.random() < 0.5 ? 'mat_iron_ore' : 'mat_copper_ore'
      });
    }
    oreNodesRef.current = ores;
  };

  useEffect(() => {
    if (isOpen) {
      if (gameState?.player) {
        dungeonPlayerRef.current.hp = gameState.player.hp;
        dungeonPlayerRef.current.maxHp = gameState.player.max_hp;
      }
      initFloor(floor);
    }
  }, [isOpen, floor]);

  // Dungeon Game Loop
  useEffect(() => {
    if (!isOpen) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();

    const keys = {};
    const onKey = (e) => {
      keys[e.code] = e.type === 'keydown';
      if (e.type === 'keydown' && (e.code === 'Space' || e.code === 'KeyJ')) {
        triggerDungeonAttack();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update Player
      const speed = 140;
      let dx = 0;
      let dy = 0;
      if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const p = dungeonPlayerRef.current;
      p.x = Math.max(20, Math.min(canvas.width - 20, p.x + dx * speed * dt));
      p.y = Math.max(20, Math.min(canvas.height - 20, p.y + dy * speed * dt));

      if (p.attackTimer > 0) {
        p.attackTimer -= dt;
        if (p.attackTimer <= 0) p.isAttacking = false;
      }

      // Update Monsters
      monstersRef.current.forEach((m) => {
        // Move towards player
        const dist = Math.hypot(p.x - m.x, p.y - m.y);
        if (dist > 15) {
          m.x += ((p.x - m.x) / dist) * (m.type === 'crystal_bat' ? 65 : 45) * dt;
          m.y += ((p.y - m.y) / dist) * (m.type === 'crystal_bat' ? 65 : 45) * dt;
        }

        // Check monster hits player
        if (dist < m.radius + 12 && p.attackTimer <= 0) {
          p.hp = Math.max(0, p.hp - dt * 10);
        }
      });

      // RENDER DUNGEON
      ctx.fillStyle = '#0f172a'; // Deep slate cave
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cave ground textures
      ctx.fillStyle = '#1e293b';
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          if ((x + y) % 3 === 0) {
            ctx.fillRect(x + 4, y + 4, 32, 32);
          }
        }
      }

      // Render Ore Nodes
      oreNodesRef.current.forEach((ore) => {
        if (ore.hp <= 0) return;
        ctx.fillStyle = ore.type === 'mat_aether_crystal' ? '#06b6d4' : ore.type === 'mat_iron_ore' ? '#94a3b8' : '#d97706';
        ctx.beginPath();
        ctx.arc(ore.x, ore.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ore.x - 3, ore.y - 3, 6, 6);
      });

      // Render Monsters
      monstersRef.current.forEach((m) => {
        if (m.hp <= 0) return;
        if (m.type === 'slime') {
          // Bouncy Green Slime
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, 14, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#000000';
          ctx.fillRect(m.x - 5, m.y - 3, 3, 3);
          ctx.fillRect(m.x + 2, m.y - 3, 3, 3);
        } else {
          // Purple Crystal Bat
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
          ctx.fill();
          // Bat Wings
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(m.x - 18, m.y - 5, 8, 4);
          ctx.fillRect(m.x + 10, m.y - 5, 8, 4);
        }

        // Monster HP bar
        const hpPct = m.hp / m.maxHp;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(m.x - 12, m.y - 18, 24, 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(m.x - 12, m.y - 18, 24 * hpPct, 3);
      });

      // Render Player
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sword attack slash arc
      if (p.isAttacking) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [isOpen]);

  const triggerDungeonAttack = () => {
    const p = dungeonPlayerRef.current;
    p.isAttacking = true;
    p.attackTimer = 0.22;
    sounds.playSword();

    // Damage nearby monsters
    monstersRef.current.forEach((m) => {
      if (m.hp <= 0) return;
      const dist = Math.hypot(p.x - m.x, p.y - m.y);
      if (dist < 42) {
        m.hp -= 25;
        sounds.playHit();
        if (m.hp <= 0) {
          setSlimesKilled((k) => k + 1);
          sounds.playCoin();
        }
      }
    });

    // Mine nearby ores
    oreNodesRef.current.forEach((ore) => {
      if (ore.hp <= 0) return;
      const dist = Math.hypot(p.x - ore.x, p.y - ore.y);
      if (dist < 38) {
        ore.hp -= 1;
        sounds.playPickaxe();
        if (ore.hp <= 0) {
          setLootedOres((prev) => ({
            ...prev,
            [ore.type]: prev[ore.type] + 1
          }));
          sounds.playHarvest();
        }
      }
    });
  };

  const handleReturnToSurface = async () => {
    const goldEarned = slimesKilled * 25;
    const aetherEarned = (lootedOres.mat_aether_crystal * 5) + (floor * 2);

    try {
      const res = await fetch('/api/v1/game/dungeon-clear/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slimes_defeated: slimesKilled,
          floors_cleared: floor,
          ores_looted: lootedOres,
          aether_earned: aetherEarned,
          gold_earned: goldEarned
        })
      });
      const data = await res.json();
      sounds.playLevelUp();
      showNotification(`Kembali selamat! +${goldEarned}G, +${aetherEarned} Kristal Aether!`, 'success');

      // Refresh save from backend
      const resSave = await fetch('/api/v1/game/save/1');
      const updatedSave = await resSave.json();
      setGameState(updatedSave);
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  const handleNextFloor = () => {
    sounds.playClick();
    setFloor((f) => f + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-stone-900 border-4 border-rose-950 rounded-2xl w-full max-w-2xl shadow-2xl p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-xl font-bold font-medieval text-rose-300">
                Gua Terlupakan (The Forgotten Mines) — Lantai {floor}
              </h2>
              <p className="text-stone-400 text-xs">
                Kalahkan monster dan pecahkan bijih kristal untuk material teknologi.
              </p>
            </div>
          </div>

          <div className="flex space-x-2 text-xs font-mono">
            <span className="bg-rose-950 border border-rose-700 px-2.5 py-1 rounded text-rose-300">
              👾 Monster: {slimesKilled}
            </span>
            <span className="bg-cyan-950 border border-cyan-700 px-2.5 py-1 rounded text-cyan-300">
              💎 Kristal: {lootedOres.mat_aether_crystal}
            </span>
          </div>
        </div>

        {/* Combat Canvas */}
        <div className="flex justify-center mb-3">
          <canvas
            ref={canvasRef}
            width={520}
            height={340}
            onClick={triggerDungeonAttack}
            className="rounded-xl border-2 border-stone-700 cursor-crosshair bg-stone-950 shadow-inner"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 text-xs">
          <div className="text-stone-400">
            [WASD / Panah] Gerak • [Spasi / Klik] Tebas Pedang & Tambang
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleNextFloor}
              className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg transition"
            >
              Turun Tangga (Lantai {floor + 1}) 🪜
            </button>
            <button
              onClick={handleReturnToSurface}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition"
            >
              Naik ke Permukaan 🏕️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
