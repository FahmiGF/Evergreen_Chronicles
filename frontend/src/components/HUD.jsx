import React from 'react';
import { sounds } from '../game/SoundFx';
import { translations } from '../i18n/translations';

export default function HUD({
  gameState,
  viewMode = 'topdown',
  onChangeViewMode,
  isTractorMounted = false,
  tractorAttachment = 'tiller',
  onChangeAttachment,
  onToggleTractorMount,
  onHonkTractor,
  onOpenInventory,
  onOpenCrafting,
  onOpenCooking,
  onOpenFishing,
  onOpenTechTree,
  onOpenDungeon,
  onOpenWorldMap,
  onOpenBed,
  onOpenGuide,
  onOpenRoster,
  onOpenStoryline,
  onOpenQuestLog,
  onOpenAffection,
  onOpenCharacterStudio,
  onToggleLandscapePainter,
  isLandscapePainterActive = false,
  onReturnToMenu,
  onlineCount,
  pingMs,
  isMuted,
  onToggleMute,
  lang,
  setLang
}) {
  if (!gameState || !gameState.player || !gameState.world) return null;

  const t = translations[lang] || translations.id;
  const { player, world } = gameState;
  const hpPct = Math.round((player.hp / player.max_hp) * 100);
  const staminaPct = Math.round((player.stamina / player.max_stamina) * 100);
  const tractor = player.tractor || {};
  const isMounted = isTractorMounted || tractor.mounted;

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
    <header className="w-full bg-stone-900/90 backdrop-blur-md border-b-2 border-amber-900/60 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs sm:text-sm select-none z-30 shadow-lg">
      {/* 1. CALENDAR, TIME, WEATHER & ONLINE BADGE */}
      <div className="flex items-center space-x-2">
        <div className="bg-amber-950/80 border border-amber-700/60 rounded-lg px-2 py-1 flex items-center space-x-1.5 text-amber-100 shadow-inner">
          <span className="text-base">{getWeatherIcon(world.weather)}</span>
          <div>
            <div className="font-semibold text-amber-300">
              {world.season} {world.day}, {t.hud.year} {world.year}
            </div>
            <div className="text-amber-200/80 font-mono text-[11px]">
              {formatTime(world.time_hour, world.time_minute)}
            </div>
          </div>
        </div>

        {/* MULTIPLAYER ONLINE BADGE */}
        <button
          onClick={() => { sounds.playClick(); onOpenRoster(); }}
          className="bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-cyan-700/60 rounded-lg px-2 py-1 flex items-center space-x-1.5 transition shadow"
          title="Lihat Pemain Online"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-xs text-cyan-300 font-mono">
            👥 {onlineCount || 1} {t.hud.online}
          </span>
          <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
            ({pingMs || 5}ms)
          </span>
        </button>

        {/* LANGUAGE QUICK SELECTOR */}
        <div className="hidden md:flex items-center space-x-1 bg-stone-800/80 px-1.5 py-0.5 rounded-lg border border-stone-700">
          <button
            onClick={() => setLang('id')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lang === 'id' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
          >
            ID
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lang === 'en' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ja')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lang === 'ja' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
          >
            JA
          </button>
        </div>

        {/* VIEW MODE SWITCHER PILL (2D TOP-DOWN, 3D ISOMETRIC, BLUEPRINT CAD) */}
        <div className="flex items-center space-x-0.5 bg-stone-950/90 p-0.5 rounded-lg border border-cyan-700/50 shadow-inner">
          <button
            onClick={() => { sounds.playClick(); onChangeViewMode && onChangeViewMode('topdown'); }}
            title="Tampilan 2D Top-Down Klasik [V]"
            className={`px-2 py-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
              viewMode === 'topdown'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>🌿</span>
            <span className="hidden sm:inline">2D</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onChangeViewMode && onChangeViewMode('3d'); }}
            title="Tampilan 3D Isometrik Proyeksi Berkedalaman [V]"
            className={`px-2 py-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
              viewMode === '3d'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span>🌐</span>
            <span className="hidden sm:inline">3D</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onChangeViewMode && onChangeViewMode(viewMode === 'blueprint' ? 'topdown' : 'blueprint'); }}
            title="Mode Arsitektur Cetak Biru CAD [B]"
            className={`px-2 py-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
              viewMode === 'blueprint'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                : 'text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/70 border border-cyan-800/40'
            }`}
          >
            <span>📐</span>
            <span className="hidden sm:inline">CAD [B]</span>
          </button>
        </div>
      </div>

      {/* 2. PLAYER HEALTH & STAMINA BARS */}
      <div className="flex items-center space-x-2 my-1 sm:my-0">
        <div className="w-20 sm:w-28">
          <div className="flex justify-between text-[10px] mb-0.5 font-bold">
            <span className="text-rose-400">❤️ {t.hud.hp}</span>
            <span className="text-stone-300">{player.hp}/{player.max_hp}</span>
          </div>
          <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden border border-rose-900/50">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}
            />
          </div>
        </div>

        <div className="w-20 sm:w-28">
          <div className="flex justify-between text-[10px] mb-0.5 font-bold">
            <span className="text-emerald-400">⚡ {t.hud.stamina}</span>
            <span className="text-stone-300">{player.stamina}/{player.max_stamina}</span>
          </div>
          <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden border border-emerald-900/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, staminaPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. CURRENCY: GOLD & AETHER SHARDS */}
      <div className="flex items-center space-x-1.5">
        <div className="flex items-center space-x-1 bg-stone-800/90 border border-amber-600/40 rounded-lg px-2 py-0.5 text-amber-300 font-bold font-mono text-xs">
          <span>🪙</span>
          <span>{player.gold.toLocaleString()} G</span>
        </div>

        <div className="flex items-center space-x-1 bg-stone-800/90 border border-cyan-500/40 rounded-lg px-2 py-0.5 text-cyan-300 font-bold font-mono text-xs">
          <span>💎</span>
          <span>{player.aether_shards || 0}</span>
        </div>
      </div>

      {/* 4. ACTION SHORTCUT BUTTONS */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => { sounds.playClick(); onOpenInventory(); }}
          title="Backpack [E]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🎒 {t.hud.backpack}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenCrafting(); }}
          title="Crafting [C]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🔨 {t.hud.craft}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenCooking(); }}
          title="Cooking [K]"
          className="bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-700 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🍲 {t.hud.cook}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenFishing(); }}
          title="Fishing [F]"
          className="bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 border border-cyan-700 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🎣 {t.hud.fish}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenTechTree(); }}
          title="Tech Tree [T]"
          className="bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 border border-cyan-600 px-2 py-1 rounded-md text-xs font-semibold transition hidden sm:inline-flex"
        >
          🔬 {t.hud.tech}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenWorldMap(); }}
          title="Buka Peta 8 Wilayah [O]"
          className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-500 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>🗺️</span>
          <span>Peta</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenQuestLog && onOpenQuestLog(); }}
          title="Papan Tugas Warga [Q]"
          className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>📜</span>
          <span>{t.hud.quests || 'Tugas'}</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenAffection && onOpenAffection(); }}
          title="Tingkat Kasih Penduduk [U]"
          className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>❤️</span>
          <span>{t.hud.affection || 'Warga'}</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenStoryline && onOpenStoryline(); }}
          title="Alur Cerita & Sinematik [J]"
          className="bg-amber-900/90 hover:bg-amber-800 text-amber-100 border border-amber-400 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1"
        >
          <span>🎬</span>
          <span>{t.hud.storyline || 'Cerita'}</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenCharacterStudio && onOpenCharacterStudio(); }}
          title="Studio Karakter & Lemari Busana [P]"
          className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 ring-1 ring-purple-400/50"
        >
          <span>👤</span>
          <span>Karakter [P]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onToggleLandscapePainter && onToggleLandscapePainter(); }}
          title="Palet Pembentuk Lanskap & Terrain [L]"
          className={`px-2 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 ${
            isLandscapePainterActive
              ? 'bg-emerald-600 text-white border border-emerald-300 ring-2 ring-emerald-400 shadow-md animate-pulse'
              : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600'
          }`}
        >
          <span>🖌️</span>
          <span>Lanskap [L]</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenDungeon(); }}
          title="Mines Dungeon [M]"
          className="bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          ⚔️ {t.hud.mines}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenBed(); }}
          title="Sleep [Z]"
          className="bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🛏️ {t.hud.sleep}
        </button>

        <button
          onClick={() => { sounds.playClick(); onOpenGuide(); }}
          title="Guide [H]"
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          ❓
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={() => { sounds.playClick(); onReturnToMenu(); }}
          title="Kembali ke Menu Utama"
          className="bg-stone-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 border border-stone-600 px-2 py-1 rounded-md text-xs font-semibold transition"
        >
          🏠 Menu
        </button>
      </div>

      {/* TRACTOR ACTIVE CONTROLS BAR (IF MOUNTED) */}
      {isMounted && (
        <div className="w-full mt-1.5 py-1 px-3 bg-gradient-to-r from-emerald-950/90 via-stone-900/90 to-emerald-950/90 border-t border-b border-emerald-500/50 flex flex-wrap items-center justify-between text-xs select-none shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-base animate-bounce">🚜</span>
            <span className="font-bold text-emerald-300 font-mono">
              TRAKTOR MEKANIK AKTIF (+75% Kec.)
            </span>
            <span className="text-[11px] text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono">
              ⛽ {tractor.fuel ?? 100}% Bio-Aether
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-stone-400 mr-1 hidden sm:inline">Alat Terpasang:</span>
            <button
              onClick={() => { sounds.playClick(); onChangeAttachment && onChangeAttachment('tiller'); }}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                tractorAttachment === 'tiller'
                  ? 'bg-amber-600 text-white shadow ring-1 ring-amber-300'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Mata Bajak Tanah 3-Ubin [1]"
            >
              [1] ⚙️ Bajak
            </button>
            <button
              onClick={() => { sounds.playClick(); onChangeAttachment && onChangeAttachment('sprayer'); }}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                tractorAttachment === 'sprayer'
                  ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-300'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Penyemprot Air 3-Ubin [2]"
            >
              [2] 💧 Siram
            </button>
            <button
              onClick={() => { sounds.playClick(); onChangeAttachment && onChangeAttachment('mower'); }}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                tractorAttachment === 'mower'
                  ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-300'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Pemanen & Babat Gulma 3-Ubin [3]"
            >
              [3] 🌾 Panen
            </button>
            <button
              onClick={() => { onHonkTractor && onHonkTractor(); }}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-600/60 font-bold transition"
              title="Bunyikan Klakson Traktor [H]"
            >
              🎺 [H]
            </button>
            <button
              onClick={() => { onToggleTractorMount && onToggleTractorMount(); }}
              className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500 font-bold transition"
              title="Turun dari Traktor [T]"
            >
              🚪 Turun [T]
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
