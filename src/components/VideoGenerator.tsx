import React, { useRef, useEffect, useState } from 'react';
import { asciiFont } from '../lib/font';

interface VideoGeneratorProps {
  text: string;
  onClose: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ text, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BINARY_CHARS = ['0', '1'];
  const ORANGE_COLOR = '#D97757';
  const BLACK_COLOR = '#000000';

  // Calculate dynamic animation durations based on text content
  const calculateAnimationDurations = (inputText: string) => {
    const asciiLines = generateASCIILines(inputText);
    const totalCharacters = asciiLines.reduce((sum, line) => sum + line.length, 0);
    
    // Optimized durations for 10-second total animation
    const binaryDuration = 2000;  // 2 seconds for binary stream
    const glitchDuration = 1000;   // 1 second for glitch effect
    const holdDuration = 2000;     // 2 seconds hold at end
    
    // Text reveal: 5 seconds total (10s - 2s binary - 1s glitch - 2s hold = 5s)
    const revealDuration = 5000;
    
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

  // Generate ASCII art from text
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
        // Create scrolling effect based on time and position
        const scrollOffset = (time * 0.005 + col * 0.1 + row * 0.05) % 1;
        const char = BINARY_CHARS[Math.floor((scrollOffset + col + row) * 2) % 2];
        
        const x = col * 10;
        const y = row * 15 + 12;
        
        // Add some randomness to make it more dynamic
        const opacity = 0.5 + 0.5 * Math.sin(time * 0.01 + col + row);
        ctx.globalAlpha = opacity;
        
        ctx.fillText(char, x, y);
      }
    }
    
    ctx.globalAlpha = 1;
  };

  // Draw glitch effect
  const drawGlitchEffect = (ctx: CanvasRenderingContext2D, time: number, progress: number) => {
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = ORANGE_COLOR;
    ctx.font = '12px monospace';
    
    const cols = Math.floor(CANVAS_WIDTH / 10);
    const rows = Math.floor(CANVAS_HEIGHT / 15);
    
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * 10;
        const y = row * 15 + 12;
        
        // Increase glitch intensity over time
        const glitchIntensity = progress;
        
        if (Math.random() < glitchIntensity) {
          // Draw fragmented characters
          const fragments = ['█', '▌', '▐', '▀', '▄', '║', '═', '╗', '╔', '╚', '╝'];
          const fragment = fragments[Math.floor(Math.random() * fragments.length)];
          
          // Add random displacement for glitch effect
          const offsetX = (Math.random() - 0.5) * 20 * glitchIntensity;
          const offsetY = (Math.random() - 0.5) * 20 * glitchIntensity;
          
          ctx.globalAlpha = 0.3 + 0.7 * Math.random();
          ctx.fillText(fragment, x + offsetX, y + offsetY);
        } else if (Math.random() < 0.3) {
          // Some remaining binary
          const char = BINARY_CHARS[Math.floor(Math.random() * 2)];
          ctx.globalAlpha = 0.2 + 0.3 * (1 - progress);
          ctx.fillText(char, x, y);
        }
      }
    }
    
    ctx.globalAlpha = 1;
  };

  // Draw final ASCII text with proper alignment to match PNG export
  const drawFinalText = (ctx: CanvasRenderingContext2D, asciiLines: string[], progress: number) => {
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = ORANGE_COLOR;
    ctx.font = '16px monospace';
    
    const lineHeight = 20;
    const totalHeight = asciiLines.length * lineHeight;
    const startY = (CANVAS_HEIGHT - totalHeight) / 2;
    const padding = 50;
    
    // Check if it's multi-line text (matches PNG export logic)
    const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');
    
    asciiLines.forEach((line, index) => {
      if (line.trim()) {
        let x: number;
        if (hasMultipleTextLines) {
          // Left-align for multi-line text (matches PNG export)
          x = padding;
        } else {
          // Center for single line (matches PNG export)
          const textWidth = ctx.measureText(line).width;
          x = (CANVAS_WIDTH - textWidth) / 2;
        }
        const y = startY + index * lineHeight + 16;
        
        // Animate text appearance character by character
        // Optimized for 5-second reveal with complete text guarantee
        const lineOffset = index * 0.015; // Slightly reduced for faster reveal
        const revealProgress = Math.max(0, Math.min(1, (progress - lineOffset)));
        
        // Ensure complete text is shown when progress is near end
        let charsToShow: number;
        if (progress >= 0.8) {
          // Show complete text in final 20% of reveal phase
          charsToShow = line.length;
        } else {
          charsToShow = Math.floor(line.length * revealProgress);
        }
        
        const visibleLine = line.substring(0, charsToShow);
        
        // Debug logging for problematic cases
        if (text.includes('CODE') && line.includes('█') && index > 6) {
          console.log(`Line ${index}, progress: ${progress.toFixed(3)}, revealProgress: ${revealProgress.toFixed(3)}, chars: ${charsToShow}/${line.length}`);
        }
        
        ctx.globalAlpha = Math.min(1, revealProgress * 2);
        ctx.fillText(visibleLine, x, y);
      }
    });
    
    ctx.globalAlpha = 1;
  };

  // Main animation loop with dynamic timing
  const animate = (currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }
    
    const elapsed = currentTime - startTimeRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const asciiLines = generateASCIILines(text);
    const durations = calculateAnimationDurations(text);
    
    if (elapsed < durations.binaryEnd) {
      // Phase 1: Binary stream
      drawBinaryStream(ctx, elapsed);
    } else if (elapsed < durations.glitchEnd) {
      // Phase 2: Glitch effect
      const progress = (elapsed - durations.binaryEnd) / 1000;
      drawGlitchEffect(ctx, elapsed, progress);
    } else if (elapsed < durations.revealEnd) {
      // Phase 3: Text reveal
      const revealDuration = durations.revealEnd - durations.glitchEnd;
      const progress = (elapsed - durations.glitchEnd) / revealDuration;
      // Ensure we reach full text display before reveal phase ends
      const adjustedProgress = Math.min(1.0, progress);
      drawFinalText(ctx, asciiLines, adjustedProgress);
    } else if (elapsed < durations.totalDuration) {
      // Phase 4: Hold final frame - ALWAYS show complete text
      drawFinalText(ctx, asciiLines, 1.0);
    } else {
      // Animation complete, show final text - GUARANTEE complete text
      drawFinalText(ctx, asciiLines, 1.0);
      setIsPlaying(false);
      return;
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    startTimeRef.current = undefined;
    setIsPlaying(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
  };

  // Record animation as WebM (much more reliable than GIF)
  const recordAnimation = async (): Promise<Blob> => {
    console.log('Starting animation recording...');
    setIsGenerating(true);

    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not found'));
        return;
      }

      // Check browser support
      if (!canvas.captureStream || !MediaRecorder) {
        reject(new Error('Recording not supported in this browser'));
        return;
      }

      // Create stream from canvas with higher frame rate for smoother quality
      const stream = canvas.captureStream(30); // 30 FPS for better quality
      
      // Find supported MIME type
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
        videoBitsPerSecond: 1600000 // Doubled bitrate for better quality (2x file size)
      });

      const recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped. Creating video blob...');
        const videoBlob = new Blob(recordedChunks, { type: mimeType });
        console.log('Video created, size:', videoBlob.size);
        setIsGenerating(false);
        stream.getTracks().forEach(track => track.stop());
        resolve(videoBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('Recording error:', event);
        setIsGenerating(false);
        stream.getTracks().forEach(track => track.stop());
        reject(new Error('Recording failed'));
      };

      // Start recording with higher data collection frequency for quality
      mediaRecorder.start(50); // Collect data every 50ms for smoother video
      console.log('Recording started...');

      // Run the animation
      const durations = calculateAnimationDurations(text);
      const asciiLines = generateASCIILines(text);
      
      // Clear canvas and start animation
      const ctx = canvas.getContext('2d');
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
        
        // Clear canvas
        ctx.fillStyle = BLACK_COLOR;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (elapsed < durations.binaryEnd) {
          // Phase 1: Binary stream
          drawBinaryStream(ctx, elapsed);
        } else if (elapsed < durations.glitchEnd) {
          // Phase 2: Glitch effect
          const progress = (elapsed - durations.binaryEnd) / 1000;
          drawGlitchEffect(ctx, elapsed, progress);
        } else if (elapsed < durations.revealEnd) {
          // Phase 3: Text reveal
          const revealDuration = durations.revealEnd - durations.glitchEnd;
          const progress = (elapsed - durations.glitchEnd) / revealDuration;
          // Ensure we reach full text display before reveal phase ends
          const adjustedProgress = Math.min(1.0, progress);
          drawFinalText(ctx, asciiLines, adjustedProgress);
        } else if (elapsed < durations.totalDuration) {
          // Phase 4: Hold final frame - ALWAYS show complete text
          drawFinalText(ctx, asciiLines, 1.0);
        } else {
          // Animation complete - GUARANTEE complete text is recorded
          drawFinalText(ctx, asciiLines, 1.0);
          console.log('Animation complete, stopping recording...');
          mediaRecorder.stop();
          return;
        }
        
        requestAnimationFrame(animateForRecording);
      };
      
      requestAnimationFrame(animateForRecording);

      // Fallback timeout
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('Stopping recording due to timeout...');
          mediaRecorder.stop();
        }
      }, durations.totalDuration + 2000);
    });
  };


  // Download PNG of final frame
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw final frame - ensure complete text
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const asciiLines = generateASCIILines(text);
    drawFinalText(ctx, asciiLines, 1.0);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cc-logo-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Download animation as WebM video
  const downloadAnimation = async () => {
    try {
      const videoBlob = await recordAnimation();
      
      const url = URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `claude-code-logo-${Date.now()}.webm`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('Video download completed');
    } catch (error) {
      console.error('Animation recording failed:', error);
      alert(`Animation recording failed: ${error.message}\n\nTip: WebM files can be converted to GIF using online converters like cloudconvert.com`);
      setIsGenerating(false);
    }
  };

  // Initialize canvas with final frame when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw final ASCII text immediately so canvas isn't black - ensure complete text
    const asciiLines = generateASCIILines(text);
    drawFinalText(ctx, asciiLines, 1.0);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full mx-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 text-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 bg-black mx-auto"
            style={{ borderColor: ORANGE_COLOR, maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={downloadPNG}
            className="px-6 py-3 text-white rounded-md transition-colors font-semibold"
            style={{ backgroundColor: ORANGE_COLOR }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = ORANGE_COLOR}
          >
            Download PNG
          </button>
          
          <button
            onClick={downloadAnimation}
            disabled={isPlaying || isGenerating}
            className="px-6 py-3 text-white rounded-md transition-colors font-semibold disabled:opacity-50"
            style={{ backgroundColor: (isPlaying || isGenerating) ? '#666' : ORANGE_COLOR }}
            onMouseEnter={(e) => {
              if (!isPlaying && !isGenerating) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#C96747';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlaying && !isGenerating) {
                (e.target as HTMLButtonElement).style.backgroundColor = ORANGE_COLOR;
              }
            }}
          >
            {isGenerating ? 'Recording Animation...' : 'Download WebM'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;