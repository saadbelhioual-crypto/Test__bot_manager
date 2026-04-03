'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  logs: string[];
  onClear: () => void;
}

export default function Terminal({ logs, onClear }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal-window">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-red-500/30">
        <span className="text-red-400 font-mono text-sm">📟 TERMINAL OUTPUT</span>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          🗑 Clear
        </button>
      </div>
      <div ref={terminalRef} className="h-64 overflow-y-auto space-y-1">
        <AnimatePresence>
          {logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic"
            >
              Terminal ready. Start the bot to see logs...
            </motion.div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="terminal-line text-xs"
              >
                {log}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
          }
