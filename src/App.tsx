import React, { useState, useEffect } from 'react';
import ASCIIGenerator from './components/ASCIIGenerator';
import { generateASCIILines } from './lib/asciiUtils';

function App() {
  const [text, setText] = useState('CLAUDE\\nCODE');
  const [generated, setGenerated] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleGenerateASCII = () => {
    try {
      const asciiLines = generateASCIILines(text);
      setGenerated(asciiLines);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setGenerated([]);
    }
  };

  // Auto-generate ASCII when text changes
  useEffect(() => {
    handleGenerateASCII();
  }, [text]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#D97757' }}>
          Claude Code Logo Generator
        </h1>
        
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#D97757' }}>
              Enter Text (use \n for new line, max 5 lines, 15 chars per line):
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                }
              }}
              className="w-full px-4 py-3 bg-gray-900 border-2 rounded-md focus:outline-none focus:ring-2 text-white text-lg font-mono"
              style={{ 
                borderColor: '#D97757',
              }}
              onFocus={(e) => e.target.style.borderColor = '#D97757'}
              placeholder='Enter text (e.g., "CLAUDE\nCODE")'
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">
                {error}
              </p>
            )}
          </div>
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