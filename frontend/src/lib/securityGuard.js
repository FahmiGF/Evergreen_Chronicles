/**
 * EVERGREEN CHRONICLES — CLIENT-SIDE ANTI-HACK & INTEGRITY GUARD (V7.0)
 * Defensive capabilities:
 * 1. Runtime memory tampering & sanity checks (NaN, Infinity, Negative bounds detection)
 * 2. Immutable deep-freeze for static catalogs (Prototype pollution prevention)
 * 3. Client-side input sanitization before API dispatch
 * 4. Real-time security anomaly event emitter
 */

export class SecurityGuard {
  static MAX_GOLD = 999999999;
  static MAX_LEVEL = 100;
  static MAX_STAT = 2000;

  /**
   * Deep freezes objects to prevent runtime property hijacking and prototype pollution.
   */
  static deepFreeze(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (
        obj[prop] !== null &&
        (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
        !Object.isFrozen(obj[prop])
      ) {
        SecurityGuard.deepFreeze(obj[prop]);
      }
    });
    return obj;
  }

  /**
   * Validates client-side player state for memory injection or console tampering.
   */
  static validatePlayerState(player) {
    if (!player || typeof player !== 'object') {
      this.emitSecurityAlert('CORRUPTED_PLAYER_OBJECT', 'Player state is not a valid object.');
      return false;
    }

    // 1. Gold validation
    const gold = player.gold;
    if (typeof gold !== 'number' || isNaN(gold) || !isFinite(gold) || gold < 0 || gold > this.MAX_GOLD) {
      this.emitSecurityAlert('GOLD_TAMPER_DETECTED', `Illegal gold manipulation detected: ${gold}`);
      return false;
    }

    // 2. Health & Energy validation
    const health = player.health ?? 100;
    const energy = player.energy ?? 100;
    if (isNaN(health) || health < 0 || health > this.MAX_STAT || isNaN(energy) || energy < 0 || energy > this.MAX_STAT) {
      this.emitSecurityAlert('STAT_ANOMALY_DETECTED', `Health/Energy out of bounds: H=${health}, E=${energy}`);
      return false;
    }

    // 3. Inventory dupe validation
    if (Array.isArray(player.inventory)) {
      for (const item of player.inventory) {
        if (item && (typeof item.count !== 'number' || item.count < 0 || item.count > 999)) {
          this.emitSecurityAlert('ITEM_DUPLICATION_ATTEMPT', `Illegal item count detected: ${item.count}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Sanitizes text input on client before sending to server.
   */
  static sanitizeInput(str, maxLength = 80) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/\x00/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/["'<>]/g, (match) => {
        const escapeMap = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
        return escapeMap[match] || match;
      })
      .trim()
      .substring(0, maxLength);
  }

  /**
   * Emits a security alert to the application window.
   */
  static emitSecurityAlert(type, message) {
    console.warn(`[🛡️ Evergreen Shield Security Warning]: ${type} — ${message}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('evergreen:security_alert', {
          detail: { type, message, timestamp: new Date().toISOString() }
        })
      );
    }
  }
}
