import React, { useState, useEffect, useRef } from 'react';
import { multiplayer } from '../game/MultiplayerManager';
import { sounds } from '../game/SoundFx';

export default function OnlineChat({ playerName, onSelfChat }) {
  const [messages, setMessages] = useState([
    {
      sender_name: 'Sistem Desa',
      sender_color: '#4ade80',
      message: 'Selamat datang di Aetherwyn Online! Tekan [Enter] untuk mengobrol.',
      timestamp: '06:00'
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsub = multiplayer.subscribe((event) => {
      if (event.type === 'chat_message') {
        setMessages((prev) => [...prev.slice(-30), event.message]);
        sounds.playClick();
      } else if (event.type === 'player_joined') {
        setMessages((prev) => [
          ...prev.slice(-30),
          {
            sender_name: '🌐 Server',
            sender_color: '#38bdf8',
            message: `${event.player.name} telah bergabung ke Aetherwyn!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (event.type === 'player_left') {
        setMessages((prev) => [
          ...prev.slice(-30),
          {
            sender_name: '🌐 Server',
            sender_color: '#94a3b8',
            message: `${event.name || 'Pemain'} telah keluar dari desa.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Global Enter Key to Toggle Chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Enter') {
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) {
      setIsOpen(false);
      return;
    }

    multiplayer.sendChat(text);
    if (onSelfChat) onSelfChat(text);

    // Add local copy immediately
    setMessages((prev) => [
      ...prev.slice(-30),
      {
        sender_name: playerName || 'Kamu',
        sender_color: '#fbbf24',
        message: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 left-4 z-30 flex flex-col w-72 sm:w-80 select-none pointer-events-auto">
      {/* Chat Messages Log */}
      <div className="bg-stone-950/80 backdrop-blur-md border border-stone-800 rounded-xl p-2.5 max-h-40 overflow-y-auto space-y-1.5 shadow-xl text-xs font-sans">
        {messages.map((msg, i) => (
          <div key={i} className="leading-snug break-words">
            <span className="text-[10px] text-stone-500 font-mono mr-1.5">[{msg.timestamp}]</span>
            <span className="font-bold mr-1.5" style={{ color: msg.sender_color || '#38bdf8' }}>
              {msg.sender_name}:
            </span>
            <span className="text-stone-200">{msg.message}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      {isOpen ? (
        <form onSubmit={handleSendMessage} className="mt-1 flex items-center space-x-1.5 animate-fadeIn">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
              if (!inputValue) setIsOpen(false);
            }}
            placeholder="Ketik pesan chat lalu tekan Enter..."
            maxLength={100}
            className="flex-1 bg-stone-900 border-2 border-amber-500 text-stone-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none shadow-lg placeholder:text-stone-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            Kirim
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="mt-1 self-start bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[11px] px-2.5 py-1 rounded-md border border-stone-800 transition flex items-center space-x-1"
        >
          <span>💬</span>
          <span>Bicara [Enter]</span>
        </button>
      )}
    </div>
  );
}
