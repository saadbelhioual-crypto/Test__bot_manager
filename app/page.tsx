'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Terminal from './components/Terminal';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [guestId, setGuestId] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const ADMIN_PASSWORD = 'admin123'; // Change this to your desired password

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      addLog('✅ User logged in successfully');
    } else {
      alert('Invalid password!');
    }
  };

  const handleStartBot = async () => {
    if (!guestId || !guestPassword) {
      alert('Please enter Guest ID and Password');
      return;
    }

    setIsBotRunning(true);
    addLog('🚀 Starting bot...');
    addLog(`📝 Using Guest ID: ${guestId}`);

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          guest_id: guestId,
          guest_password: guestPassword
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Bot started successfully!');
        // Connect to SSE for real-time logs
        connectToLogStream();
      } else {
        addLog(`❌ Failed to start bot: ${data.error}`);
        setIsBotRunning(false);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      setIsBotRunning(false);
    }
  };

  const connectToLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/bot?stream=logs');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const log = event.data;
      addLog(log);
    };

    eventSource.onerror = () => {
      console.log('SSE connection closed');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  };

  const handleStopBot = async () => {
    addLog('🛑 Stopping bot...');
    
    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Bot stopped successfully');
      } else {
        addLog(`❌ Failed to stop bot: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
    
    setIsBotRunning(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/ambient.mp3');
      audioRef.current.loop = true;
    }
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      addLog('🔇 Music paused');
    } else {
      audioRef.current.play();
      addLog('🎵 Music playing');
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const clearTerminal = () => {
    setLogs([]);
    addLog('🧹 Terminal cleared');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
            Bot Manager Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary btn-start w-full"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
            Free Fire Bot Manager
          </h1>
          <p className="text-white/60 text-sm mt-1">Professional Bot Control Panel</p>
        </motion.div>

        {/* Main Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Credentials Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-red-400">Bot Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-white/70">GUEST ID</label>
                <input
                  type="text"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder="Enter Guest ID"
                  className="input-field"
                  disabled={isBotRunning}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-white/70">GUEST PASSWORD</label>
                <input
                  type="password"
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  placeholder="Enter Guest Password"
                  className="input-field"
                  disabled={isBotRunning}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStartBot}
                  disabled={isBotRunning}
                  className="btn-primary btn-start flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ▶ Start Bot
                </button>
                <button
                  onClick={handleStopBot}
                  disabled={!isBotRunning}
                  className="btn-primary btn-stop flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏹ Stop Bot
                </button>
              </div>
            </div>
          </motion.div>

          {/* Music Control */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 flex flex-col justify-center items-center"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Ambience</h2>
            <button
              onClick={toggleMusic}
              className={`w-32 h-32 rounded-full text-4xl transition-all duration-300 ${
                isMusicPlaying 
                  ? 'bg-gradient-to-br from-red-500 to-blue-500 shadow-lg shadow-red-500/50 scale-110' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {isMusicPlaying ? '🎵' : '🎧'}
            </button>
            <p className="mt-4 text-sm text-white/60">
              {isMusicPlaying ? 'Music is playing' : 'Click to play background music'}
            </p>
          </motion.div>
        </div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <Terminal logs={logs} onClear={clearTerminal} />
        </motion.div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-white/60">Bot Status: {isBotRunning ? 'Running' : 'Stopped'}</span>
        </div>
      </div>
    </div>
  );
}
