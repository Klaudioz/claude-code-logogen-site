import React, { useState } from 'react';

const ASCIIGenerator = () => {
  const [text, setText] = useState('CLAUDE\\nCODE');
  const [generated, setGenerated] = useState<string[]>([]);

  // Claude Code logo font using box-drawing characters - 6 lines height
  const asciiFont: Record<string, string[]> = {
    'A': [
      '  █████╗ ',
      ' ██╔══██╗',
      ' ███████║',
      ' ██╔══██║',
      ' ██║  ██║',
      ' ╚═╝  ╚═╝'
    ],
    'B': [
      '██████╗ ',
      '██╔══██╗',
      '██████╔╝',
      '██╔══██╗',
      '██████╔╝',
      '╚═════╝ '
    ],
    'C': [
      ' ██████╗',
      '██╔════╝',
      '██║     ',
      '██║     ',
      '╚██████╗',
      ' ╚═════╝'
    ],
    'D': [
      '██████╗ ',
      '██╔══██╗',
      '██║  ██║',
      '██║  ██║',
      '██████╔╝',
      '╚═════╝ '
    ],
    'E': [
      '███████╗',
      '██╔════╝',
      '█████╗  ',
      '██╔══╝  ',
      '███████╗',
      '╚══════╝'
    ],
    'F': [
      '███████╗',
      '██╔════╝',
      '█████╗  ',
      '██╔══╝  ',
      '██║     ',
      '╚═╝     '
    ],
    'G': [
      ' ██████╗ ',
      '██╔════╝ ',
      '██║  ███╗',
      '██║   ██║',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    'H': [
      '██╗  ██╗',
      '██║  ██║',
      '███████║',
      '██╔══██║',
      '██║  ██║',
      '╚═╝  ╚═╝'
    ],
    'I': [
      '██╗',
      '██║',
      '██║',
      '██║',
      '██║',
      '╚═╝'
    ],
    'J': [
      '     ██╗',
      '     ██║',
      '     ██║',
      '██   ██║',
      '╚█████╔╝',
      ' ╚════╝ '
    ],
    'K': [
      '██╗  ██╗',
      '██║ ██╔╝',
      '█████╔╝ ',
      '██╔═██╗ ',
      '██║  ██╗',
      '╚═╝  ╚═╝'
    ],
    'L': [
      '██╗     ',
      '██║     ',
      '██║     ',
      '██║     ',
      '███████╗',
      '╚══════╝'
    ],
    'M': [
      '███╗   ███╗',
      '████╗ ████║',
      '██╔████╔██║',
      '██║╚██╔╝██║',
      '██║ ╚═╝ ██║',
      '╚═╝     ╚═╝'
    ],
    'N': [
      '███╗   ██╗',
      '████╗  ██║',
      '██╔██╗ ██║',
      '██║╚██╗██║',
      '██║ ╚████║',
      '╚═╝  ╚═══╝'
    ],
    'O': [
      ' ██████╗ ',
      '██╔═══██╗',
      '██║   ██║',
      '██║   ██║',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    'P': [
      '██████╗ ',
      '██╔══██╗',
      '██████╔╝',
      '██╔═══╝ ',
      '██║     ',
      '╚═╝     '
    ],
    'Q': [
      ' ██████╗ ',
      '██╔═══██╗',
      '██║   ██║',
      '██║▄▄ ██║',
      '╚██████╔╝',
      ' ╚══▀▀═╝ '
    ],
    'R': [
      '██████╗ ',
      '██╔══██╗',
      '██████╔╝',
      '██╔══██╗',
      '██║  ██║',
      '╚═╝  ╚═╝'
    ],
    'S': [
      '███████╗',
      '██╔════╝',
      '███████╗',
      '╚════██║',
      '███████║',
      '╚══════╝'
    ],
    'T': [
      '████████╗',
      '╚══██╔══╝',
      '   ██║   ',
      '   ██║   ',
      '   ██║   ',
      '   ╚═╝   '
    ],
    'U': [
      '██╗   ██╗',
      '██║   ██║',
      '██║   ██║',
      '██║   ██║',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    'V': [
      '██╗   ██╗',
      '██║   ██║',
      '██║   ██║',
      '╚██╗ ██╔╝',
      ' ╚████╔╝ ',
      '  ╚═══╝  '
    ],
    'W': [
      '██╗    ██╗',
      '██║    ██║',
      '██║ █╗ ██║',
      '██║███╗██║',
      '╚███╔███╔╝',
      ' ╚══╝╚══╝ '
    ],
    'X': [
      '██╗  ██╗',
      '╚██╗██╔╝',
      ' ╚███╔╝ ',
      ' ██╔██╗ ',
      '██╔╝ ██╗',
      '╚═╝  ╚═╝'
    ],
    'Y': [
      '██╗   ██╗',
      '╚██╗ ██╔╝',
      ' ╚████╔╝ ',
      '  ╚██╔╝  ',
      '   ██║   ',
      '   ╚═╝   '
    ],
    'Z': [
      '███████╗',
      '╚══███╔╝',
      '  ███╔╝ ',
      ' ███╔╝  ',
      '███████╗',
      '╚══════╝'
    ],
    ' ': [
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    '
    ],
    '0': [
      ' ██████╗ ',
      '██╔═████╗',
      '██║██╔██║',
      '████╔╝██║',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    '1': [
      ' ██╗',
      '███║',
      '╚██║',
      ' ██║',
      ' ██║',
      ' ╚═╝'
    ],
    '2': [
      '██████╗ ',
      '╚════██╗',
      ' █████╔╝',
      '██╔═══╝ ',
      '███████╗',
      '╚══════╝'
    ],
    '3': [
      '██████╗ ',
      '╚════██╗',
      ' █████╔╝',
      ' ╚═══██╗',
      '██████╔╝',
      '╚═════╝ '
    ],
    '4': [
      '██╗  ██╗',
      '██║  ██║',
      '███████║',
      '╚════██║',
      '     ██║',
      '     ╚═╝'
    ],
    '5': [
      '███████╗',
      '██╔════╝',
      '███████╗',
      '╚════██║',
      '███████║',
      '╚══════╝'
    ],
    '6': [
      ' ██████╗ ',
      '██╔════╝ ',
      '███████╗ ',
      '██╔═══██╗',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    '7': [
      '███████╗',
      '╚════██║',
      '    ██╔╝',
      '   ██╔╝ ',
      '   ██║  ',
      '   ╚═╝  '
    ],
    '8': [
      ' █████╗ ',
      '██╔══██╗',
      '╚█████╔╝',
      '██╔══██╗',
      '╚█████╔╝',
      ' ╚════╝ '
    ],
    '9': [
      ' █████╗ ',
      '██╔══██╗',
      '╚██████║',
      ' ╚═══██║',
      ' █████╔╝',
      ' ╚════╝ '
    ],
    '!': [
      '██╗',
      '██║',
      '██║',
      '╚═╝',
      '██╗',
      '╚═╝'
    ],
    '@': [
      ' ██████╗ ',
      '██╔═══██╗',
      '██║██╗██║',
      '██║██║██║',
      '╚██████╔╝',
      ' ╚═════╝ '
    ],
    '#': [
      ' ██╗ ██╗ ',
      '███████╗ ',
      ' ██╗ ██╗ ',
      '███████╗ ',
      ' ██╗ ██╗ ',
      ' ╚═╝ ╚═╝ '
    ],
    '$': [
      ' ██████╗ ',
      '██╔════╝ ',
      '███████╗ ',
      '╚════██║ ',
      '██████╔╝ ',
      '╚═════╝  '
    ],
    '%': [
      '██╗   ██╗',
      '╚██╗ ██╔╝',
      ' ╚████╔╝ ',
      ' ██╔██╗  ',
      '██╔╝ ██╗ ',
      '╚═╝  ╚═╝ '
    ],
    '^': [
      ' ██╗ ',
      '██╔╝ ',
      '╚██╗ ',
      ' ╚██╗',
      '  ╚═╝',
      '     '
    ],
    '&': [
      ' ██████╗ ',
      '██╔═══██╗',
      '╚██████╔╝',
      ' ╚══██╔╝ ',
      '██████╔╝ ',
      '╚═════╝  '
    ],
    '*': [
      '    ██╗    ',
      '██╗ ██║ ██╗',
      '╚████████╔╝',
      ' ╚██████╔╝ ',
      '██╗ ██║ ██╗',
      '╚═╝ ╚═╝ ╚═╝'
    ],
    '(': [
      ' ██╗',
      '██╔╝',
      '██║ ',
      '██║ ',
      '██╚╗',
      ' ╚═╝'
    ],
    ')': [
      '██╗ ',
      '╚██╗',
      ' ██║',
      ' ██║',
      '██╔╝',
      '╚═╝ '
    ],
    '[': [
      '███╗',
      '██╔╝',
      '██║ ',
      '██║ ',
      '██╚╗',
      '╚══╝'
    ],
    ']': [
      '███╗',
      '╚██║',
      ' ██║',
      ' ██║',
      '██╔╝',
      '╚══╝'
    ],
    '{': [
      ' ██╗',
      '██╔╝',
      '╚██╗',
      '██╔╝',
      '██╚╗',
      '╚══╝'
    ],
    '}': [
      '██╗ ',
      '╚██╗',
      '██╔╝',
      '╚██╗',
      '██╔╝',
      '╚══╝'
    ],
    '+': [
      '     ',
      '  ██╗',
      '██████╗',
      '  ██║',
      '  ╚═╝',
      '     '
    ],
    '-': [
      '     ',
      '     ',
      '█████╗',
      '╚════╝',
      '     ',
      '     '
    ],
    '=': [
      '      ',
      '██████╗',
      '╚═════╝',
      '██████╗',
      '╚═════╝',
      '      '
    ],
    '<': [
      '  ██╗',
      ' ██╔╝',
      '██╔╝ ',
      '██╚╗ ',
      ' ██╚╗',
      '  ╚═╝'
    ],
    '>': [
      '██╗  ',
      '╚██╗ ',
      ' ╚██╗',
      ' ██╔╝',
      '██╔╝ ',
      '╚═╝  '
    ],
    '/': [
      '    ██╗',
      '   ██╔╝',
      '  ██╔╝ ',
      ' ██╔╝  ',
      '██╔╝   ',
      '╚═╝    '
    ],
    '\\': [
      '██╗    ',
      '╚██╗   ',
      ' ╚██╗  ',
      '  ╚██╗ ',
      '   ╚██╗',
      '    ╚═╝'
    ],
    '|': [
      '██╗',
      '██║',
      '██║',
      '██║',
      '██║',
      '╚═╝'
    ],
    '~': [
      '       ',
      '██╗ ██╗',
      '╚████╔╝',
      ' ╚██╔╝ ',
      '  ╚═╝  ',
      '       '
    ],
    '`': [
      '██╗',
      '╚██╗',
      ' ╚═╝',
      '    ',
      '    ',
      '    '
    ],
    '"': [
      '██╗ ██╗',
      '██║ ██║',
      '╚═╝ ╚═╝',
      '       ',
      '       ',
      '       '
    ],
    "'": [
      '██╗',
      '██║',
      '╚═╝',
      '   ',
      '   ',
      '   '
    ],
    ':': [
      '   ',
      '██╗',
      '╚═╝',
      '██╗',
      '╚═╝',
      '   '
    ],
    ';': [
      '   ',
      '██╗',
      '╚═╝',
      '██╗',
      '██║',
      '╚═╝'
    ],
    '.': [
      '   ',
      '   ',
      '   ',
      '   ',
      '██╗',
      '╚═╝'
    ],
    ',': [
      '   ',
      '   ',
      '   ',
      '██╗',
      '██║',
      '╚═╝'
    ],
    '?': [
      '██████╗ ',
      '╚════██╗',
      '  ███╔╝ ',
      '  ╚═╝   ',
      '  ██╗   ',
      '  ╚═╝   '
    ]
  };

  const generateASCII = () => {
    // Replace literal \n with actual newline
    const processedText = text.replace(/\\n/g, '\n');
    const lines = processedText.split('\n');
    
    // Enforce maximum of 10 lines
    if (lines.length > 10) {
      alert('Maximum 10 lines allowed. Please reduce your text.');
      return;
    }
    
    const allGeneratedLines: string[] = [];
    
    lines.forEach((line, lineIndex) => {
      const upperLine = line.toUpperCase();
      const lineChars = Array(6).fill('');
      
      for (let char of upperLine) {
        const charPattern = asciiFont[char];
        if (charPattern) {
          for (let i = 0; i < 6; i++) {
            lineChars[i] += charPattern[i];
          }
        }
      }
      
      // Add the generated lines for this text line
      allGeneratedLines.push(...lineChars);
      
      // Add a blank line between text lines (except after the last line)
      if (lineIndex < lines.length - 1) {
        allGeneratedLines.push('');
      }
    });
    
    setGenerated(allGeneratedLines);
  };

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
        link.download = `ascii-art-${Date.now()}.png`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert(`Failed to generate PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#D97757' }}>
        Claude Code logo Generator
      </h1>
      
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#D97757' }}>
            Enter Text (use \n for new line, max 10 lines):
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                generateASCII();
              }
            }}
            className="w-full px-4 py-3 bg-gray-900 border-2 rounded-md focus:outline-none focus:ring-2 text-white text-lg font-mono"
            style={{ 
              borderColor: '#D97757',
            }}
            onFocus={(e) => e.target.style.borderColor = '#D97757'}
            placeholder='Enter text (e.g., "CLAUDE\nCODE")'
          />
        </div>
        
        <button
          onClick={generateASCII}
          className="w-full px-6 py-3 text-white rounded-md transition-colors text-lg font-semibold"
          style={{ 
            backgroundColor: '#D97757',
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#D97757'}
        >
          Generate Claude Code logo
        </button>
      </div>
      
      {generated.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-md overflow-x-auto border-2" style={{ borderColor: '#D97757' }}>
            <pre 
              className={`font-mono text-base leading-tight whitespace-pre ${
                text.includes('\\n') || text.includes('\n') ? 'text-left' : 'text-center'
              }`} 
              style={{ color: '#D97757' }}
            >
              {generated.join('\n')}
            </pre>
          </div>
          
          <button
            onClick={downloadPNG}
            className="px-6 py-3 text-white rounded-md transition-colors font-semibold"
            style={{ 
              backgroundColor: '#D97757',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#D97757'}
          >
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
};

export default ASCIIGenerator;