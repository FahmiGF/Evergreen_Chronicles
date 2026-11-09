import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../game/SoundFx';
import NpcPortrait from '../game/NpcPortraits';

export default function CutscenePlayerModal({ isOpen, onClose, chapter }) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  const scenes = chapter?.scenes || [];
  const currentScene = scenes[currentSceneIdx] || {};

  // Procedural Web Audio API cinematic music chords
  const playCinematicChord = (bgTheme) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const baseFreqs = {
        ruins_night: [110, 164.8, 220, 277.2],       // A minor / mysterious
        spring_farm: [130.8, 164.8, 196, 261.6],     // C major / bright morning
        forge_fire: [146.8, 174.6, 220, 293.7],      // D minor / powerful tension
        village_festival: [174.6, 220, 261.6, 349.2],// F major / festive warmth
        crystal_cave: [196, 246.9, 293.7, 392],      // G major / crystal wonder
        modern_skyline: [220, 277.2, 329.6, 440],    // A major / triumphant future
        summit_sunrise: [261.6, 329.6, 392, 523.3]   // High C major / legendary dawn
      }[bgTheme] || [130.8, 164.8, 196, 261.6];

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.045 / (idx + 1), ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.3);
      });
    } catch (e) {
      // Audio fallback gracefully ignored
    }
  };

  // Typewriter effect for story text
  useEffect(() => {
    if (!isOpen || !currentScene?.text) return;
    setDisplayedText('');
    setIsTyping(true);

    playCinematicChord(chapter?.bg_theme || 'ruins_night');

    let charIdx = 0;
    const fullText = currentScene.text;
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      if (charIdx % 3 === 0) {
        sounds.playClick();
      }
      if (charIdx >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [isOpen, currentSceneIdx, chapter]);

  // Animated Canvas Background based on scene visual
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const visual = currentScene?.visual || 'dawn_rising';

      // 1. SKY GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (visual === 'cataclysm_sundering' || visual === 'forge_fire') {
        skyGrad.addColorStop(0, '#1c0a0a');
        skyGrad.addColorStop(0.6, '#451a03');
        skyGrad.addColorStop(1, '#78350f');
      } else if (visual === 'sprouts_garden' || visual === 'sacred_tree') {
        skyGrad.addColorStop(0, '#064e3b');
        skyGrad.addColorStop(0.5, '#047857');
        skyGrad.addColorStop(1, '#a7f3d0');
      } else if (visual === 'town_square_cheer' || visual === 'four_friends_toast') {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.5, '#4338ca');
        skyGrad.addColorStop(1, '#fde047');
      } else if (visual === 'crystal_core_awakening' || visual === 'ancient_glory') {
        skyGrad.addColorStop(0, '#082f49');
        skyGrad.addColorStop(0.5, '#0284c7');
        skyGrad.addColorStop(1, '#38bdf8');
      } else if (visual === 'electric_street' || visual === 'train_modern_city') {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.4, '#1e293b');
        skyGrad.addColorStop(1, '#06b6d4');
      } else {
        // Dawn Rising / Monument
        skyGrad.addColorStop(0, '#312e81');
        skyGrad.addColorStop(0.4, '#d97706');
        skyGrad.addColorStop(1, '#fef08a');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. CELESTIAL ORBS / SUN / MOON
      ctx.save();
      const sunY = h * 0.35 + Math.sin(t * 0.5) * 8;
      const sunGrad = ctx.createRadialGradient(w * 0.5, sunY, 10, w * 0.5, sunY, 120);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w * 0.5, sunY, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. MOUNTAIN SILHOUETTES
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.65);
      ctx.lineTo(w * 0.25, h * 0.45);
      ctx.lineTo(w * 0.5, h * 0.6);
      ctx.lineTo(w * 0.78, h * 0.4);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 4. FLOATING PARTICLES (Aether Sparks / Embers / Leaves)
      for (let i = 0; i < 28; i++) {
        const px = ((i * 37 + t * 45) % w);
        const py = ((i * 29 + Math.sin(t + i) * 35) % (h * 0.85));
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.arc(px, py, 2.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. CINEMATIC LETTERBOX BARS (Top & Bottom)
      ctx.fillStyle = '#000000';
      const letterboxH = h * 0.12;
      ctx.fillRect(0, 0, w, letterboxH);
      ctx.fillRect(0, h - letterboxH, w, letterboxH);

      // Gold Letterbox Accents
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, letterboxH);
      ctx.lineTo(w, letterboxH);
      ctx.moveTo(0, h - letterboxH);
      ctx.lineTo(w, h - letterboxH);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, currentSceneIdx, chapter]);

  if (!isOpen || !chapter) return null;

  const handleNextScene = () => {
    sounds.playClick();
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      sounds.playLevelUp();
      onClose();
    }
  };

  const handlePrevScene = () => {
    sounds.playClick();
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(prev => prev - 1);
    }
  };

  const getNpcIdFromSpeaker = (speaker) => {
    if (speaker?.includes('Elara')) return 'npc_elara';
    if (speaker?.includes('Rowan')) return 'npc_rowan';
    if (speaker?.includes('Nessa')) return 'npc_nessa';
    if (speaker?.includes('Mira')) return 'npc_mira';
    return null;
  };

  const speakerNpcId = getNpcIdFromSpeaker(currentScene?.speaker);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none animate-fadeIn p-2 sm:p-6">
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[700px] flex flex-col justify-between overflow-hidden rounded-2xl border-4 border-amber-900/90 shadow-2xl bg-black">
        {/* Animated Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* TOP HEADER: CHAPTER TITLE & CLOSE */}
        <div className="relative z-20 flex justify-between items-center p-4">
          <div className="bg-stone-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-800/80 shadow-lg">
            <span className="text-[10px] font-mono text-amber-400 block tracking-widest uppercase">
              Evergreen Chronicles • Cinematic Storyline
            </span>
            <h3 className="text-sm sm:text-base font-black font-medieval text-amber-200">
              {chapter.title}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white px-3 py-1.5 rounded-xl border border-stone-700 text-xs font-bold transition shadow"
            >
              ✕ Lewati Sinematik
            </button>
          </div>
        </div>

        {/* BOTTOM: CINEMATIC DIALOGUE / NARRATION BOX */}
        <div className="relative z-20 p-4 sm:p-6 pb-6">
          <div className="bg-stone-950/90 backdrop-blur-md border-2 border-amber-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center gap-4">
            {/* Speaker Visual / Portrait */}
            {speakerNpcId ? (
              <div className="flex flex-col items-center flex-shrink-0">
                <NpcPortrait npcId={speakerNpcId} isSpeaking={isTyping} className="w-16 h-16 sm:w-20 sm:h-20" />
                <span className="text-[11px] font-bold text-amber-300 font-medieval mt-1">
                  {currentScene.speaker}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-stone-900 border border-amber-900/80 rounded-2xl flex-shrink-0 text-3xl shadow">
                📜
                <span className="text-[10px] font-bold text-amber-300 mt-1 font-mono">
                  {currentScene.speaker || 'Narator'}
                </span>
              </div>
            )}

            {/* Narrative Subtitle Text */}
            <div className="flex-1 min-h-[60px] flex items-center">
              <p className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed tracking-wide font-sans">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse" />}
              </p>
            </div>

            {/* Action Buttons: Prev / Next */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {currentSceneIdx > 0 && (
                <button
                  onClick={handlePrevScene}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition border border-stone-600"
                >
                  ◀ Sebelumnya
                </button>
              )}
              <button
                onClick={handleNextScene}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-xl transition transform hover:scale-105"
              >
                {currentSceneIdx < scenes.length - 1 ? 'Selanjutnya ▶' : 'Selesai ✨'}
              </button>
            </div>
          </div>

          {/* Scene Dots */}
          <div className="flex justify-center items-center space-x-1.5 mt-2">
            {scenes.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSceneIdx ? 'bg-amber-400 w-5' : 'bg-stone-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
