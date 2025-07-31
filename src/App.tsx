import React, { useState } from 'react';
import ASCIIGenerator from './components/ASCIIGenerator';
import { generateASCIILines } from './lib/asciiUtils';

function App() {
  const [text, setText] = useState('CLAUDE\\nCODE');
  const [generated, setGenerated] = useState<string[]>([]);

  const handleGenerateASCII = () => {
    try {
      const asciiLines = generateASCIILines(text);
      setGenerated(asciiLines);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#D97757' }}>
          Claude Code Logo Generator
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
                  handleGenerateASCII();
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
            onClick={handleGenerateASCII}
            className="w-full px-6 py-3 text-white rounded-md transition-colors text-lg font-semibold"
            style={{ 
              backgroundColor: '#D97757',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#D97757'}
          >
            Generate Logo
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
            
            <ASCIIGenerator text={text} generated={generated} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;