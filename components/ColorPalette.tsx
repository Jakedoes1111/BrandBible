import React, { useState } from 'react';
import { Color } from '../types';

interface ColorPaletteProps {
  colors: Color[];
}

const ColorCard: React.FC<{ color: Color }> = ({ color }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-700">
            <div style={{ backgroundColor: color.hex }} className="h-24 w-full"></div>
            <div className="p-3 bg-gray-900">
                <p className="font-bold text-sm text-white">{color.name}</p>
                <p className="text-xs text-gray-400">{color.usage}</p>
                <button 
                  onClick={handleCopy} 
                  className="mt-2 text-xs font-mono bg-gray-800 rounded px-2 py-1 hover:bg-gray-700 w-full text-left transition-colors"
                >
                  {copied ? 'Copied!' : color.hex}
                </button>
            </div>
        </div>
    );
};

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  return (
    <section>
      <h3 className="text-xl font-bold text-white mb-4">Color Palette</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <ColorCard key={index} color={color} />
        ))}
      </div>
    </section>
  );
};

export default ColorPalette;