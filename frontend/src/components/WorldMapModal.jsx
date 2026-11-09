import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function WorldMapModal({
  isOpen,
  onClose,
  currentZoneId = 'zone_farm',
  onTravelToZone,
  showNotification
}) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [traveling, setTraveling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/game/zones')
        .then((r) => r.json())
        .then((data) => {
          setZones(data);
          const current = data.find((z) => z.id === currentZoneId) || data[0];
          setSelectedZone(current);
        })
        .catch((e) => console.error(e));
    }
  }, [isOpen, currentZoneId]);

  if (!isOpen) return null;

  const handleTravel = async () => {
    if (!selectedZone || selectedZone.id === currentZoneId) return;

    setTraveling(true);
    sounds.playLevelUp();

    try {
      const res = await fetch('/api/v1/game/zones/travel/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: selectedZone.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Gagal bepergian');

      showNotification(`Tiba di: ${selectedZone.name}! 🗺️`, 'success');
      onTravelToZone(selectedZone);
      onClose();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setTraveling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-4xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2.5 mb-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <h2 className="text-xl font-bold font-medieval text-amber-200">
              Peta Kerajaan Aetherwyn (8 Wilayah Eksplorasi)
            </h2>
            <p className="text-stone-400 text-xs">
              Jelajahi berbagai wilayah dari pemukiman desa, suaka hutan purba, hingga reruntuhan peradaban kristal.
            </p>
          </div>
        </div>

        {/* 2-Column: Left 8 Zones Grid, Right Selected Zone Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden my-2">
          {/* LEFT: 8 Zones Cards Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
            {zones.map((zone) => {
              const isCurrent = zone.id === currentZoneId;
              const isSelected = selectedZone?.id === zone.id;

              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedZone(zone);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/80 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-[1.02]'
                      : isCurrent
                      ? 'bg-stone-950/80 border-emerald-500/70'
                      : 'bg-stone-950/60 hover:bg-stone-800/60 border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl p-1.5 bg-stone-900 rounded-lg">
                        {zone.icon}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          📍 Lokasi Anda
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-amber-200 text-xs sm:text-sm leading-tight">
                      {zone.name}
                    </h4>
                    <p className="text-stone-400 text-[11px] line-clamp-2 mt-1">
                      {zone.description}
                    </p>
                  </div>

                  <div className="mt-2 text-[10px] text-cyan-400 font-mono">
                    {zone.features?.length || 0} Landmark
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Selected Zone Details & Fast-Travel Button */}
          <div className="bg-stone-950/90 border border-amber-950/80 p-4 rounded-xl flex flex-col justify-between">
            {selectedZone ? (
              <div className="space-y-3">
                <div className="text-center pb-2 border-b border-stone-800">
                  <span className="text-5xl block mb-2">{selectedZone.icon}</span>
                  <h3 className="font-bold text-amber-200 text-base font-medieval">
                    {selectedZone.name}
                  </h3>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {selectedZone.title_id}
                  </span>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed">
                  {selectedZone.description}
                </p>

                <div className="border-t border-stone-800 pt-2.5">
                  <span className="text-[11px] font-bold text-amber-400 block mb-1.5">
                    🏛️ Fasilitas & Keunikan Wilayah:
                  </span>
                  <ul className="space-y-1">
                    {(selectedZone.features || []).map((feat, idx) => (
                      <li key={idx} className="text-[11px] text-stone-300 flex items-center space-x-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-stone-500 py-12 text-xs">
                Pilih wilayah untuk melihat rincian.
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-stone-800">
              <button
                disabled={traveling || selectedZone?.id === currentZoneId}
                onClick={handleTravel}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-1.5 ${
                  selectedZone?.id === currentZoneId
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                }`}
              >
                <span>{selectedZone?.id === currentZoneId ? '📍 Sedang Berada di Sini' : '🚀 Bepergian ke Wilayah Ini'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
