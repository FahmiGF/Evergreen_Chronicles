import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../game/SoundFx';

export default function CharacterStudioModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('race'); // 'race' | 'appearance' | 'personality' | 'wardrobe'
  const [options, setOptions] = useState(null);
  const [races, setRaces] = useState([]);
  const [personalities, setPersonalities] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Character Draft State
  const [profile, setProfile] = useState({
    race: 'human',
    skin_tone: '#fed7aa',
    face_shape: 'shape_oval',
    eye_color: '#2563eb',
    hair_style: 'adventurer',
    hair_color: '#78350f',
    highlight_color: '#d97706',
    facial_markings: 'none',
    appendages: {
      horns: 'none',
      wings: 'none',
      ears: 'ears_human_round',
      tail: 'none'
    },
    body_build: 'balanced',
    personality: 'Curious',
    background: 'Adventurer'
  });

  const [wardrobe, setWardrobe] = useState({
    headwear: 'hat_straw',
    top: 'tunic_red_classic',
    bottom: 'pants_blue_overalls',
    footwear: 'boots_leather_work',
    back_item: 'none',
    active_outfit_preset: 'casual'
  });

  const canvasRef = useRef(null);

  // Load Customization Catalogs from backend
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function fetchCatalogs() {
      try {
        setLoading(true);
        const [optRes, racesRes, persRes, bgRes] = await Promise.all([
          fetch('/api/v1/game/character/options'),
          fetch('/api/v1/game/races'),
          fetch('/api/v1/game/personalities'),
          fetch('/api/v1/game/backgrounds')
        ]);

        if (optRes.ok && racesRes.ok && persRes.ok && bgRes.ok) {
          const optData = await optRes.json();
          const racesData = await racesRes.json();
          const persData = await persRes.json();
          const bgData = await bgRes.json();

          if (isMounted) {
            setOptions(optData);
            setRaces(racesData);
            setPersonalities(persData);
            setBackgrounds(bgData);
          }
        }
      } catch (err) {
        console.error('Failed to load character options:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalogs();

    // Populate draft from current gameState player profile
    if (gameState?.player) {
      if (gameState.player.character_profile) {
        setProfile({ ...profile, ...gameState.player.character_profile });
      }
      if (gameState.player.wardrobe) {
        setWardrobe({ ...wardrobe, ...gameState.player.wardrobe });
      }
    }

    return () => { isMounted = false; };
  }, [isOpen]);

  // Live Canvas Pixel Avatar Preview Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame;
    let tick = 0;

    const render = () => {
      tick += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle breath bounce
      const bounce = Math.sin(tick) * 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10 + bounce;

      // 1. Soft Pedestal Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 50, 42, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal Ring
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 50, 40, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Wings (Behind Back)
      if (profile.appendages?.wings && profile.appendages.wings !== 'none') {
        const wingWiggle = Math.sin(tick * 2) * 5;
        if (profile.appendages.wings === 'wings_fairy_glimmer') {
          ctx.fillStyle = 'rgba(165, 243, 252, 0.65)';
          ctx.beginPath();
          ctx.ellipse(cx - 32 + wingWiggle, cy - 8, 22, 10, -0.4, 0, Math.PI * 2);
          ctx.ellipse(cx + 32 - wingWiggle, cy - 8, 22, 10, 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (profile.appendages.wings === 'wings_dragon_leather') {
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.moveTo(cx - 16, cy);
          ctx.lineTo(cx - 46, cy - 25 + wingWiggle);
          ctx.lineTo(cx - 36, cy + 10);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx + 16, cy);
          ctx.lineTo(cx + 46, cy - 25 + wingWiggle);
          ctx.lineTo(cx + 36, cy + 10);
          ctx.fill();
        } else {
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.ellipse(cx - 30, cy - 6, 20, 8, -0.3, 0, Math.PI * 2);
          ctx.ellipse(cx + 30, cy - 6, 20, 8, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Tail (Behind body)
      if (profile.appendages?.tail && profile.appendages.tail !== 'none') {
        const tailSway = Math.sin(tick * 2.5) * 8;
        ctx.fillStyle = profile.hair_color || '#d97706';
        ctx.beginPath();
        ctx.ellipse(cx + 20 + tailSway, cy + 30, 16, 8, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Back Item (Cape / Backpack)
      if (wardrobe.back_item === 'cape_crimson_knight') {
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(cx - 18, cy - 5, 36, 42);
      } else if (wardrobe.back_item === 'backpack_leather') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 20, cy - 2, 40, 26);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(cx - 6, cy + 6, 12, 6);
      }

      // 5. Legs / Bottoms & Footwear
      let bottomColor = '#1e3a8a';
      if (wardrobe.bottom === 'pants_hardy_leather') bottomColor = '#78350f';
      else if (wardrobe.bottom === 'trousers_silk_gold') bottomColor = '#ca8a04';
      else if (wardrobe.bottom === 'skirt_pleated_green') bottomColor = '#166534';

      ctx.fillStyle = bottomColor;
      ctx.fillRect(cx - 14, cy + 18, 12, 24);
      ctx.fillRect(cx + 2, cy + 18, 12, 24);

      // Footwear
      let bootColor = '#451a03';
      if (wardrobe.footwear === 'boots_iron_greaves') bootColor = '#475569';
      else if (wardrobe.footwear === 'sandals_elven_woven') bootColor = '#b45309';

      ctx.fillStyle = bootColor;
      ctx.fillRect(cx - 16, cy + 38, 14, 10);
      ctx.fillRect(cx + 2, cy + 38, 14, 10);

      // 6. Body Torso / Top
      let topColor = '#dc2626';
      if (wardrobe.top === 'armor_iron_mail') topColor = '#64748b';
      else if (wardrobe.top === 'robe_velvet_royal') topColor = '#831843';
      else if (wardrobe.top === 'coat_engineer_cyan') topColor = '#0891b2';
      else if (wardrobe.top === 'tunic_emerald_druid') topColor = '#15803d';

      ctx.fillStyle = topColor;
      ctx.fillRect(cx - 16, cy - 8, 32, 28);

      // Collar / Details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(cx - 6, cy - 8, 12, 6);

      // 7. Arms & Hands with Skin Tone
      const skinColor = profile.skin_tone || '#fed7aa';
      ctx.fillStyle = skinColor;
      ctx.fillRect(cx - 22, cy - 6, 6, 24);
      ctx.fillRect(cx + 16, cy - 6, 6, 24);

      // 8. Head / Face
      ctx.fillStyle = skinColor;
      if (profile.face_shape === 'shape_chiseled') {
        ctx.fillRect(cx - 15, cy - 32, 30, 24);
      } else if (profile.face_shape === 'shape_angular') {
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 32);
        ctx.lineTo(cx + 14, cy - 32);
        ctx.lineTo(cx + 10, cy - 8);
        ctx.lineTo(cx - 10, cy - 8);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(cx - 14, cy - 32, 28, 24);
      }

      // Ears
      if (profile.appendages?.ears === 'ears_elven_long') {
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 24);
        ctx.lineTo(cx - 26, cy - 30);
        ctx.lineTo(cx - 14, cy - 18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 24);
        ctx.lineTo(cx + 26, cy - 30);
        ctx.lineTo(cx + 14, cy - 18);
        ctx.fill();
      } else if (profile.appendages?.ears === 'ears_beast_fluffy') {
        ctx.fillStyle = profile.hair_color || '#d97706';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 32);
        ctx.lineTo(cx - 20, cy - 44);
        ctx.lineTo(cx - 6, cy - 32);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 6, cy - 32);
        ctx.lineTo(cx + 20, cy - 44);
        ctx.lineTo(cx + 12, cy - 32);
        ctx.fill();
      }

      // Facial Markings
      if (profile.facial_markings === 'freckles') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - 9, cy - 18, 2, 2);
        ctx.fillRect(cx - 5, cy - 17, 2, 2);
        ctx.fillRect(cx + 5, cy - 17, 2, 2);
        ctx.fillRect(cx + 9, cy - 18, 2, 2);
      } else if (profile.facial_markings === 'scar_cheek') {
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy - 22);
        ctx.lineTo(cx + 10, cy - 14);
        ctx.stroke();
      } else if (profile.facial_markings === 'mystic_rune') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 2, cy - 28, 4, 4);
      } else if (profile.facial_markings === 'battle_paint') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 11, cy - 20, 6, 2);
        ctx.fillRect(cx + 5, cy - 20, 6, 2);
      }

      // Eyes
      const eyeCol = profile.eye_color || '#2563eb';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 9, cy - 23, 6, 5);
      ctx.fillRect(cx + 3, cy - 23, 6, 5);
      ctx.fillStyle = eyeCol;
      ctx.fillRect(cx - 7, cy - 22, 4, 4);
      ctx.fillRect(cx + 5, cy - 22, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx - 6, cy - 21, 2, 2);
      ctx.fillRect(cx + 6, cy - 21, 2, 2);

      // Friendly smile
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(cx - 4, cy - 12, 8, 2);

      // 9. Hair
      const hairCol = profile.hair_color || '#78350f';
      const highlightCol = profile.highlight_color || '#d97706';
      ctx.fillStyle = hairCol;

      if (profile.hair_style === 'braided_long') {
        ctx.fillRect(cx - 16, cy - 36, 32, 10);
        ctx.fillRect(cx - 18, cy - 32, 6, 34);
        ctx.fillRect(cx + 12, cy - 32, 6, 34);
        ctx.fillStyle = highlightCol;
        ctx.fillRect(cx - 10, cy - 34, 4, 6);
      } else if (profile.hair_style === 'spiky') {
        ctx.fillRect(cx - 16, cy - 36, 32, 10);
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 36);
        ctx.lineTo(cx - 8, cy - 44);
        ctx.lineTo(cx - 2, cy - 36);
        ctx.lineTo(cx + 4, cy - 46);
        ctx.lineTo(cx + 10, cy - 36);
        ctx.lineTo(cx + 16, cy - 42);
        ctx.fill();
      } else if (profile.hair_style === 'wavy_bob') {
        ctx.fillRect(cx - 16, cy - 36, 32, 12);
        ctx.fillRect(cx - 18, cy - 30, 7, 22);
        ctx.fillRect(cx + 11, cy - 30, 7, 22);
      } else if (profile.hair_style === 'elven_twin') {
        ctx.fillRect(cx - 16, cy - 36, 32, 10);
        ctx.fillRect(cx - 22, cy - 28, 6, 28);
        ctx.fillRect(cx + 16, cy - 28, 6, 28);
      } else if (profile.hair_style === 'dwarven_bun') {
        ctx.fillRect(cx - 16, cy - 36, 32, 12);
        ctx.fillRect(cx - 8, cy - 46, 16, 12);
      } else {
        // Classic Adventurer
        ctx.fillRect(cx - 16, cy - 36, 32, 10);
        ctx.fillRect(cx - 16, cy - 32, 6, 14);
        ctx.fillRect(cx + 10, cy - 32, 6, 14);
      }

      // Horns
      if (profile.appendages?.horns && profile.appendages.horns !== 'none') {
        ctx.fillStyle = profile.appendages.horns === 'horns_crystal' ? '#38bdf8' : '#78350f';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 36);
        ctx.lineTo(cx - 20, cy - 48);
        ctx.lineTo(cx - 8, cy - 36);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy - 36);
        ctx.lineTo(cx + 20, cy - 48);
        ctx.lineTo(cx + 12, cy - 36);
        ctx.fill();
      }

      // 10. Headwear
      if (wardrobe.headwear === 'hat_straw') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(cx - 24, cy - 36, 48, 6);
        ctx.fillRect(cx - 14, cy - 46, 28, 12);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 14, cy - 38, 28, 3);
      } else if (wardrobe.headwear === 'crown_laurel') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 16, cy - 36, 32, 4);
        ctx.fillRect(cx - 14, cy - 40, 6, 6);
        ctx.fillRect(cx - 2, cy - 42, 6, 8);
        ctx.fillRect(cx + 10, cy - 40, 6, 6);
      } else if (wardrobe.headwear === 'helm_iron') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 18, cy - 40, 36, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 12, cy - 28, 24, 4);
      } else if (wardrobe.headwear === 'hat_beret_merchant') {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(cx - 16, cy - 42, 32, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + 10, cy - 46, 4, 8);
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [profile, wardrobe]);

  // Handle Save
  const handleSaveAndApply = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/v1/game/character/customize/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameState.player?.name || 'Petualang',
          character_profile: profile,
          wardrobe: wardrobe
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGameState(data.save);
        sounds.playLevelUp();
        showNotification('✨ Identitas dan Busana Karakter Berhasil Disimpan!', 'success');
        onClose();
      } else {
        showNotification('Gagal menyimpan karakter', 'error');
      }
    } catch (err) {
      console.error('Error saving character:', err);
      showNotification('Koneksi terputus ke server', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Preset Outfits
  const applyPreset = (presetId) => {
    sounds.playClick();
    if (presetId === 'farmer') {
      setWardrobe({
        ...wardrobe,
        headwear: 'hat_straw',
        top: 'tunic_red_classic',
        bottom: 'pants_blue_overalls',
        footwear: 'boots_leather_work',
        back_item: 'backpack_leather',
        active_outfit_preset: 'farmer'
      });
    } else if (presetId === 'knight') {
      setWardrobe({
        ...wardrobe,
        headwear: 'helm_iron',
        top: 'armor_iron_mail',
        bottom: 'pants_hardy_leather',
        footwear: 'boots_iron_greaves',
        back_item: 'cape_crimson_knight',
        active_outfit_preset: 'knight'
      });
    } else if (presetId === 'noble') {
      setWardrobe({
        ...wardrobe,
        headwear: 'crown_laurel',
        top: 'robe_velvet_royal',
        bottom: 'trousers_silk_gold',
        footwear: 'sandals_elven_woven',
        back_item: 'none',
        active_outfit_preset: 'noble'
      });
    } else if (presetId === 'druid') {
      setWardrobe({
        ...wardrobe,
        headwear: 'none',
        top: 'tunic_emerald_druid',
        bottom: 'skirt_pleated_green',
        footwear: 'sandals_elven_woven',
        back_item: 'none',
        active_outfit_preset: 'druid'
      });
    }
  };

  // Randomize Character
  const handleRandomize = () => {
    sounds.playClick();
    if (!options || !races.length) return;

    const randomRace = races[Math.floor(Math.random() * races.length)];
    const randomTone = options.skin_tones[Math.floor(Math.random() * options.skin_tones.length)].hex;
    const randomHairStyle = options.hair_styles[Math.floor(Math.random() * options.hair_styles.length)].id;
    const randomHairColor = options.hair_colors[Math.floor(Math.random() * options.hair_colors.length)].hex;
    const randomEyeColor = options.eye_colors[Math.floor(Math.random() * options.eye_colors.length)].hex;
    const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)]?.name || 'Adventurous';
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]?.name || 'Explorer';

    setProfile({
      ...profile,
      race: randomRace.id,
      skin_tone: randomTone,
      hair_style: randomHairStyle,
      hair_color: randomHairColor,
      eye_color: randomEyeColor,
      personality: randomPersonality,
      background: randomBg,
      appendages: {
        horns: randomRace.id === 'dragonkin' ? 'horns_draconic' : 'none',
        wings: randomRace.id === 'sylph' ? 'wings_sylph_feather' : randomRace.id === 'fairykin' ? 'wings_fairy_glimmer' : 'none',
        ears: randomRace.id === 'high_elf' ? 'ears_elven_long' : randomRace.id === 'beastfolk' ? 'ears_beast_fluffy' : 'ears_human_round',
        tail: randomRace.id === 'beastfolk' ? 'tail_beast_fluffy' : 'none'
      }
    });

    showNotification(`🎲 Acak: Tercipta karakter ras ${randomRace.name}!`, 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-stone-900 border-2 border-amber-600/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100 font-sans">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border-b border-amber-700/60">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">👤</span>
            <div>
              <h2 className="text-xl font-bold font-medieval text-amber-300">
                Studio Karakter & Lemari Busana
              </h2>
              <p className="text-xs text-amber-200/70">
                Sesuaikan ras, anatomi, kepribadian, dan gaya berbusana di Evergreen Chronicles
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-amber-500/50 text-xs font-bold text-amber-300 transition flex items-center space-x-1"
              title="Acak Karakter Otomatis"
            >
              <span>🎲</span>
              <span>Acak</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white text-2xl font-bold px-2 py-1 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (LEFT PREVIEW, RIGHT TABBED CONFIGURATOR) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* LEFT: LIVE PIXEL AVATAR PREVIEW & IDENTITY CARD */}
          <div className="md:col-span-5 bg-stone-950/90 p-5 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-amber-900/50">
            <div className="w-full flex flex-col items-center">
              <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-700/60 rounded-xl p-4 shadow-inner flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={220}
                  height={220}
                  className="image-rendering-pixelated drop-shadow-lg"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-600/60 text-[10px] font-mono text-amber-300">
                  LIVE 60FPS AVATAR
                </div>
              </div>

              {/* CURRENT CHARACTER SUMMARY BADGE */}
              <div className="w-full mt-4 bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-xs space-y-1.5 shadow">
                <div className="flex justify-between items-center pb-1 border-b border-stone-800">
                  <span className="text-stone-400">Nama Petualang:</span>
                  <span className="font-bold text-amber-200">{gameState.player?.name || 'Kamu'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Ras Pilihan:</span>
                  <span className="font-semibold text-emerald-400 uppercase text-[11px]">
                    {races.find(r => r.id === profile.race)?.name || profile.race}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Kepribadian:</span>
                  <span className="text-cyan-300 font-medium">{profile.personality}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Latar Belakang:</span>
                  <span className="text-amber-300 font-medium">{profile.background}</span>
                </div>
                <div className="pt-2 flex flex-wrap gap-1">
                  {races.find(r => r.id === profile.race)?.passive_perk && (
                    <span className="px-2 py-0.5 rounded bg-amber-900/40 border border-amber-600/40 text-[10px] text-amber-200">
                      ✨ {races.find(r => r.id === profile.race)?.passive_perk}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PRESET QUICK-CHANGE PILLS */}
            <div className="w-full mt-4 pt-3 border-t border-stone-800">
              <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
                Preset Setelan Busana Cepat:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => applyPreset('farmer')}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-left transition flex items-center space-x-1"
                >
                  <span>🌾</span>
                  <span className="truncate">Petani Klasik</span>
                </button>
                <button
                  onClick={() => applyPreset('knight')}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-left transition flex items-center space-x-1"
                >
                  <span>🛡️</span>
                  <span className="truncate">Ksatria Tempa</span>
                </button>
                <button
                  onClick={() => applyPreset('noble')}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-left transition flex items-center space-x-1"
                >
                  <span>👑</span>
                  <span className="truncate">Bangsawan Aether</span>
                </button>
                <button
                  onClick={() => applyPreset('druid')}
                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-left transition flex items-center space-x-1"
                >
                  <span>🌿</span>
                  <span className="truncate">Druid Rimba</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: CONFIGURATION TABS & OPTIONS */}
          <div className="md:col-span-7 flex flex-col bg-stone-900/90 overflow-hidden">
            
            {/* NAVIGATION TABS */}
            <div className="flex border-b border-amber-900/50 bg-stone-950/60 text-xs sm:text-sm font-semibold select-none">
              <button
                onClick={() => { sounds.playClick(); setActiveTab('race'); }}
                className={`flex-1 py-3 px-2 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
                  activeTab === 'race'
                    ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <span>🧬</span>
                <span>Ras ({races.length})</span>
              </button>
              <button
                onClick={() => { sounds.playClick(); setActiveTab('appearance'); }}
                className={`flex-1 py-3 px-2 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
                  activeTab === 'appearance'
                    ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <span>🎨</span>
                <span>Tampilan</span>
              </button>
              <button
                onClick={() => { sounds.playClick(); setActiveTab('personality'); }}
                className={`flex-1 py-3 px-2 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
                  activeTab === 'personality'
                    ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <span>🧠</span>
                <span>Jiwa & Asal</span>
              </button>
              <button
                onClick={() => { sounds.playClick(); setActiveTab('wardrobe'); }}
                className={`flex-1 py-3 px-2 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
                  activeTab === 'wardrobe'
                    ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                <span>👗</span>
                <span>Busana</span>
              </button>
            </div>

            {/* TAB CONTENT WITH SCROLLBAR */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm">
              
              {/* TAB 1: 10 PLAYABLE RACES */}
              {activeTab === 'race' && (
                <div className="space-y-4">
                  <div className="text-xs text-stone-400">
                    Pilih salah satu dari 10 ras legenda Evergreen. Masing-masing ras membawa tradisi, afinitas ekologi, dan perk pasif unik ke dalam gameplay:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {races.map((r) => {
                      const isSelected = profile.race === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            sounds.playClick();
                            setProfile({
                              ...profile,
                              race: r.id,
                              skin_tone: r.default_skin || profile.skin_tone,
                              appendages: {
                                horns: r.id === 'dragonkin' ? 'horns_draconic' : 'none',
                                wings: r.id === 'sylph' ? 'wings_sylph_feather' : r.id === 'fairykin' ? 'wings_fairy_glimmer' : 'none',
                                ears: r.id === 'high_elf' ? 'ears_elven_long' : r.id === 'beastfolk' ? 'ears_beast_fluffy' : 'ears_human_round',
                                tail: r.id === 'beastfolk' ? 'tail_beast_fluffy' : 'none'
                              }
                            });
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                              : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 hover:border-stone-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-amber-200 text-sm">{r.name}</span>
                              {isSelected && <span className="text-amber-400 text-xs">✓ Dipilih</span>}
                            </div>
                            <p className="text-[11px] text-stone-300 leading-snug mb-2">{r.description}</p>
                          </div>
                          <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-[10px]">
                            <span className="text-emerald-400 font-semibold">✨ {r.passive_perk}</span>
                            <span className="text-stone-400 italic">Asal: {r.heritage_origin}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: PHYSICAL APPEARANCE */}
              {activeTab === 'appearance' && options && (
                <div className="space-y-4">
                  {/* Skin Tone */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Warna Kulit:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {options.skin_tones.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => { sounds.playClick(); setProfile({ ...profile, skin_tone: st.hex }); }}
                          className={`w-9 h-9 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                            profile.skin_tone === st.hex ? 'border-amber-400 ring-2 ring-amber-300' : 'border-stone-600'
                          }`}
                          style={{ backgroundColor: st.hex }}
                          title={st.name}
                        >
                          {profile.skin_tone === st.hex && <span className="text-xs text-black font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hairstyle */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Gaya Rambut:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {options.hair_styles.map((hs) => (
                        <button
                          key={hs.id}
                          onClick={() => { sounds.playClick(); setProfile({ ...profile, hair_style: hs.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left ${
                            profile.hair_style === hs.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {hs.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Warna Rambut & Semir:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {options.hair_colors.map((hc) => (
                        <button
                          key={hc.id}
                          onClick={() => { sounds.playClick(); setProfile({ ...profile, hair_color: hc.hex }); }}
                          className={`w-8 h-8 rounded-lg border-2 transition transform hover:scale-110 flex items-center justify-center ${
                            profile.hair_color === hc.hex ? 'border-amber-400 ring-2 ring-amber-300' : 'border-stone-600'
                          }`}
                          style={{ backgroundColor: hc.hex }}
                          title={hc.name}
                        >
                          {profile.hair_color === hc.hex && <span className="text-xs text-white font-bold drop-shadow">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eye Colors */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Warna Iris Mata:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {options.eye_colors.map((ec) => (
                        <button
                          key={ec.id}
                          onClick={() => { sounds.playClick(); setProfile({ ...profile, eye_color: ec.hex }); }}
                          className={`w-8 h-8 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                            profile.eye_color === ec.hex ? 'border-amber-400 ring-2 ring-amber-300' : 'border-stone-600'
                          }`}
                          style={{ backgroundColor: ec.hex }}
                          title={ec.name}
                        >
                          {profile.eye_color === ec.hex && <span className="text-xs text-white font-bold drop-shadow">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Appendages (Horns, Wings, Ears, Tails) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1">Tanduk:</label>
                      <select
                        value={profile.appendages?.horns || 'none'}
                        onChange={(e) => setProfile({
                          ...profile,
                          appendages: { ...profile.appendages, horns: e.target.value }
                        })}
                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-2 text-xs text-stone-200"
                      >
                        {options.appendages.horns.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1">Sayap:</label>
                      <select
                        value={profile.appendages?.wings || 'none'}
                        onChange={(e) => setProfile({
                          ...profile,
                          appendages: { ...profile.appendages, wings: e.target.value }
                        })}
                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-2 text-xs text-stone-200"
                      >
                        {options.appendages.wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1">Bentuk Telinga:</label>
                      <select
                        value={profile.appendages?.ears || 'ears_human_round'}
                        onChange={(e) => setProfile({
                          ...profile,
                          appendages: { ...profile.appendages, ears: e.target.value }
                        })}
                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-2 text-xs text-stone-200"
                      >
                        {options.appendages.ears.map(ea => <option key={ea.id} value={ea.id}>{ea.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1">Ekor:</label>
                      <select
                        value={profile.appendages?.tail || 'none'}
                        onChange={(e) => setProfile({
                          ...profile,
                          appendages: { ...profile.appendages, tail: e.target.value }
                        })}
                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-2 text-xs text-stone-200"
                      >
                        {options.appendages.tails.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Facial Markings */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Tanda Wajah & Tato Rune:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.facial_markings.map((fm) => (
                        <button
                          key={fm.id}
                          onClick={() => { sounds.playClick(); setProfile({ ...profile, facial_markings: fm.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left ${
                            profile.facial_markings === fm.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {fm.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PERSONALITY & BACKGROUND */}
              {activeTab === 'personality' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Dimensi Kepribadian Karakter:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {personalities.map((p) => {
                        const isSelected = profile.personality === p.name;
                        return (
                          <button
                            key={p.name}
                            onClick={() => { sounds.playClick(); setProfile({ ...profile, personality: p.name }); }}
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-950/60 border-amber-500 text-amber-100 ring-1 ring-amber-400 shadow'
                                : 'bg-stone-800/70 border-stone-700 text-stone-300 hover:bg-stone-700/80'
                            }`}
                          >
                            <div className="font-bold text-xs text-amber-200 mb-1">{p.name}</div>
                            <div className="text-[10px] text-stone-400 leading-tight">{p.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Latar Belakang & Asal-usul:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {backgrounds.map((bg) => {
                        const isSelected = profile.background === bg.name;
                        return (
                          <div
                            key={bg.name}
                            onClick={() => { sounds.playClick(); setProfile({ ...profile, background: bg.name }); }}
                            className={`p-3 rounded-xl border cursor-pointer transition ${
                              isSelected
                                ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-400 text-amber-100 shadow'
                                : 'bg-stone-800/70 border-stone-700 text-stone-300 hover:bg-stone-700/80'
                            }`}
                          >
                            <div className="font-bold text-xs text-amber-300 mb-1 flex items-center justify-between">
                              <span>{bg.name}</span>
                              <span className="text-[10px] text-emerald-400 font-semibold">{bg.starting_perk}</span>
                            </div>
                            <p className="text-[11px] text-stone-300">{bg.lore}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WARDROBE ITEMS */}
              {activeTab === 'wardrobe' && options && (
                <div className="space-y-4">
                  {/* Headwear */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Penutup Kepala:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.wardrobe.headwear.map((hw) => (
                        <button
                          key={hw.id}
                          onClick={() => { sounds.playClick(); setWardrobe({ ...wardrobe, headwear: hw.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left flex items-center space-x-2 ${
                            wardrobe.headwear === hw.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="text-base">{hw.icon}</span>
                          <span className="truncate">{hw.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tops */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Baju / Atasan:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.wardrobe.tops.map((tp) => (
                        <button
                          key={tp.id}
                          onClick={() => { sounds.playClick(); setWardrobe({ ...wardrobe, top: tp.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left flex items-center space-x-2 ${
                            wardrobe.top === tp.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="text-base">{tp.icon}</span>
                          <span className="truncate">{tp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottoms */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Celana & Bawahan:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.wardrobe.bottoms.map((bt) => (
                        <button
                          key={bt.id}
                          onClick={() => { sounds.playClick(); setWardrobe({ ...wardrobe, bottom: bt.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left flex items-center space-x-2 ${
                            wardrobe.bottom === bt.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full inline-block border border-stone-500" style={{ backgroundColor: bt.hex }} />
                          <span className="truncate">{bt.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Sepatu & Alas Kaki:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.wardrobe.footwear.map((fw) => (
                        <button
                          key={fw.id}
                          onClick={() => { sounds.playClick(); setWardrobe({ ...wardrobe, footwear: fw.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left flex items-center space-x-2 ${
                            wardrobe.footwear === fw.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full inline-block border border-stone-500" style={{ backgroundColor: fw.hex }} />
                          <span className="truncate">{fw.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Back Items */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                      Aksesori Punggung:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {options.wardrobe.back_items.map((bi) => (
                        <button
                          key={bi.id}
                          onClick={() => { sounds.playClick(); setWardrobe({ ...wardrobe, back_item: bi.id }); }}
                          className={`p-2 rounded-lg text-xs font-semibold border transition text-left flex items-center space-x-2 ${
                            wardrobe.back_item === bi.id
                              ? 'bg-amber-900/60 border-amber-400 text-amber-100 ring-1 ring-amber-400'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          <span className="text-base">{bi.icon}</span>
                          <span className="truncate">{bi.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER ACTION BUTTONS */}
            <div className="p-4 bg-stone-950/80 border-t border-amber-900/60 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                Semua perubahan disimpan permanen ke save slot dan disinkronkan ke multiplayer.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveAndApply}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>{saving ? 'Menyimpan...' : 'Terapkan & Simpan'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
