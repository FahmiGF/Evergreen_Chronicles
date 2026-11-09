// Multiplayer WebSocket Client Manager for Evergreen Chronicles

class MultiplayerClient {
  constructor() {
    this.ws = null;
    this.selfId = null;
    this.connected = false;
    this.pingMs = 5;
    this.remotePlayers = new Map(); // client_id -> { id, name, color, x, y, targetX, targetY, direction, is_moving, action, chat_message, chat_timer }
    this.npcs = new Map(); // npc_id -> { id, name, title, x, y, direction, is_walking, avatar }
    this.listeners = new Set();
    this.lastSentPos = { x: 0, y: 0, dir: 'down', moving: false };
    this.throttleTimer = 0;
  }

  connect(playerName = 'Fahmi', playerColor = '#3b82f6') {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // Encode color safely
    const cleanColor = encodeURIComponent(playerColor);
    const cleanName = encodeURIComponent(playerName);
    const wsUrl = `${protocol}//${host}/ws/world/main?name=${cleanName}&color=${cleanColor}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this._startPingInterval();
        this._notify({ type: 'connection_status', connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this._notify({ type: 'connection_status', connected: false });
        // Auto-reconnect after 3 seconds
        setTimeout(() => this.connect(playerName, playerColor), 3000);
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    } catch (e) {
      console.warn('Multiplayer connection attempt failed', e);
    }
  }

  _startPingInterval() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          client_time: Date.now()
        }));
      }
    }, 4000);
  }

  _handleMessage(data) {
    switch (data.type) {
      case 'init_roster':
        this.selfId = data.self_id;
        this.remotePlayers.clear();
        (data.players || []).forEach((p) => {
          if (p.id !== this.selfId) {
            this.remotePlayers.set(p.id, {
              ...p,
              targetX: p.x,
              targetY: p.y
            });
          }
        });
        this._notify({ type: 'roster_update', players: Array.from(this.remotePlayers.values()) });
        break;

      case 'player_joined':
        if (data.player && data.player.id !== this.selfId) {
          this.remotePlayers.set(data.player.id, {
            ...data.player,
            targetX: data.player.x,
            targetY: data.player.y
          });
          this._notify({ type: 'player_joined', player: data.player });
          this._notify({ type: 'roster_update', players: Array.from(this.remotePlayers.values()) });
        }
        break;

      case 'player_left':
        this.remotePlayers.delete(data.client_id);
        this._notify({ type: 'player_left', client_id: data.client_id, name: data.name });
        this._notify({ type: 'roster_update', players: Array.from(this.remotePlayers.values()) });
        break;

      case 'player_moved':
        if (data.player && data.player.id !== this.selfId) {
          const existing = this.remotePlayers.get(data.player.id);
          if (existing) {
            existing.targetX = data.player.x;
            existing.targetY = data.player.y;
            existing.direction = data.player.direction;
            existing.is_moving = data.player.is_moving;
            existing.action = data.player.action;
          } else {
            this.remotePlayers.set(data.player.id, {
              ...data.player,
              targetX: data.player.x,
              targetY: data.player.y
            });
          }
        }
        break;

      case 'chat_message':
        // Attach chat bubble to player
        if (data.sender_id) {
          const p = this.remotePlayers.get(data.sender_id);
          if (p) {
            p.chat_message = data.message;
            p.chat_timer = 5.0;
          }
        }
        this._notify({ type: 'chat_message', message: data });
        break;

      case 'world_action_sync':
        this._notify({ type: 'world_action_sync', action: data });
        break;

      case 'npc_sync':
        (data.npcs || []).forEach((npc) => {
          this.npcs.set(npc.id, npc);
        });
        break;

      case 'pong':
        if (data.client_time) {
          this.pingMs = Math.max(1, Math.round(Date.now() - data.client_time));
          this._notify({ type: 'ping_update', ping: this.pingMs });
        }
        break;

      default:
        break;
    }
  }

  sendMovement(x, y, direction, isMoving, action = null) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Throttle checks
    const dx = Math.abs(x - this.lastSentPos.x);
    const dy = Math.abs(y - this.lastSentPos.y);
    const dirChanged = direction !== this.lastSentPos.dir;
    const moveChanged = isMoving !== this.lastSentPos.moving;

    const now = performance.now();
    if (now - this.throttleTimer < 35 && !dirChanged && !moveChanged && dx < 2 && dy < 2) {
      return;
    }

    this.throttleTimer = now;
    this.lastSentPos = { x, y, dir: direction, moving: isMoving };

    this.ws.send(JSON.stringify({
      type: 'move',
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      direction,
      is_moving: isMoving,
      action
    }));
  }

  sendWorldAction(actionType, x, y, details = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'world_action',
      action_type: actionType,
      x,
      y,
      details
    }));
  }

  sendChat(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'chat',
      message
    }));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify(event) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const multiplayer = new MultiplayerClient();
