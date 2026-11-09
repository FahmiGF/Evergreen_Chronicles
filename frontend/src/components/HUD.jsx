import React from 'react';
import { sounds } from '../game/SoundFx';

export default function HUD({
  gameState,
  onOpenInventory,
  onOpenCrafting,
  onOpenTechTree,
  onOpenDungeon,
  onOpenBed,
  onOpenGuide,
  isMuted,
  onToggleMute
}) {
  if (!gameState || !gameState.player || !gameState.world) return null;

  const { player, world } = gameState;
  const hpPct = Math.round((player.hp / player.max_hp) * 100);
  const staminaPct = Math.round((player.stamina / player.max_stamina) * 100);

  const formatTime = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  const getWeatherIcon = (w) => {
    switch (w) {
      case 'Rainy': return '🌧️';
      case 'Cloudy': return '☁️';
      default: return '☀️';
    }
  };

  return (
    <header className="w-full bg-stone-900/90 backdrop-blur-md border-b-2 border-amber-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs sm:text-sm select-none z-30 shadow-lg">
      {/* 1. CALENDAR, TIME, WEATHER & ERA */}
      <div className="flex items-center space-x-3">
        <div className="bg-amber-950/80 border border-amber-700/60 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-amber-100 shadow-inner">
          <span className="text-base">{getWeatherIcon(world.weather)}</span>
          <div>
            <div className="font-semibold text-amber-300">
              {world.season} {world.day}, Thn {world.year}
            </div>
            <div className="text-amber-200/80 font-mono text-[11px]">
              {formatTime(world.time_hour, world.time_minute)}
            </div>
          </div>
        </div>

        {/* ERA BADGE */}
        <div className="hidden md:flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-cyan-300 tracking-wide">
              {world.era_name.split('—')[0]}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 truncate max-w-[200px]">
            {world.era_name.split('—')[1] || 'Peradaban Awal'}
          </span>
        </div>
      </div>

      {/* 2. PLAYER HEALTH & STAMINA BARS */}
      <div className="flex items-center space-x-3 my-1 sm:my-0">
        {/* HP */}
        <div className="w-28 sm:w-36">
          <div className="flex justify-between text-[11px] mb-0.5 font-bold">
            <span className="text-rose-400">❤️ HP</span>
            <span className="text-stone-300">{player.hp}/{player.max_hp}</span>
          </div>
          <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden border border-rose-900/50">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}
            />
          </div>
        </div>

        {/* Stamina */}
        <div className="w-28 sm:w-36">
          <div className="flex justify-between text-[11px] mb-0.5 font-bold">
            <span className="text-emerald-400">⚡ Stamina</span>
            <span className="text-stone-300">{player.stamina}/{player.max_stamina}</span>
          </div>
          <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden border border-emerald-900/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, staminaPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. CURRENCY: GOLD & AETHER SHARDS */}
      <div className="flex items-center space-x-2">
        {/* Gold */}
        <div className="flex items-center space-x-1.5 bg-stone-800/90 border border-amber-600/40 rounded-lg px-2.5 py-1 text-amber-300 font-bold font-mono">
          <span>🪙</span>
          <span>{player.gold.toLocaleString()} G</span>
        </div>

        {/* Aether Crystals */}
        <div className="flex items-center space-x-1.5 bg-stone-800/90 border border-cyan-500/40 rounded-lg px-2.5 py-1 text-cyan-300 font-bold font-mono">
          <span>💎</span>
          <span>{player.aether_shards || 0}</span>
        </div>
      </div>

      {/* 4. ACTION SHORTCUT BUTTONS */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => { sounds.playClick(); onOpenInventory(); }}
          title="Buka Tas Ransel [E]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
        >
          <span>🎒</span>
          <span className="hidden lg:inline">Tas [E]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenCrafting(); }}
          title="Buka Meja Kerajinan [C]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
        >
          <span>🔨</span>
          <span className="hidden lg:inline">Craft [C]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenTechTree(); }}
          title="Pohon Teknologi & Era [T]"
          className="bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 border border-cyan-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
        >
          <span>🔬</span>
          <span className="hidden lg:inline">Riset [T]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenDungeon(); }}
          title="Jelajahi Gua Tambang & Monster [M]"
          className="bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
        >
          <span>⚔️</span>
          <span className="hidden lg:inline">Gua [M]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenBed(); }}
          title="Tidur & Akhiri Hari [Z]"
          className="bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-600 px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
        >
          <span>🛏️</span>
          <span className="hidden lg:inline">Tidur [Z]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenGuide(); }}
          title="Panduan Kontrol [H]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          ❓
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
}
