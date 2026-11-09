import React, { useState } from 'react';
import { sounds } from '../game/SoundFx';

export default function ShippingSummaryModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  itemCatalog,
  showNotification
}) {
  const [daySummary, setDaySummary] = useState(null);
  const [isSleeping, setIsSleeping] = useState(false);

  if (!isOpen || !gameState) return null;

  const shippingBin = gameState.shipping_bin || [];
  const currentTotal = shippingBin.reduce(
    (sum, item) => sum + (item.sell_price || 10) * (item.count || 1),
    0
  );

  const handleConfirmSleep = async () => {
    setIsSleeping(true);
    sounds.playLevelUp();

    try {
      const res = await fetch('/api/v1/game/sleep/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setDaySummary(data.summary);
      setGameState(data.updated_state);
      sounds.playCoin();
    } catch (err) {
      showNotification('Gagal memproses tidur: ' + err.message, 'error');
      setIsSleeping(false);
    }
  };

  const handleWakeUp = () => {
    sounds.playClick();
    setDaySummary(null);
    setIsSleeping(false);
    onClose();
    showNotification('Selamat Pagi! Hari baru telah tiba di Aetherwyn. ☀️', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        {!daySummary ? (
          /* STEP 1: SLEEP CONFIRMATION & SHIPPING PREVIEW */
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl">🛏️</span>
              <div>
                <h2 className="text-xl font-bold font-medieval text-amber-200">
                  Tidur & Istirahat di Rumah Petani
                </h2>
                <p className="text-stone-400 text-xs">
                  Akhiri hari ini untuk memulihkan Stamina dan HP penuh.
                </p>
              </div>
            </div>

            {/* Shipping Box Ledger */}
            <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 my-4">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-stone-800 text-xs font-bold text-amber-300">
                <span>📦 Muatan Kotak Pengiriman Hari Ini</span>
                <span>{shippingBin.length} Jenis Item</span>
              </div>

              {shippingBin.length === 0 ? (
                <p className="text-stone-500 text-xs italic py-4 text-center">
                  Kotak pengiriman masih kosong. Kamu belum menjual barang hari ini.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                  {shippingBin.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-stone-300">
                      <span>{item.name || itemCatalog[item.item_id]?.name || item.item_id} ({item.count}x)</span>
                      <span className="font-mono text-amber-300">
                        +{(item.sell_price * item.count).toLocaleString()} G
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-stone-800 font-bold text-sm">
                <span className="text-stone-200">Estimasi Pendapatan:</span>
                <span className="text-amber-400 font-mono">+{currentTotal.toLocaleString()} G</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => { sounds.playClick(); onClose(); }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition border border-stone-700"
              >
                Kembali Bekerja
              </button>

              <button
                disabled={isSleeping}
                onClick={handleConfirmSleep}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
              >
                <span>💤</span>
                <span>{isSleeping ? 'Tidur...' : 'Tidur Sekarang'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: MORNING REPORT */
          <div className="text-center py-2 animate-fadeIn">
            <span className="text-5xl block mb-2">🌄</span>
            <h2 className="text-2xl font-bold font-medieval text-amber-300 mb-1">
              Fajar Menyingsing di Aetherwyn
            </h2>
            <p className="text-stone-400 text-xs mb-4">
              Hari {daySummary.day}, Musim {daySummary.season} • Cuaca: {daySummary.weather}
            </p>

            <div className="bg-stone-950/80 border border-amber-900/60 rounded-xl p-4 mb-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Emas dari Penjualan Hasil Bumi:</span>
                <span className="text-amber-400 font-mono font-bold text-sm">
                  +{daySummary.total_gold_earned.toLocaleString()} G
                </span>
              </div>

              <div className="flex justify-between text-stone-300">
                <span>Tanaman yang Bertumbuh Hari Ini:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {daySummary.crops_grown_count} Petak
                </span>
              </div>

              <div className="flex justify-between text-stone-300">
                <span>Status Perkembangan Desa:</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[240px]">
                  {daySummary.era_name.split('—')[0]}
                </span>
              </div>

              <div className="flex justify-between text-stone-300 border-t border-stone-800 pt-2">
                <span>Stamina & Energi Tubuh:</span>
                <span className="text-emerald-400 font-bold">100% Pulih Penuh! ⚡</span>
              </div>
            </div>

            <button
              onClick={handleWakeUp}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-sm shadow-xl transition"
            >
              Mulai Hari Baru! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
