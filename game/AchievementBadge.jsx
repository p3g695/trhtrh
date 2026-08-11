import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';

export default function AchievementBadge({ title, subtitle, icon: Icon = Award, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed top-20 right-4 z-50 flex items-start gap-3 p-4 rounded-xl max-w-xs"
          style={{
            background: 'linear-gradient(135deg, rgba(20,12,5,0.95), rgba(40,20,8,0.95))',
            border: '2px solid #DAA520',
            boxShadow: '0 0 30px rgba(218,165,32,0.3)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Icon size={20} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs text-amber-300 mb-1">ACHIEVEMENT UNLOCKED</p>
            <p className="text-amber-100 text-sm font-semibold">{title}</p>
            <p className="text-amber-400/60 text-xs mt-0.5">{subtitle}</p>
          </div>
          <button onClick={() => { setVisible(false); onDismiss?.(); }} className="text-amber-500/60 hover:text-amber-300">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
