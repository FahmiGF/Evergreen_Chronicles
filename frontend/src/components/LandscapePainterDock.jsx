import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function LandscapePainterDock({
  isOpen,
  onClose,
  activeBrush,
  onSelectBrush,
  brushRadius = 1,
  onChangeRadius
}) {
  const [brushes, setBrushes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBrushes() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/game/landscape/brushes');
        if (res.ok) {
          const data = await res.json();
          setBrushes(data);
          if (!activeBrush && data.length > 0) {
            onSelectBrush(data[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load landscape brushes:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchBrushes();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md border-2 border-amber-600/70 rounded-2xl shadow-2xl p-3 max-w-xl w-[94vw] text-stone-100 font-sans select-none animate-fadeIn">
      {/* HEADER & CONTROLS */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/60">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🖌️</span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 font-medieval">
              Kuas Pembentuk Lanskap & Terrain
            </h3>
            <p className="text-[10px] text-amber-200/70 hidden sm:block">
              Klik pada ubin tanah di kanvas untuk mengubah jenis permukaan secara langsung
            </p>
          </div>
        </div>

        {/* BRUSH RADIUS & CLOSE */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-amber-700/50 text-[11px] font-bold">
            <span className="px-1.5 text-stone-400">Radius:</span>
            <button
              onClick={() => { sounds.playClick(); onChangeRadius && onChangeRadius(1); }}
              className={`px-2 py-0.5 rounded transition ${
                brushRadius === 1 ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
              }`}
              title="1x1 Ubin Tunggal"
            >
              1x1
            </button>
            <button
              onClick={() => { sounds.playClick(); onChangeRadius && onChangeRadius(3); }}
              className={`px-2 py-0.5 rounded transition ${
                brushRadius === 3 ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
              }`}
              title="3x3 Sapuan Lebar"
            >
              3x3
            </button>
          </div>

          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="text-stone-400 hover:text-white text-lg font-bold px-1.5 py-0.5"
            title="Tutup Palet Lanskap [L]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* BRUSH TILES GRID */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {brushes.map((b) => {
          const isSelected = activeBrush === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                sounds.playClick();
                onSelectBrush(b.id);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition group relative ${
                isSelected
                  ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/60 shadow-lg scale-105 z-10'
                  : 'bg-stone-800/80 border-stone-700 hover:bg-stone-700/90 hover:border-stone-500'
              }`}
              title={b.description}
            >
              <div
                className="w-5 h-5 rounded-md mb-1 shadow-inner border border-white/20"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-[10px] font-bold text-stone-200 truncate w-full">
                {b.name.split(' ')[0]}
              </span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE BRUSH BANNER */}
      {activeBrush && (
        <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-amber-200/90 px-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: brushes.find(b => b.id === activeBrush)?.color || '#22c55e' }} />
            <span>Kuas Aktif: <strong>{brushes.find(b => b.id === activeBrush)?.name || activeBrush}</strong> ({brushRadius}x{brushRadius})</span>
          </div>
          <span className="text-stone-400 text-[10px]">Klik tanah di peta untuk mengecat</span>
        </div>
      )}
    </div>
  );
}
