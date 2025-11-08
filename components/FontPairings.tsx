import React, { useEffect } from 'react';
import { FontPairing } from '../types';

interface FontPairingsProps {
  fontPairing: FontPairing;
}

const FontPairings: React.FC<FontPairingsProps> = ({ fontPairing }) => {
  useEffect(() => {
    const headerFont = fontPairing.header.replace(' ', '+');
    const bodyFont = fontPairing.body.replace(' ', '+');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${headerFont}:wght@700&family=${bodyFont}:wght@400&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [fontPairing]);

  return (
    <section>
      <h3 className="text-xl font-bold text-white mb-4">Typography</h3>
      <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
        <div className="mb-6">
          <p className="text-sm text-gray-400">Header Font: {fontPairing.header}</p>
          <h4 style={{ fontFamily: `'${fontPairing.header}', sans-serif` }} className="text-4xl font-bold text-white truncate">
            The quick brown fox jumps over the lazy dog.
          </h4>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-400">Body Font: {fontPairing.body}</p>
          <p style={{ fontFamily: `'${fontPairing.body}', sans-serif` }} className="text-base text-gray-300">
            The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-gray-200">Rationale</h5>
          <p className="text-sm text-gray-300 italic">{fontPairing.notes}</p>
        </div>
      </div>
    </section>
  );
};

export default FontPairings;