import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../game/SoundFx';

export default function FishingModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [fishCatalog, setFishCatalog] = useState([]);
  const [gameStateStage, setGameStateStage] = useState('idle'); // 'idle', 'waiting', 'hooked', 'success'
  const [catchProgress, setCatchProgress] = useState(30); // 0 to 100
  const [fishTargetPos, setFishTargetPos] = useState(50);
  const [barPos, setBarPos] = useState(40);
  const [caughtFish, setCaughtFish] = useState(null);

  const loopRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/game/fish-catalog')
        .then((r) => r.json())
        .then((data) => setFishCatalog(data))
        .catch((e) => console.error(e));
      setGameStateStage('idle');
      setCatchProgress(30);
    }
  }, [isOpen]);

  const handleCastLine = () => {
    sounds.playWater();
    setGameStateStage('waiting');

    // Random bite time 1.5 - 3 seconds
    const biteDelay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      sounds.playPickaxe(); // Warning bite chime
      setGameStateStage('hooked');
      setCatchProgress(40);
    }, biteDelay);
  };

  // Mini-game Reel In loop
  useEffect(() => {
    if (gameStateStage !== 'hooked') return;

    let target = fishTargetPos;
    let bar = barPos;
    let progress = catchProgress;

    const interval = setInterval(() => {
      // Fish erratic swim
      if (Math.random() < 0.15) {
        target = Math.max(15, Math.min(85, target + (Math.random() - 0.5) * 35));
        setFishTargetPos(target);
      }

      // Check if bar overlaps fish
      const isInside = Math.abs(bar - target) < 18;
      if (isInside) {
        progress = Math.min(100, progress + 1.2);
      } else {
        progress = Math.max(0, progress - 0.8);
      }

      setCatchProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        handleFishSuccess();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameStateStage, barPos, fishTargetPos]);

  const handleReelPull = () => {
    sounds.playClick();
    setBarPos((prev) => Math.min(85, prev + 12));
  };

  const handleReelRelax = () => {
    setBarPos((prev) => Math.max(15, prev - 6));
  };

  const handleFishSuccess = async () => {
    sounds.playHarvest();
    const fish = fishCatalog[Math.floor(Math.random() * fishCatalog.length)] || {
      id: 'fish_sunfish',
      name: 'Ikan Mas Mentari',
      sell_price: 65,
      icon: '🐠'
    };
    setCaughtFish(fish);
    setGameStateStage('success');

    try {
      const res = await fetch('/api/v1/game/catch-fish/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fish_id: fish.id })
      });
      const data = await res.json();
      sounds.playCoin();
      showNotification(`Mendapatkan ${fish.name}! (+${data.gold_earned} G) ✨`, 'success');

      setGameState({
        ...gameState,
        player: {
          ...gameState.player,
          gold: data.current_gold
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-cyan-900/90 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-3xl">🎣</span>
          <div>
            <h2 className="text-xl font-bold font-medieval text-cyan-200">
              Memancing di Kolam Aetherwyn
            </h2>
            <p className="text-stone-400 text-xs">
              Uji ketangkasanmu menangkap ikan air tawar dan ikan langka bertenaga kristal!
            </p>
          </div>
        </div>

        {gameStateStage === 'idle' && (
          <div className="text-center py-6">
            <span className="text-5xl block mb-3 animate-pulse">🌊</span>
            <p className="text-stone-300 text-xs mb-4">
              Air kolam beriak tenang. Lemparkan kail dan tunggu hingga umpan disambar ikan.
            </p>
            <button
              onClick={handleCastLine}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg transition"
            >
              Lempar Kail Pancing 🎣
            </button>
          </div>
        )}

        {gameStateStage === 'waiting' && (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2 animate-bounce">🪝</span>
            <h3 className="text-sm font-bold text-cyan-300 mb-1">Menunggu Gigitan Ikan...</h3>
            <p className="text-stone-400 text-xs italic">Perhatikan pelampung kail dengan cermat...</p>
          </div>
        )}

        {gameStateStage === 'hooked' && (
          <div className="py-3">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-amber-300">⚠️ Ikan Menyambar! Tahan Reel!</span>
              <span className="text-emerald-400 font-mono">{Math.round(catchProgress)}%</span>
            </div>

            {/* Reel Vertical Bar Meter */}
            <div className="relative h-48 w-16 mx-auto bg-stone-950 border-2 border-cyan-700 rounded-xl overflow-hidden shadow-inner my-3 flex flex-col justify-end">
              {/* Green Capture Zone (Controlled by player) */}
              <div
                className="absolute w-full bg-emerald-500/40 border-y-2 border-emerald-400 transition-all duration-75"
                style={{ bottom: `${barPos}%`, height: '28%' }}
              />

              {/* Fish Target */}
              <div
                className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-150"
                style={{ bottom: `${fishTargetPos}%` }}
              >
                🐟
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden border border-emerald-900 mb-4">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                style={{ width: `${catchProgress}%` }}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleReelPull}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-xs shadow transition"
              >
                Tarik Reel (Naik) ⬆️
              </button>
              <button
                onClick={handleReelRelax}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 font-bold rounded-xl text-xs shadow transition border border-stone-700"
              >
                Kendurkan Reel ⬇️
              </button>
            </div>
          </div>
        )}

        {gameStateStage === 'success' && caughtFish && (
          <div className="text-center py-4 animate-fadeIn">
            <span className="text-5xl block mb-2">{caughtFish.icon}</span>
            <h3 className="text-lg font-bold font-medieval text-amber-300 mb-1">
              Tangkapan Hebat!
            </h3>
            <p className="text-stone-200 text-sm font-semibold">{caughtFish.name}</p>
            <p className="text-amber-400 font-mono font-bold text-xs mt-1 mb-4">
              Bernilai +{caughtFish.sell_price} G
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleCastLine}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition"
              >
                Pancing Lagi 🎣
              </button>
              <button
                onClick={() => { sounds.playClick(); onClose(); }}
                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-lg text-xs transition"
              >
                Kembali ke Ladang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
