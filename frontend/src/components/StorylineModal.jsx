import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';
import CutscenePlayerModal from './CutscenePlayerModal';

export default function StorylineModal({ isOpen, onClose }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlayChapter, setActivePlayChapter] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    async function loadStoryline() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/game/storyline/1');
        if (res.ok) {
          const data = await res.json();
          setChapters(data);
        }
      } catch (err) {
        console.error('Error fetching storyline chapters', err);
      } finally {
        setLoading(false);
      }
    }
    loadStoryline();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectChapter = (chap) => {
    if (!chap.unlocked) {
      sounds.playClick();
      return;
    }
    sounds.playLevelUp();
    setActivePlayChapter(chap);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-stone-900 border-4 border-amber-900/90 rounded-2xl w-full max-w-4xl shadow-2xl p-5 sm:p-7 relative max-h-[90vh] flex flex-col text-stone-100">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-stone-400 hover:text-white bg-stone-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-stone-600 transition"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950 border-2 border-amber-600 flex items-center justify-center text-2xl shadow-lg">
            🎬
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-medieval text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              Alur Cerita & Sinematik Aetherwyn
            </h2>
            <p className="text-stone-400 text-xs">
              Saksikan babak sejarah, trailer epik, dan kenangan persahabatan seiring kemajuan quest dan tingkat hubunganmu!
            </p>
          </div>
        </div>

        {/* CHAPTERS GRID */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12 text-stone-400 text-sm">
            <span>Memuat babak sinematik...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2">
            {chapters.map((chap) => {
              const isUnlocked = chap.unlocked;
              return (
                <div
                  key={chap.id}
                  onClick={() => handleSelectChapter(chap)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    isUnlocked
                      ? 'bg-stone-950/80 hover:bg-stone-800/80 border-amber-700/80 shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                      : 'bg-stone-950/40 border-stone-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        isUnlocked
                          ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                          : 'bg-stone-900 border-stone-700 text-stone-500'
                      }`}
                    >
                      {isUnlocked ? '🎬' : '🔒'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            isUnlocked
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-stone-900 text-stone-500 border border-stone-700'
                          }`}
                        >
                          {isUnlocked ? 'TERBUKA' : 'TERKUNCI'}
                        </span>
                        <span className="text-xs font-bold text-amber-400 font-medieval">
                          {chap.chapter_number === 0 ? 'Trailer Sinematik' : `Babak ${chap.chapter_number}`}
                        </span>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold mt-0.5 ${
                          isUnlocked ? 'text-amber-100' : 'text-stone-400'
                        }`}
                      >
                        {chap.title}
                      </h4>
                      <p className="text-stone-400 text-xs">{chap.subtitle}</p>

                      {!isUnlocked && (
                        <p className="text-amber-500 text-[11px] mt-1 italic font-medium">
                          ⚠️ Syarat Buka: {chap.unlock_desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectChapter(chap);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
                      >
                        <span>▶ Tonton Sinematik</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-500 block text-right">
                        Selesaikan Quest Terkait
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER TIP */}
        <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-[11px] text-stone-500">
          <span>
            💡 Selesaikan quest warga seperti <strong className="text-amber-400">"5 Bit Merah"</strong> atau <strong className="text-rose-400">"Having Friends with Us!"</strong> untuk membuka babak baru!
          </span>
          <span className="font-mono text-amber-500/80">7 Babak Total</span>
        </div>
      </div>

      {/* ACTIVE CUTSCENE PLAYER MODAL */}
      <CutscenePlayerModal
        isOpen={activePlayChapter !== null}
        onClose={() => setActivePlayChapter(null)}
        chapter={activePlayChapter}
      />
    </div>
  );
}
