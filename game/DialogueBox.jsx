import React from 'react';
import Typewriter from './Typewriter';

export default function DialogueBox({ speaker, text, onDone, speakerColor = '#d4a056' }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
      <div 
        className="max-w-2xl mx-auto rounded-xl p-4 border-2"
        style={{ 
          background: 'rgba(20, 12, 5, 0.92)',
          borderColor: speakerColor,
          boxShadow: `0 0 20px ${speakerColor}33`
        }}
      >
        {speaker && (
          <div 
            className="font-display text-xs mb-2 px-2 py-1 rounded inline-block"
            style={{ color: speakerColor }}
          >
            {speaker}
          </div>
        )}
        <Typewriter 
          text={text} 
          onDone={onDone} 
          speed={35}
          className="text-amber-100 text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
