import React from 'react';

/**
 * High-definition Character Portraits for Evergreen Chronicles NPCs.
 * Features custom faces, unique expressions, signature hats/headgear, and detailed outfits.
 */
export default function NpcPortrait({ npcId, isSpeaking = false, className = "w-36 h-36" }) {
  if (npcId === 'npc_elara') {
    return (
      <div className={`relative rounded-2xl overflow-hidden border-2 border-emerald-500/70 shadow-2xl bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-950 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <defs>
            <linearGradient id="elaraSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
            <linearGradient id="elaraHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="elaraTunic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>

          {/* Background Aura */}
          <circle cx="80" cy="80" r="70" fill="rgba(34, 197, 94, 0.15)" />

          {/* Chestnut Hair - Back */}
          <path d="M40 70 C35 110, 45 150, 48 160 L112 160 C115 150, 125 110, 120 70 Z" fill="url(#elaraHair)" />

          {/* Green Herbalist Robe / Shirt */}
          <path d="M35 160 L45 120 C55 110, 105 110, 115 120 L125 160 Z" fill="url(#elaraTunic)" />
          {/* Robe Collar (Ivory Trim) */}
          <path d="M60 120 L80 145 L100 120" stroke="#fef3c7" strokeWidth="4" fill="none" />
          {/* Silver Leaf Brooch */}
          <circle cx="80" cy="144" r="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M80 140 Q83 144 80 148 Q77 144 80 140" fill="#38bdf8" />

          {/* Neck */}
          <rect x="72" y="95" width="16" height="22" fill="url(#elaraSkin)" />

          {/* Face */}
          <path d="M52 65 C50 98, 62 114, 80 114 C98 114, 110 98, 108 65 C106 42, 54 42, 52 65 Z" fill="url(#elaraSkin)" />

          {/* Rosy Cheeks */}
          <circle cx="62" cy="86" r="6" fill="rgba(244, 63, 94, 0.3)" />
          <circle cx="98" cy="86" r="6" fill="rgba(244, 63, 94, 0.3)" />

          {/* Gentle Emerald Eyes */}
          <ellipse cx="66" cy="74" rx="4.5" ry="3.5" fill="#15803d" />
          <circle cx="67.5" cy="73" r="1.5" fill="#ffffff" />
          <ellipse cx="94" cy="74" rx="4.5" ry="3.5" fill="#15803d" />
          <circle cx="95.5" cy="73" r="1.5" fill="#ffffff" />
          {/* Eyelashes & Brows */}
          <path d="M60 70 Q66 67 72 70" stroke="#451a03" strokeWidth="2" fill="none" />
          <path d="M88 70 Q94 67 100 70" stroke="#451a03" strokeWidth="2" fill="none" />

          {/* Gentle Smile */}
          <path d="M72 95 Q80 102 88 95" stroke="#b91c1c" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Bangs Hair */}
          <path d="M52 55 Q70 65 80 50 Q90 65 108 55 C105 40, 55 40, 52 55 Z" fill="url(#elaraHair)" />

          {/* Hat / Floral Herbal Crown */}
          <path d="M48 52 Q80 44 112 52" stroke="#166534" strokeWidth="5" fill="none" />
          {/* Little Chamomile Flowers on Crown */}
          <circle cx="58" cy="50" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="80" cy="46" r="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="80" cy="46" r="2.5" fill="#f59e0b" />
          <circle cx="102" cy="50" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* Leaves */}
          <path d="M68 46 Q72 42 76 47" stroke="#22c55e" strokeWidth="2.5" fill="none" />
          <path d="M84 47 Q88 42 92 46" stroke="#22c55e" strokeWidth="2.5" fill="none" />
        </svg>

        {isSpeaking && (
          <span className="absolute bottom-1 right-1.5 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
        )}
      </div>
    );
  }

  if (npcId === 'npc_rowan') {
    return (
      <div className={`relative rounded-2xl overflow-hidden border-2 border-amber-600/70 shadow-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <defs>
            <linearGradient id="rowanSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="rowanLeather" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Background Forge Glow */}
          <circle cx="80" cy="80" r="70" fill="rgba(249, 115, 22, 0.15)" />

          {/* Muscular Shoulders & Leather Apron */}
          <path d="M25 160 L38 115 C52 105, 108 105, 122 115 L135 160 Z" fill="url(#rowanLeather)" />
          {/* Steel Pauldron on Right Shoulder */}
          <path d="M28 120 Q35 110 50 115 L45 140 Q30 135 28 120 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <circle cx="38" cy="125" r="2.5" fill="#f59e0b" />
          {/* Heavy Hammer Straps */}
          <path d="M55 115 L105 160" stroke="#292524" strokeWidth="5" />
          <path d="M105 115 L55 160" stroke="#292524" strokeWidth="5" />

          {/* Thick Neck */}
          <rect x="68" y="92" width="24" height="25" fill="url(#rowanSkin)" />

          {/* Chiseled Jaw Face */}
          <path d="M50 62 C48 95, 60 116, 80 116 C100 116, 112 95, 110 62 C108 42, 52 42, 50 62 Z" fill="url(#rowanSkin)" />

          {/* Stubble Beard */}
          <path d="M56 86 C58 108, 68 115, 80 115 C92 115, 102 108, 104 86 C98 96, 62 96, 56 86 Z" fill="#451a03" opacity="0.65" />

          {/* Resolute Stoic Mouth */}
          <line x1="72" y1="98" x2="88" y2="98" stroke="#292524" strokeWidth="3" strokeLinecap="round" />

          {/* Fierce Amber-Brown Eyes */}
          <ellipse cx="66" cy="72" rx="4" ry="3" fill="#451a03" />
          <circle cx="67" cy="71" r="1.2" fill="#ffffff" />
          <ellipse cx="94" cy="72" rx="4" ry="3" fill="#451a03" />
          <circle cx="95" cy="71" r="1.2" fill="#ffffff" />
          {/* Heavy Brow */}
          <path d="M58 67 L74 69" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M86 69 L102 67" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
          {/* Forge Scar across left eyebrow */}
          <line x1="60" y1="63" x2="68" y2="73" stroke="#b91c1c" strokeWidth="1.8" />

          {/* Hair & Blacksmith Bandana / Headband */}
          <path d="M46 54 Q80 44 114 54 C112 36, 48 36, 46 54 Z" fill="#1c1917" />
          {/* Leather Welder Headband with Brass Goggle Rims */}
          <rect x="46" y="50" width="68" height="10" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="66" cy="55" r="6" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
          <circle cx="94" cy="55" r="6" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
        </svg>

        {isSpeaking && (
          <span className="absolute bottom-1 right-1.5 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
        )}
      </div>
    );
  }

  if (npcId === 'npc_nessa') {
    return (
      <div className={`relative rounded-2xl overflow-hidden border-2 border-cyan-500/70 shadow-2xl bg-gradient-to-b from-stone-950 via-cyan-950 to-stone-950 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <defs>
            <linearGradient id="nessaCoat" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#155e75" />
            </linearGradient>
            <linearGradient id="nessaHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Background Aether Energy Pulse */}
          <circle cx="80" cy="80" r="70" fill="rgba(6, 182, 212, 0.18)" />

          {/* Spiky Blonde Hair - Back */}
          <path d="M38 65 L32 80 L44 85 L35 105 L52 110 L108 110 L125 105 L116 85 L128 80 L122 65 Z" fill="url(#nessaHair)" />

          {/* Teal Engineer Coat with Brass Gears */}
          <path d="M35 160 L45 118 C56 108, 104 108, 115 118 L125 160 Z" fill="url(#nessaCoat)" />
          {/* High Collar with Copper Inductors */}
          <rect x="68" y="112" width="24" height="12" fill="#b45309" rx="2" stroke="#d97706" strokeWidth="1" />
          {/* Glowing Aether Battery Pin */}
          <circle cx="62" cy="136" r="6" fill="#06b6d4" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="62" cy="136" r="2.5" fill="#ffffff" />
          {/* Brass Gear Badge on Lapel */}
          <circle cx="98" cy="136" r="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />

          {/* Neck */}
          <rect x="73" y="94" width="14" height="22" fill="#fed7aa" />

          {/* Face */}
          <path d="M52 64 C50 96, 62 112, 80 112 C98 112, 110 96, 108 64 C106 44, 54 44, 52 64 Z" fill="#fed7aa" />

          {/* Inquisitive Sparkling Turquoise Eyes */}
          <ellipse cx="66" cy="74" rx="5" ry="4" fill="#06b6d4" />
          <circle cx="68" cy="72" r="2" fill="#ffffff" />
          <ellipse cx="94" cy="74" rx="5" ry="4" fill="#06b6d4" />
          <circle cx="96" cy="72" r="2" fill="#ffffff" />

          {/* Cheerful Smile */}
          <path d="M72 94 Q80 102 88 94" stroke="#be123c" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Crystal Soot Smudge on Left Cheek */}
          <ellipse cx="61" cy="88" rx="4" ry="2.5" fill="rgba(6, 182, 212, 0.4)" />

          {/* Spiky Blonde Bangs */}
          <path d="M48 58 L62 68 L70 56 L82 70 L92 56 L104 68 L112 58 Z" fill="url(#nessaHair)" />

          {/* Chunky Steampunk Goggles on Forehead */}
          <rect x="46" y="44" width="68" height="9" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          {/* Left Lens */}
          <circle cx="66" cy="48" r="8" fill="#22d3ee" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="66" cy="48" r="3" fill="#ffffff" opacity="0.75" />
          {/* Right Lens */}
          <circle cx="94" cy="48" r="8" fill="#22d3ee" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="94" cy="48" r="3" fill="#ffffff" opacity="0.75" />
          {/* Bridge Screw */}
          <line x1="74" y1="48" x2="86" y2="48" stroke="#f59e0b" strokeWidth="3" />
        </svg>

        {isSpeaking && (
          <span className="absolute bottom-1 right-1.5 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
        )}
      </div>
    );
  }

  // Mira (npc_mira)
  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-gradient-to-b from-stone-950 via-amber-950 to-stone-950 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 160 160" className="w-full h-full">
        <defs>
          <linearGradient id="miraVelvet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="100%" stopColor="#500724" />
          </linearGradient>
          <linearGradient id="miraHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Background Golden Sparkle */}
        <circle cx="80" cy="80" r="70" fill="rgba(251, 191, 36, 0.15)" />

        {/* Voluminous Chestnut Hair - Back */}
        <path d="M42 68 C34 110, 42 155, 45 160 L115 160 C118 155, 126 110, 118 68 Z" fill="url(#miraHair)" />

        {/* Burgundy Velvet Merchant Coat with Gold Filigree */}
        <path d="M35 160 L45 118 C56 108, 104 108, 115 118 L125 160 Z" fill="url(#miraVelvet)" />
        {/* Gold Filigree Edging */}
        <path d="M60 120 L80 155 L100 120" stroke="#fbbf24" strokeWidth="3.5" fill="none" />
        {/* Silk Cravat */}
        <path d="M72 120 L80 138 L88 120 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="80" cy="123" r="3" fill="#f59e0b" />

        {/* Neck */}
        <rect x="73" y="95" width="14" height="22" fill="#fed7aa" />

        {/* Face */}
        <path d="M54 66 C52 98, 64 112, 80 112 C96 112, 108 98, 106 66 C104 45, 56 45, 54 66 Z" fill="#fed7aa" />

        {/* Sparkling Sapphire-Blue Eyes */}
        <ellipse cx="68" cy="74" rx="4.5" ry="3.5" fill="#2563eb" />
        <circle cx="69.5" cy="73" r="1.5" fill="#ffffff" />
        <ellipse cx="92" cy="74" rx="4.5" ry="3.5" fill="#2563eb" />
        <circle cx="93.5" cy="73" r="1.5" fill="#ffffff" />

        {/* Welcoming Smile with Lipstick */}
        <path d="M73 95 Q80 102 87 95" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Elegant Auburn Bangs */}
        <path d="M54 58 Q72 68 80 54 Q96 68 106 58 Z" fill="url(#miraHair)" />

        {/* Feathered Merchant Beret / Hat */}
        <path d="M42 54 C40 36, 120 36, 118 54 C100 50, 60 50, 42 54 Z" fill="#831843" stroke="#f59e0b" strokeWidth="2" />
        {/* Golden Hat Medallion */}
        <circle cx="106" cy="46" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
        {/* Sweeping Golden Pheasant Feather */}
        <path d="M106 46 Q122 30 135 15 Q125 32 108 45" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
      </svg>

      {isSpeaking && (
        <span className="absolute bottom-1 right-1.5 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
      )}
    </div>
  );
}
