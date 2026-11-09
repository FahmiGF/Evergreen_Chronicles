import React, { useState, useEffect } from 'react';
import { multiplayer } from '../game/MultiplayerManager';
import { sounds } from '../game/SoundFx';

export default function RosterDrawer({ isOpen, onClose, pingMs, localPlayerName }) {
  const [roster, setRoster] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const unsub = multiplayer.subscribe((event) => {
      if (event.type === 'roster_update') {
        setRoster(event.players || []);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRoster(Array.from(multiplayer.remotePlayers.values()));
      fetch('/api/v1/metrics')
        .then((r) => r.json())
        .then((data) => setMetrics(data))
        .catch((e) => console.error(e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-cyan-900/90 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">👥</span>
          <div>
            <h2 className="text-xl font-bold font-medieval text-cyan-200">
              Daftar Petualang Online (Multiplayer)
            </h2>
            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status Server: Terhubung</span>
              <span>•</span>
              <span className="text-emerald-300 font-mono">Ping: {pingMs} ms</span>
            </div>
          </div>
        </div>

        {/* Local Player Info */}
        <div className="bg-stone-950/80 border border-amber-600/60 rounded-xl p-3 my-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-600/30 border-2 border-amber-400 flex items-center justify-center text-base font-bold text-amber-200">
              🤠
            </div>
            <div>
              <div className="font-bold text-amber-200 text-sm flex items-center space-x-1.5">
                <span>{localPlayerName || 'Fahmi'}</span>
                <span className="bg-amber-950 text-amber-300 border border-amber-700 text-[10px] px-1.5 rounded">
                  Host (Kamu)
                </span>
              </div>
              <span className="text-[11px] text-stone-400">Pemilik Lahan Aetherwyn</span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">🟢 Aktif</span>
        </div>

        {/* Remote Players List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 my-3">
          {roster.length === 0 ? (
            <p className="text-center text-xs text-stone-500 py-6 italic">
              Tidak ada petualang lain di lahan saat ini. Bagikan tautan untuk mengajak teman bermain bersama!
            </p>
          ) : (
            roster.map((player) => (
              <div
                key={player.id}
                className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold text-white shadow"
                    style={{ backgroundColor: player.color || '#38bdf8', borderColor: '#ffffff' }}
                  >
                    🧑
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-200 text-xs">{player.name}</h4>
                    <span className="text-[10px] text-stone-500 font-mono">ID: {player.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-cyan-400 font-mono block">
                    Pos: ({Math.round(player.x / 40)}, {Math.round(player.y / 40)})
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {player.is_moving ? '🏃 Berlari' : '🧍 Berdiri'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Server Performance Metrics */}
        {metrics && (
          <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex justify-between items-center font-mono">
            <span>Pesan Diterima: {metrics.messages_received}</span>
            <span>Broadcast: {metrics.messages_broadcast}</span>
            <span>Throughput: {metrics.throughput_msg_per_sec}/s</span>
          </div>
        )}
      </div>
    </div>
  );
}
