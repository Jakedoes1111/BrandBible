import React from 'react';
import { GeneratedImages } from '../types';

interface LogoDisplayProps {
  generatedImages: GeneratedImages;
}

const ImageCard: React.FC<{ src: string; title: string; isPrimary?: boolean }> = ({ src, title, isPrimary = false }) => (
    <div className="bg-black/20 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
        <img src={src} alt={title} className={`object-contain ${isPrimary ? 'max-h-40' : 'max-h-24'}`} />
        <p className="mt-4 text-sm font-medium text-gray-300">{title}</p>
    </div>
);

const LogoDisplay: React.FC<LogoDisplayProps> = ({ generatedImages }) => {
  return (
    <section>
      <h3 className="text-xl font-bold text-white mb-4">Logos & Marks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-3">
          <ImageCard src={generatedImages.primaryLogoUrl} title="Primary Logo" isPrimary />
        </div>
        {generatedImages.secondaryMarkUrls.map((url, index) => (
          <ImageCard key={index} src={url} title={`Secondary Mark ${index + 1}`} />
        ))}
      </div>
    </section>
  );
};

export default LogoDisplay;