import React from 'react';
import { downloadFile } from '../lib/asciiUtils';

interface ASCIIGeneratorProps {
  text: string;
  generated: string[];
}

const ASCIIGenerator: React.FC<ASCIIGeneratorProps> = ({ text, generated }) => {



  const downloadPNG = async () => {
    if (generated.length === 0) {
      alert('Please generate ASCII art first!');
      return;
    }
    
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Settings
      const fontSize = 20;
      const lineHeight = fontSize * 1.1;
      const padding = 50;
      const charWidth = fontSize * 0.6; // Monospace estimation
      
      // Calculate dimensions
      const maxLineLength = Math.max(...generated.map(line => line.length));
      canvas.width = Math.max(800, maxLineLength * charWidth + padding * 2);
      canvas.height = generated.length * lineHeight + padding * 2;
      
      // Black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configure text
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.fillStyle = '#D97757';
      ctx.textBaseline = 'top';
      
      // Draw text (left-aligned for multi-line, centered for single line)
      const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');
      
      generated.forEach((line, index) => {
        let x: number;
        if (hasMultipleTextLines) {
          // Left-align for multi-line text
          x = padding;
        } else {
          // Center for single line
          const textWidth = ctx.measureText(line).width;
          x = (canvas.width - textWidth) / 2;
        }
        const y = padding + (index * lineHeight);
        ctx.fillText(line, x, y);
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob from canvas');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cc-logo-${Date.now()}.png`;
        
        downloadFile(blob, `cc-logo-${Date.now()}.png`);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert(`Failed to generate PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  if (generated.length === 0) {
    return (
      <div className="bg-gray-900 p-6 rounded-md border-2" style={{ borderColor: '#D97757' }}>
        <p className="text-center" style={{ color: '#D97757' }}>
          Generate ASCII art first to download PNG.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-md border-2 space-y-4" style={{ borderColor: '#D97757' }}>
      <h3 className="text-xl font-bold text-center" style={{ color: '#D97757' }}>
        PNG Export
      </h3>
      
      <div className="text-center">
        <button
          onClick={downloadPNG}
          className="px-6 py-3 text-white rounded-md transition-colors font-semibold mx-auto"
          style={{ 
            backgroundColor: '#D97757',
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#D97757'}
        >
          Download PNG
        </button>
      </div>
      
    </div>
  );
};

export default ASCIIGenerator;