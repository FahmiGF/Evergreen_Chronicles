import React from 'react';
import { sounds } from '../game/SoundFx';

export default function ControlsGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600"
        >
          ✕
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📜</span>
          <h2 className="text-xl font-bold font-medieval text-amber-200">
            Buku Panduan & Kontrol Evergreen Chronicles
          </h2>
        </div>

        <div className="space-y-3 text-xs text-stone-300 max-h-[70vh] overflow-y-auto pr-1">
          {/* Controls Table */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 space-y-2">
            <h3 className="font-bold text-amber-300 text-sm mb-1">🎮 Tombol Kontrol Permainan</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">W A S D</kbd> / Panah: Gerak Karakter</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">Spasi / Klik</kbd>: Pakai Alat / Panen / Tanam</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">1 — 9, 0</kbd>: Pilih Slot Bar Cepat</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">E</kbd>: Buka Tas Ransel</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">C</kbd>: Buka Meja Kerajinan (Crafting)</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">T</kbd>: Buka Riset Teknologi & Era</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">M</kbd>: Jelajah Gua Tambang & Monster</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-600 font-mono text-amber-200">Z</kbd>: Tidur di Kasur & Mulai Hari Baru</div>
            </div>
          </div>

          {/* Gameplay Tips */}
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 space-y-2">
            <h3 className="font-bold text-emerald-300 text-sm mb-1">🌱 Tips Bertani & Berkembang</h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px] leading-relaxed">
              <li><strong>Mencangkul & Menyiram:</strong> Gunakan Cangkul pada petak rumput, tanam benih sayur, lalu siram dengan Gembor air setiap hari agar tanaman tidak layu.</li>
              <li><strong>Panen & Menjual:</strong> Ketika tanaman matang dan berkilau emas, klik untuk memanennya. Masukkan sayur ke Kotak Pengiriman (kanan atas) untuk memperoleh uang Emas (G) saat tidur.</li>
              <li><strong>Menambang & Melawan Monster:</strong> Buka Gua Tambang [M] untuk membasmi Slime dan menambang Bijih Besi, Tembaga, serta Kristal Aether.</li>
              <li><strong>Evolusi Peradaban:</strong> Kumpulkan Emas dan Kristal Aether untuk membuka teknologi di Menu Riset [T]. Buka teknologi seperti Sprinkler Otomatis, Mesin Uap, hingga Automaton Robot!</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Mengerti & Lanjutkan Bermain
          </button>
        </div>
      </div>
    </div>
  );
}
