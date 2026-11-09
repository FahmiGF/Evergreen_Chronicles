import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../game/SoundFx';
import { translations } from '../i18n/translations';

export default function MainMenu({
  onStartSingleplayer,
  onStartMultiplayer,
  onOpenControls,
  lang,
  setLang,
  isAudioMuted,
  onToggleAudio
}) {
  const t = translations[lang] || translations.id;

  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [playtestersModalOpen, setPlaytestersModalOpen] = useState(false);

  // Multiplayer setup state
  const [playerName, setPlayerName] = useState('Fahmi');
  const [playerColor, setPlayerColor] = useState('#3b82f6');

  const canvasRef = useRef(null);

  // Animated background leaves & aether crystals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.4 + Math.random() * 0.8,
      size: 3 + Math.random() * 5,
      type: Math.random() < 0.35 ? 'crystal' : 'leaf',
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.03
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep atmospheric gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0c0a09');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.type === 'crystal') {
          // Cyan Aether Crystal
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Warm Golden/Green Leaf
          ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const colorOptions = [
    { name: 'Sapphire Blue', hex: '#3b82f6' },
    { name: 'Emerald Green', hex: '#10b981' },
    { name: 'Ruby Red', hex: '#ef4444' },
    { name: 'Amethyst Purple', hex: '#8b5cf6' },
    { name: 'Amber Gold', hex: '#f59e0b' }
  ];

  const handleLaunchMultiplayer = () => {
    sounds.playLevelUp();
    setMultiplayerModalOpen(false);
    onStartMultiplayer(playerName, playerColor);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between items-center select-none text-stone-100 font-sans">
      {/* Background Animated Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* TOP HEADER: Language Selector & Audio */}
      <header className="relative z-10 w-full p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-900/60 shadow">
          <span className="text-sm">🌐</span>
          <span className="text-xs font-bold text-stone-300 mr-1">Language:</span>
          <button
            onClick={() => { sounds.playClick(); setLang('id'); }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              lang === 'id' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            onClick={() => { sounds.playClick(); setLang('en'); }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              lang === 'en' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => { sounds.playClick(); setLang('ja'); }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              lang === 'ja' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            🇯🇵 日本語
          </button>
        </div>

        <button
          onClick={onToggleAudio}
          className="bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-amber-900/60 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
        >
          <span>{isAudioMuted ? '🔇' : '🔊'}</span>
          <span>{isAudioMuted ? t.hud.soundOff : t.hud.soundOn}</span>
        </button>
      </header>

      {/* MAIN TITLE & LOGO */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Emblem */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-2xl bg-amber-950/80 border-4 border-amber-600/80 flex items-center justify-center text-5xl shadow-[0_0_35px_rgba(217,119,6,0.5)] transform -rotate-3 hover:rotate-0 transition-transform">
            🌲
          </div>
          <span className="absolute -top-2 -right-2 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
            ✨
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-medieval tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          {t.title}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-amber-200/80 max-w-xl font-medium tracking-wide">
          {t.subtitle}
        </p>

        {/* MENU ACTION BUTTONS */}
        <div className="mt-8 flex flex-col space-y-3 w-72 sm:w-80">
          {/* 1. Start Singleplayer */}
          <button
            onClick={() => {
              sounds.playLevelUp();
              onStartSingleplayer();
            }}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold rounded-xl text-sm shadow-xl hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 border border-emerald-400/50 flex items-center justify-center space-x-2"
          >
            <span>🌾</span>
            <span>{t.menu.startSingleplayer}</span>
          </button>

          {/* 2. Multiplayer Online Co-op */}
          <button
            onClick={() => {
              sounds.playClick();
              setMultiplayerModalOpen(true);
            }}
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white font-bold rounded-xl text-sm shadow-xl hover:shadow-cyan-600/40 transition-all transform hover:-translate-y-0.5 border border-cyan-400/50 flex items-center justify-center space-x-2"
          >
            <span>🌐</span>
            <span>{t.menu.startMultiplayer}</span>
          </button>

          {/* 3. Controls Guide */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenControls();
            }}
            className="w-full py-2.5 px-6 bg-stone-900/90 hover:bg-stone-800 text-stone-200 font-semibold rounded-xl text-xs shadow-lg transition border border-stone-700 flex items-center justify-center space-x-2"
          >
            <span>📜</span>
            <span>{t.menu.controls}</span>
          </button>

          {/* 4. Playtesters & Hall of Fame */}
          <button
            onClick={() => {
              sounds.playClick();
              setPlaytestersModalOpen(true);
            }}
            className="w-full py-2.5 px-6 bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-semibold rounded-xl text-xs shadow-lg transition border border-amber-900/70 flex items-center justify-center space-x-2"
          >
            <span>🏆</span>
            <span>{t.menu.playtesters}</span>
          </button>

          {/* 5. Credits */}
          <button
            onClick={() => {
              sounds.playClick();
              setCreditsModalOpen(true);
            }}
            className="w-full py-2 px-6 bg-transparent hover:bg-stone-900/60 text-stone-400 hover:text-stone-200 font-medium rounded-xl text-xs transition flex items-center justify-center space-x-1"
          >
            <span>👥</span>
            <span>{t.menu.credits}</span>
          </button>
        </div>
      </main>

      {/* FOOTER BADGE */}
      <footer className="relative z-10 p-3 text-center text-[11px] text-stone-500">
        Evergreen Chronicles v2.2.0 • 60 FPS Canvas Engine • WebSockets Online Co-op • Web Audio AI
      </footer>

      {/* MODAL: MULTIPLAYER CUSTOMIZER */}
      {multiplayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-stone-900 border-4 border-cyan-900/90 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setMultiplayerModalOpen(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🌐</span>
              <div>
                <h3 className="text-lg font-bold font-medieval text-cyan-200">
                  {t.menu.startMultiplayer}
                </h3>
                <p className="text-stone-400 text-xs">
                  Bergabunglah dengan lahan pertanian Aetherwyn online bersama teman!
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t.menu.playerName}:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  {t.menu.playerColor}:
                </label>
                <div className="flex space-x-2 pt-1">
                  {colorOptions.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setPlayerColor(c.hex)}
                      className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                        playerColor === c.hex ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-75'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {playerColor === c.hex && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunchMultiplayer}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl text-sm shadow-xl transition mt-2"
            >
              {t.menu.enterWorld} 🚀
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREDITS */}
      {creditsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setCreditsModalOpen(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">👥</span>
              <h3 className="text-xl font-bold font-medieval text-amber-200">
                {t.creditsModal.title}
              </h3>
            </div>

            <div className="space-y-3 text-xs text-stone-300 leading-relaxed bg-stone-950/80 p-4 rounded-xl border border-stone-800">
              <p className="font-bold text-amber-300 text-sm">{t.creditsModal.leadDev}</p>
              <p className="text-cyan-300 font-mono">{t.creditsModal.engine}</p>
              <div className="border-t border-stone-800 pt-2 text-stone-400">
                <p className="font-semibold text-stone-300 mb-1">{t.creditsModal.inspirations}</p>
              </div>
              <p className="text-emerald-400 font-medium pt-2 italic">{t.creditsModal.thankYou}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PLAYTESTERS & HALL OF FAME */}
      {playtestersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setPlaytestersModalOpen(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h3 className="text-xl font-bold font-medieval text-amber-200">
                  {t.playtestersModal.title}
                </h3>
                <p className="text-stone-400 text-xs">
                  {t.playtestersModal.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto pr-1 my-2 flex-1">
              {t.playtestersModal.testers.map((tester, i) => (
                <div
                  key={i}
                  className="bg-stone-950/70 border border-stone-800 p-3 rounded-xl flex flex-col space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300 text-xs">{tester.name}</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
                      {tester.role}
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] italic">"{tester.feedback}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
