// Voice AI Engine for Evergreen Chronicles
// Provides distinct, personality-driven spoken voices and procedural formant synthesis for each NPC.

class VoiceAiEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.audioCtx = null;
    this.currentUtterance = null;
    this.isMuted = false;
    this.voicesLoaded = false;
    this.availableVoices = [];

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  _loadVoices() {
    if (this.synth) {
      this.availableVoices = this.synth.getVoices();
      if (this.availableVoices.length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Get unique personality configuration for an NPC
   */
  getNpcVoiceProfile(npcId) {
    switch (npcId) {
      case 'npc_elara':
        // Elara: Gentle, soothing, maternal herbalist, warm and empathetic
        return {
          name: 'Elara',
          pitch: 1.18,
          rate: 0.90,
          volume: 1.0,
          preferredGender: 'female',
          formantFreq: 520, // Soothing melodic mid-high
          waveType: 'sine',
          dialogueTone: 'Lembut, menenangkan, penuh empati'
        };

      case 'npc_rowan':
        // Rowan: Royal blacksmith, stoic, deep baritone, gruff and sturdy
        return {
          name: 'Rowan',
          pitch: 0.62, // Very deep resonant voice
          rate: 0.86, // Measured, steady tempo
          volume: 1.0,
          preferredGender: 'male',
          formantFreq: 130, // Deep baritone chest resonance
          waveType: 'sawtooth',
          dialogueTone: 'Berat, tegas, berwibawa, nada pandai besi'
        };

      case 'npc_nessa':
        // Nessa: Excitable crystal engineer, rapid, bright, curious and energetic
        return {
          name: 'Nessa',
          pitch: 1.38, // Bright, youthful, energetic
          rate: 1.10, // Fast, excited cadence
          volume: 1.0,
          preferredGender: 'female',
          formantFreq: 750, // High energetic resonance
          waveType: 'triangle',
          dialogueTone: 'Bersemangat, cerdas, antusias, nada ilmuwan'
        };

      case 'npc_mira':
        // Mira: Charismatic merchant, welcoming, friendly, persuasive, lively
        return {
          name: 'Mira',
          pitch: 1.04, // Warm balanced pitch
          rate: 1.02, // Friendly brisk tempo
          volume: 1.0,
          preferredGender: 'female',
          formantFreq: 460, // Warm approachable tone
          waveType: 'sine',
          dialogueTone: 'Ramah, bersahabat, lihai berdagang'
        };

      default:
        return {
          name: 'Penduduk',
          pitch: 1.0,
          rate: 1.0,
          volume: 1.0,
          preferredGender: 'female',
          formantFreq: 400,
          waveType: 'sine',
          dialogueTone: 'Netral'
        };
    }
  }

  /**
   * Select best matching system voice
   */
  _pickBestVoice(profile) {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      this._loadVoices();
    }

    const voices = this.availableVoices;
    if (!voices || voices.length === 0) return null;

    // 1. Try Indonesian voice first if available
    const idVoices = voices.filter((v) => v.lang.startsWith('id') || v.lang.startsWith('ms'));
    if (idVoices.length > 0) {
      if (profile.preferredGender === 'male') {
        const male = idVoices.find((v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('ard'));
        if (male) return male;
      } else {
        const female = idVoices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('gadis') || v.name.toLowerCase().includes('siti'));
        if (female) return female;
      }
      return idVoices[0];
    }

    // 2. Select by preferred gender in English/default voices
    if (profile.preferredGender === 'male') {
      const male = voices.find(
        (v) => v.name.toLowerCase().includes('male') ||
               v.name.toLowerCase().includes('david') ||
               v.name.toLowerCase().includes('george') ||
               v.name.toLowerCase().includes('guy')
      );
      if (male) return male;
    } else {
      const female = voices.find(
        (v) => v.name.toLowerCase().includes('female') ||
               v.name.toLowerCase().includes('zira') ||
               v.name.toLowerCase().includes('samantha') ||
               v.name.toLowerCase().includes('hazel')
      );
      if (female) return female;
    }

    return voices[0];
  }

  /**
   * Speak a line of dialogue with the NPC's distinct voice and trigger callbacks
   */
  speak(text, npcId, onStart, onEnd) {
    if (this.isMuted || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    const profile = this.getNpcVoiceProfile(npcId);

    if (this.synth) {
      const cleanText = text.replace(/[🌾🔨⚡🍎✨❤️🪙💎💧🏡]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = profile.volume;

      const chosenVoice = this._pickBestVoice(profile);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } else {
      // Fallback procedural retro audio chirps
      this._playRetroVoiceBlip(profile, text.length, onStart, onEnd);
    }
  }

  /**
   * Procedural retro audio chirp (Animal Crossing / Undertale / Celeste style)
   */
  _playRetroVoiceBlip(profile, length, onStart, onEnd) {
    this._initAudioContext();
    if (!this.audioCtx) {
      if (onEnd) onEnd();
      return;
    }

    if (onStart) onStart();
    const count = Math.min(18, Math.max(6, Math.floor(length / 4)));
    const now = this.audioCtx.currentTime;

    for (let i = 0; i < count; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const t = now + i * 0.08;

      osc.type = profile.waveType;
      // Slight randomized pitch variance for natural speech cadence
      const pitchVariance = (Math.random() - 0.5) * 35;
      osc.frequency.setValueAtTime(profile.formantFreq + pitchVariance, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.065);
    }

    setTimeout(() => {
      if (onEnd) onEnd();
    }, count * 80 + 100);
  }
}

export const voiceAi = new VoiceAiEngine();
