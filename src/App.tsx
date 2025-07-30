import React, { useState, useRef, useCallback } from 'react';
import ASCIIGenerator from './components/ASCIIGenerator';
import { generateASCIILines } from './lib/asciiUtils';

function App() {
  const [text, setText] = useState('CLAUDE\\nCODE');
  const [generated, setGenerated] = useState<string[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerateASCII = () => {
    try {
      const asciiLines = generateASCIILines(text);
      setGenerated(asciiLines);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const generateVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      setIsGeneratingVideo(true);

      // Set canvas size
      const width = 800;
      const height = 450;
      canvas.width = width;
      canvas.height = height;

      // Create a MediaRecorder to capture the canvas
      const stream = canvas.captureStream(30); // 30 FPS
      
      let mimeType = '';
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        throw new Error('No supported video format found');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        setIsGeneratingVideo(false);
      };

      mediaRecorder.onerror = () => {
        setIsGeneratingVideo(false);
        alert('Recording failed');
      };

      // Start recording
      mediaRecorder.start();

      // Draw black screen for 5 seconds
      const duration = 5000; // 5 seconds
      const startTime = Date.now();

      const drawFrame = () => {
        // Fill with black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const elapsed = Date.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      drawFrame();
    } catch (error) {
      setIsGeneratingVideo(false);
      alert(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);


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
            
            <div className="flex space-x-4">
              <ASCIIGenerator text={text} generated={generated} />
              <button
                onClick={generateVideo}
                disabled={isGeneratingVideo}
                className="px-6 py-3 text-white rounded-md transition-colors font-semibold"
                style={{ 
                  backgroundColor: isGeneratingVideo ? '#999999' : '#D97757',
                  cursor: isGeneratingVideo ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isGeneratingVideo) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#C96747';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGeneratingVideo) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#D97757';
                  }
                }}
              >
                {isGeneratingVideo ? 'Generating Video...' : 'Generate Video'}
              </button>
            </div>
            
            <canvas
              ref={canvasRef}
              style={{ 
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                visibility: 'hidden',
                opacity: '0',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App;