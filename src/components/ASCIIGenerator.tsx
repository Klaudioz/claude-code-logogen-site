import React, { useState } from 'react';
import { asciiFont } from '../lib/font';

const ASCIIGenerator = () => {
  const [text, setText] = useState('CLAUDE\\nCODE');
  const [generated, setGenerated] = useState<string[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);


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
        link.download = `cc-logo-${Date.now()}.png`;
        
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

  // Video generation constants and functions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BINARY_CHARS = ['0', '1'];
  const ORANGE_COLOR = '#D97757';
  const BLACK_COLOR = '#000000';

  // Calculate dynamic animation durations based on text content
  const calculateAnimationDurations = (inputText: string) => {
    const binaryDuration = 2000;  // 2 seconds for binary stream
    const glitchDuration = 1000;   // 1 second for glitch effect
    const holdDuration = 2000;     // 2 seconds hold at end
    const revealDuration = 5000;   // 5 seconds for text reveal
    
    const binaryEnd = binaryDuration;
    const glitchEnd = binaryEnd + glitchDuration;
    const revealEnd = glitchEnd + revealDuration;
    const totalDuration = revealEnd + holdDuration;
    
    return {
      binaryEnd,
      glitchEnd,
      revealEnd,
      totalDuration,
    };
  };

  // Generate ASCII art from text (for video)
  const generateASCIILines = (inputText: string): string[] => {
    const processedText = inputText.replace(/\\n/g, '\n');
    const lines = processedText.split('\n');
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
      
      allGeneratedLines.push(...lineChars);
      
      if (lineIndex < lines.length - 1) {
        allGeneratedLines.push('');
      }
    });
    
    return allGeneratedLines;
  };

  // Draw binary stream effect
  const drawBinaryStream = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = ORANGE_COLOR;
    ctx.font = '12px monospace';
    
    const cols = Math.floor(CANVAS_WIDTH / 10);
    const rows = Math.floor(CANVAS_HEIGHT / 15);
    
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const scrollOffset = (time * 0.005 + col * 0.1 + row * 0.05) % 1;
        const char = BINARY_CHARS[Math.floor((scrollOffset + col + row) * 2) % 2];
        
        const x = col * 10;
        const y = row * 15 + 12;
        
        const opacity = 0.5 + 0.5 * Math.sin(time * 0.01 + col + row);
        ctx.globalAlpha = opacity;
        
        ctx.fillText(char, x, y);
      }
    }
    
    ctx.globalAlpha = 1.0;
  };

  // Draw glitch effect
  const drawGlitchEffect = (ctx: CanvasRenderingContext2D, time: number, progress: number) => {
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const intensity = 1 - progress;
    
    for (let i = 0; i < 20; i++) {
      const width = Math.random() * CANVAS_WIDTH;
      const height = Math.random() * 50 * intensity;
      const x = Math.random() * (CANVAS_WIDTH - width);
      const y = Math.random() * (CANVAS_HEIGHT - height);
      
      ctx.fillStyle = Math.random() > 0.5 ? ORANGE_COLOR : '#FF0000';
      ctx.globalAlpha = Math.random() * 0.8 * intensity;
      ctx.fillRect(x, y, width, height);
    }
    
    ctx.globalAlpha = 1.0;
  };

  // Draw final text with reveal animation
  const drawFinalText = (ctx: CanvasRenderingContext2D, asciiLines: string[], progress: number) => {
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = ORANGE_COLOR;
    ctx.font = '14px monospace';
    
    const totalChars = asciiLines.reduce((sum, line) => sum + line.length, 0);
    const charsToShow = Math.floor(totalChars * progress);
    
    let charCount = 0;
    let y = 50;
    
    for (const line of asciiLines) {
      if (charCount >= charsToShow) break;
      
      const remainingChars = charsToShow - charCount;
      const lineToShow = line.substring(0, Math.min(line.length, remainingChars));
      
      const textWidth = ctx.measureText(line).width;
      const x = (CANVAS_WIDTH - textWidth) / 2;
      
      ctx.fillText(lineToShow, x, y);
      
      charCount += line.length;
      y += 20;
    }
  };

  // Record animation as WebM
  const recordAnimation = async (targetCanvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!targetCanvas.captureStream || !MediaRecorder) {
        reject(new Error('Recording not supported in this browser'));
        return;
      }

      const stream = targetCanvas.captureStream(30);
      
      let mimeType = '';
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        reject(new Error('No supported video format found'));
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 1600000
      });

      const recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: mimeType });
        setIsGeneratingVideo(false);
        stream.getTracks().forEach(track => track.stop());
        resolve(videoBlob);
      };

      mediaRecorder.onerror = (event) => {
        setIsGeneratingVideo(false);
        stream.getTracks().forEach(track => track.stop());
        reject(new Error('Recording failed'));
      };

      mediaRecorder.start(50);

      const durations = calculateAnimationDurations(text);
      const asciiLines = generateASCIILines(text);
      
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      let animationStartTime: number;
      
      const animateForRecording = (currentTime: number) => {
        if (!animationStartTime) {
          animationStartTime = currentTime;
        }
        
        const elapsed = currentTime - animationStartTime;
        
        ctx.fillStyle = BLACK_COLOR;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (elapsed < durations.binaryEnd) {
          drawBinaryStream(ctx, elapsed);
        } else if (elapsed < durations.glitchEnd) {
          const progress = (elapsed - durations.binaryEnd) / 1000;
          drawGlitchEffect(ctx, elapsed, progress);
        } else if (elapsed < durations.revealEnd) {
          const revealDuration = durations.revealEnd - durations.glitchEnd;
          const progress = (elapsed - durations.glitchEnd) / revealDuration;
          const adjustedProgress = Math.min(1.0, progress);
          drawFinalText(ctx, asciiLines, adjustedProgress);
        } else if (elapsed < durations.totalDuration) {
          drawFinalText(ctx, asciiLines, 1.0);
        } else {
          drawFinalText(ctx, asciiLines, 1.0);
          mediaRecorder.stop();
          return;
        }
        
        requestAnimationFrame(animateForRecording);
      };
      
      requestAnimationFrame(animateForRecording);

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, durations.totalDuration + 2000);
    });
  };

  // Download video directly
  const downloadVideo = async () => {
    if (generated.length === 0) {
      alert('Please generate ASCII art first!');
      return;
    }

    try {
      setIsGeneratingVideo(true);

      // Create a temporary canvas for video generation (completely hidden)
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      canvas.style.position = 'absolute';
      canvas.style.left = '-9999px';
      canvas.style.top = '-9999px';
      canvas.style.visibility = 'hidden';
      canvas.style.opacity = '0';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);

      const videoBlob = await recordAnimation(canvas);
      
      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `claude-code-logo-${Date.now()}.webm`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(canvas);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Video generation failed:', error);
      alert(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: WebM files can be converted to GIF using online converters like cloudconvert.com`);
      setIsGeneratingVideo(false);
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
          Generate logo
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
            
            <button
              onClick={downloadVideo}
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
              {isGeneratingVideo ? 'Recording Video...' : 'Download Video'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ASCIIGenerator;