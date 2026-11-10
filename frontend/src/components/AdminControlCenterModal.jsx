import React, { useState, useEffect } from 'react';
import { sounds } from '../game/SoundFx';

export default function AdminControlCenterModal({
  isOpen,
  onClose,
  gameState,
  setGameState,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, events, quests, clock, economy, farming, robotics, qa, audit
  const [telemetry, setTelemetry] = useState(null);
  const [stagedEvents, setStagedEvents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [roboticsFleet, setRoboticsFleet] = useState(null);
  const [qaResults, setQaResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [clockHours, setClockHours] = useState(6);
  const [selectedSeason, setSelectedSeason] = useState('Summer');
  const [selectedWeather, setSelectedWeather] = useState('Aether Aurora');
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');
  const [economyMultiplier, setEconomyMultiplier] = useState(1.5);
  const [selectedQuestId, setSelectedQuestId] = useState('quest_rowan_beetroots');
  const [auditSearch, setAuditSearch] = useState('');

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/v1/admin/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/admin/events');
      if (res.ok) {
        const data = await res.json();
        setStagedEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load staged events:', err);
    }
  };

  const fetchAuditLogs = async (q = '') => {
    try {
      const url = q ? `/api/v1/admin/audit-logs?search=${encodeURIComponent(q)}` : '/api/v1/admin/audit-logs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const fetchRobotics = async () => {
    try {
      const res = await fetch('/api/v1/admin/robotics/diagnose');
      if (res.ok) {
        const data = await res.json();
        setRoboticsFleet(data);
      }
    } catch (err) {
      console.error('Failed to diagnose robotics:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
      fetchEvents();
      fetchAuditLogs();
      fetchRobotics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Actions
  const handleManageEvent = async (eventId, action) => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/events/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          action,
          reason: `Pengujian staging control center: aksi ${action}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🎪 ${data.message}`);
        fetchEvents();
        fetchAuditLogs();
      } else {
        showNotification && showNotification(`❌ ${data.detail || data.error || 'Aksi gagal'}`);
      }
    } catch (err) {
      console.error('Manage event error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceClock = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/world/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: Number(clockHours),
          season: selectedSeason,
          reason: `Rotasi jam dunia +${clockHours} jam (${selectedSeason})`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`⏰ ${data.message}`);
        fetchAuditLogs();
        fetchTelemetry();
      }
    } catch (err) {
      console.error('Clock error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetWeather = async (weather) => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/world/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather,
          reason: `Manipulasi visual cuaca ke ${weather}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🌦️ ${data.message}`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Weather error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateEconomy = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/economy/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          multiplier: Number(economyMultiplier),
          reason: `Simulasi lonjakan harga komoditas ${selectedCommodity} (${economyMultiplier}x)`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`📈 ${data.message}`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Economy error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoostCrops = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/farming/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Farming Lab: Pematangan instan seluruh petak tanaman' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🌱 ${data.message}`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Boost crops error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQuest = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/quests/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quest_id: selectedQuestId,
          objective_idx: 1,
          reason: `Pengujian simulasi objektif misi ${selectedQuestId}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        showNotification && showNotification(`🗺️ ${data.message}`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Quest error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQA = async () => {
    sounds.playClick();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite_name: 'V6 Full Master Automated Suite' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playSuccess();
        setQaResults(data);
        showNotification && showNotification(`🧪 Suite QA selesai: ${data.passed}/${data.total_tests} Lulus (${data.duration_ms} ms)!`);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('QA error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'telemetry', label: 'Telemetri', icon: '⚡' },
    { id: 'events', label: 'Event Staging', icon: '🎪' },
    { id: 'quests', label: 'Quest Lab', icon: '🗺️' },
    { id: 'clock', label: 'Waktu & Cuaca', icon: '🌦️' },
    { id: 'economy', label: 'Ekonomi Lab', icon: '📈' },
    { id: 'farming', label: 'Farming Lab', icon: '🌱' },
    { id: 'robotics', label: 'Robotika Lab', icon: '🤖' },
    { id: 'qa', label: 'Otomatisasi QA', icon: '🧪' },
    { id: 'audit', label: 'Audit Trail', icon: '📜' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-red-500/60 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border-b border-red-500/40">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-pulse">⚙️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-red-300 font-serif tracking-wide flex items-center gap-2">
                Evergreen Control Center — Admin Dashboard (V6)
                <span className="text-xs bg-red-500/20 border border-red-400 text-red-300 font-mono px-2 py-0.5 rounded-full">
                  RBAC Super Administrator
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Pusat pengujian, simulasi parameter, telemetri, dan audit trail seluruh sistem game.
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-red-500/80 text-stone-300 hover:text-white border border-stone-700 transition"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 py-2 bg-slate-950/90 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { sounds.playClick(); setActiveTab(t.id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-red-600 text-white shadow ring-1 ring-red-400'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB PANELS */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60">
          
          {/* TAB 1: TELEMETRY */}
          {activeTab === 'telemetry' && telemetry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/80 border border-emerald-500/40 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Status Server</div>
                  <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">{telemetry.server_status}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-1">Uptime: {Math.round(telemetry.uptime_seconds / 3600)} Jam</div>
                </div>

                <div className="p-3 bg-slate-800/80 border border-blue-500/40 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Tick Rate & Latensi</div>
                  <div className="text-lg font-black font-mono text-blue-400 mt-0.5">{telemetry.tick_rate} TPS</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">Latensi: {telemetry.tick_latency_ms} ms</div>
                </div>

                <div className="p-3 bg-slate-800/80 border border-purple-500/40 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Penggunaan RAM</div>
                  <div className="text-lg font-black font-mono text-purple-400 mt-0.5">{telemetry.memory_usage_mb} MB</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">Koneksi: {telemetry.active_connections} Aktif</div>
                </div>

                <div className="p-3 bg-slate-800/80 border border-amber-500/40 rounded-xl">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Simulasi Entitas</div>
                  <div className="text-lg font-black font-mono text-amber-400 mt-0.5">
                    {Object.values(telemetry.active_entities).reduce((a, b) => a + b, 0)} Total
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">Tanaman: {telemetry.active_entities.crops_simulated}</div>
                </div>
              </div>

              {/* Entity Breakdown */}
              <div className="p-4 bg-slate-950/80 border border-stone-800 rounded-xl">
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3">
                  Distribusi Entitas di Dunia Nyata
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Tanaman Aktif:</span>
                    <span className="font-mono font-bold text-emerald-400">{telemetry.active_entities.crops_simulated} petak</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">NPC Hidup:</span>
                    <span className="font-mono font-bold text-amber-400">{telemetry.active_entities.npcs_active} warga</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Robot Patroli:</span>
                    <span className="font-mono font-bold text-cyan-400">{telemetry.active_entities.robots_working} unit</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Ternak Padang:</span>
                    <span className="font-mono font-bold text-rose-400">{telemetry.active_entities.animals_grazing} ekor</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Portal Aether:</span>
                    <span className="font-mono font-bold text-purple-400">{telemetry.active_entities.portals_open} gerbang</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-stone-800 rounded-xl text-xs text-stone-400 flex items-center justify-between">
                <span>Database Engine: <strong className="text-stone-200">{telemetry.db_engine}</strong></span>
                <button
                  onClick={() => { sounds.playClick(); fetchTelemetry(); }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-stone-200 rounded font-bold"
                >
                  Segarkan Telemetri
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EVENT STAGING */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-300">
                Lingkungan isolasi staging untuk menguji festival dan event musiman tanpa memengaruhi jadwal production live.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stagedEvents.map((ev) => (
                  <div key={ev.id} className="p-4 bg-slate-800/80 border border-stone-700 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ev.status === 'running'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                            : 'bg-stone-700 text-stone-300'
                        }`}>
                          {ev.status}
                        </span>
                        <span className="text-xs font-mono text-stone-400">
                          Tahap {ev.stage}/{ev.max_stages}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-100">{ev.name}</h4>
                      <p className="text-[11px] text-stone-400 mt-1">
                        NPC Terlibat: {ev.npcs_involved?.join(', ')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-700/60 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          disabled={loading || ev.status === 'running'}
                          onClick={() => handleManageEvent(ev.id, 'start')}
                          className="py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded text-xs font-bold"
                        >
                          Mulai
                        </button>
                        <button
                          disabled={loading || ev.status !== 'running'}
                          onClick={() => handleManageEvent(ev.id, 'advance_stage')}
                          className="py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white rounded text-xs font-bold"
                        >
                          Lanjut Tahap
                        </button>
                      </div>
                      <button
                        disabled={loading}
                        onClick={() => handleManageEvent(ev.id, 'reset')}
                        className="w-full py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded text-xs font-semibold"
                      >
                        Reset Staging
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUEST LAB */}
          {activeTab === 'quests' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-300">
                Simulasi pemenuhan objektif misi, evaluasi payload hadiah, dan pemeriksaan siklus ketergantungan (cycle detection).
              </div>

              <div className="p-4 bg-slate-800/80 border border-stone-700 rounded-xl space-y-3 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Pilih Misi untuk Diuji:</label>
                  <select
                    value={selectedQuestId}
                    onChange={(e) => setSelectedQuestId(e.target.value)}
                    className="w-full bg-slate-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="quest_rowan_beetroots">quest_rowan_beetroots — Pengiriman Bit Merah Rowan</option>
                    <option value="quest_elara_beetroots">quest_elara_beetroots — Bahan Herbal Elara</option>
                    <option value="quest_mira_friendship">quest_mira_friendship — Having Friends with Us!</option>
                    <option value="qst_01">qst_01 — Warisan Tanah Hijau</option>
                    <option value="qst_02">qst_02 — Menembus Gua Tambang</option>
                  </select>
                </div>

                <button
                  disabled={loading}
                  onClick={handleSimulateQuest}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow"
                >
                  Jalankan Simulasi Objektif & Cek Konflik
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TIME & WEATHER */}
          {activeTab === 'clock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Controller */}
                <div className="p-4 bg-slate-800/80 border border-stone-700 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⏰</span> Pengatur Waktu Dunia
                  </h4>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Majukan Waktu (Jam):</label>
                    <div className="flex gap-2">
                      {[1, 6, 12, 24].map((h) => (
                        <button
                          key={h}
                          onClick={() => setClockHours(h)}
                          className={`flex-1 py-1 rounded text-xs font-mono font-bold ${
                            clockHours === h ? 'bg-amber-600 text-white' : 'bg-slate-900 text-stone-400'
                          }`}
                        >
                          +{h} Jam
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Ganti Musim:</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="w-full bg-slate-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200"
                    >
                      <option value="Spring">Musim Semi (Spring)</option>
                      <option value="Summer">Musim Panas (Summer)</option>
                      <option value="Fall">Musim Gugur (Fall)</option>
                      <option value="Winter">Musim Dingin (Winter)</option>
                    </select>
                  </div>

                  <button
                    disabled={loading}
                    onClick={handleAdvanceClock}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Terapkan Perubahan Waktu
                  </button>
                </div>

                {/* Weather Controller */}
                <div className="p-4 bg-slate-800/80 border border-stone-700 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌦️</span> Pengubah Cuaca Instan
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Sunny', label: 'Cerah Berawan', icon: '☀️' },
                      { id: 'Rain', label: 'Hujan Subur', icon: '🌧️' },
                      { id: 'Storm', label: 'Badai Petir', icon: '⛈️' },
                      { id: 'Aether Aurora', label: 'Aurora Aether', icon: '🌌' },
                      { id: 'Snow', label: 'Salju Dingin', icon: '❄️' },
                      { id: 'Cosmic Mist', label: 'Kabut Kosmik', icon: '🌫️' }
                    ].map((w) => (
                      <button
                        key={w.id}
                        disabled={loading}
                        onClick={() => handleSetWeather(w.id)}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-stone-700 rounded-lg text-left text-xs font-semibold flex items-center gap-2 transition"
                      >
                        <span className="text-xl">{w.icon}</span>
                        <span>{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ECONOMY LAB */}
          {activeTab === 'economy' && (
            <div className="space-y-4 max-w-lg">
              <div className="text-xs text-stone-300">
                Simulasi guncangan harga pasar dan pengujian kepekaan inflasi komoditas perdagangan.
              </div>

              <div className="p-4 bg-slate-800/80 border border-stone-700 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1">Pilih Komoditas:</label>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full bg-slate-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200"
                  >
                    <option value="wheat">Gandum Emas (wheat)</option>
                    <option value="corn">Jagung Manis (corn)</option>
                    <option value="copper">Bijih Tembaga (copper)</option>
                    <option value="mythril">Bijih Mythril (mythril)</option>
                    <option value="crystal_apple">Apel Kristal (crystal_apple)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1">
                    Faktor Pengali Harga ({economyMultiplier}x):
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={economyMultiplier}
                    onChange={(e) => setEconomyMultiplier(e.target.value)}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>0.5x (Deflasi)</span>
                    <span>1.0x (Normal)</span>
                    <span>3.0x (Lonjakan)</span>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handleSimulateEconomy}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Terapkan Fluktuasi Pasar
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: FARMING LAB */}
          {activeTab === 'farming' && (
            <div className="space-y-4 max-w-lg">
              <div className="p-4 bg-slate-800/80 border border-emerald-500/40 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌱</span> Farming Lab — Pematangan Instan
                </h4>
                <p className="text-xs text-stone-300">
                  Ubah seluruh petak tanaman yang tertanam di grid pertanian menjadi tahap matang (Stage 4) dan siram secara instan untuk pengujian pemanenan massal dan giant crop.
                </p>
                <button
                  disabled={loading}
                  onClick={handleBoostCrops}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow ring-1 ring-emerald-400"
                >
                  ⚡ Matangkan Seluruh Tanaman Sekarang
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: ROBOTICS LAB */}
          {activeTab === 'robotics' && roboticsFleet && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/80 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-300">Stasiun Pengisian Daya:</span>
                <span className="font-mono text-emerald-400 font-bold">{roboticsFleet.charging_station_status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roboticsFleet.fleet?.map((r) => (
                  <div key={r.id} className="p-3.5 bg-slate-800/80 border border-stone-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-100">{r.name}</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400 px-1.5 py-0.5 rounded font-mono">
                        {r.model}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Baterai:</span>
                        <span className="font-mono font-bold text-emerald-400">{r.battery_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-stone-800">
                        <div className="bg-emerald-500 h-full" style={{ width: `${r.battery_pct}%` }} />
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400">
                      Status: <span className="text-amber-300 font-semibold">{r.status}</span>
                    </div>

                    <div className="text-[10px] text-stone-500 font-mono">
                      Antrean Tugas: {r.job_queue?.length ? r.job_queue.join(', ') : 'Tidak ada'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: AUTOMATED QA SUITE */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-200">QA Automation Runner</h4>
                  <p className="text-xs text-stone-400">Jalankan unit dan integration tests live di server game.</p>
                </div>
                <button
                  disabled={loading}
                  onClick={handleRunQA}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow ring-1 ring-red-400"
                >
                  🧪 Jalankan Master Suite QA
                </button>
              </div>

              {qaResults && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Lulus</div>
                      <div className="text-xl font-black font-mono text-emerald-300">{qaResults.passed}</div>
                    </div>
                    <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-center">
                      <div className="text-[10px] text-red-400 uppercase font-bold">Gagal</div>
                      <div className="text-xl font-black font-mono text-red-300">{qaResults.failed}</div>
                    </div>
                    <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl text-center">
                      <div className="text-[10px] text-blue-400 uppercase font-bold">Durasi Uji</div>
                      <div className="text-xl font-black font-mono text-blue-300">{qaResults.duration_ms} ms</div>
                    </div>
                  </div>

                  {/* AI QA Analysis Card */}
                  {qaResults.ai_qa_analysis && (
                    <div className="p-4 bg-slate-950/80 border border-stone-800 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-stone-200 flex items-center gap-2">
                        <span>🤖 Analisis Otomatis AI QA:</span>
                        <span className="text-emerald-400 font-mono">{qaResults.ai_qa_analysis.health_grade}</span>
                      </div>
                      <p className="text-stone-400">{qaResults.ai_qa_analysis.risk_assessment}</p>
                      <p className="text-amber-300 font-serif italic mt-1">{qaResults.ai_qa_analysis.recommendation}</p>
                    </div>
                  )}

                  {/* Test Cases Table */}
                  <div className="bg-slate-950/60 border border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-800 text-xs">
                    {qaResults.results?.map((t, idx) => (
                      <div key={idx} className="px-4 py-2 flex items-center justify-between">
                        <span className="text-stone-200 font-medium">{t.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-stone-400 text-[11px]">{t.duration_ms} ms</span>
                          <span className="font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-1.5 py-0.5 rounded">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari audit trail (aksi, admin, target, alasan)..."
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value);
                    fetchAuditLogs(e.target.value);
                  }}
                  className="flex-1 bg-slate-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500"
                />
                <button
                  onClick={() => fetchAuditLogs(auditSearch)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-lg text-stone-200"
                >
                  Cari
                </button>
              </div>

              <div className="bg-slate-950/80 border border-stone-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-stone-800 text-xs font-mono">
                {auditLogs.map((log) => (
                  <div key={log.log_id} className="p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">[{log.action}]</span>
                      <span className="text-stone-500 text-[10px]">{log.timestamp}</span>
                    </div>
                    <div className="text-stone-300 text-[11px]">
                      Admin: <strong className="text-stone-100">{log.admin_name}</strong> ({log.role}) • Target: <strong className="text-cyan-300">{log.target}</strong>
                    </div>
                    <div className="text-[10px] text-stone-400 italic">
                      Alasan: {log.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Akses administrator terlindungi otorisasi server-authoritative RBAC.</span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-bold border border-stone-600 transition"
          >
            Tutup Panel Admin [ESC]
          </button>
        </div>

      </div>
    </div>
  );
}
