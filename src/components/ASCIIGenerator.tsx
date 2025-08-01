import React, { useState, useCallback, useRef, useEffect } from 'react';
import { downloadFile } from '../lib/asciiUtils';
import { renderStaticASCII, renderAnimatedASCII, createVideoRecorder } from '../lib/canvasRenderer';

interface ASCIIGeneratorProps {
  text: string;
  generated: string[];
}

const ASCIIGenerator: React.FC<ASCIIGeneratorProps> = ({ text, generated }) => {
  const [isAnimating, setIsAnimating] = useState(true); // Always animate preview
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  
  // Video controls state
  const [videoDuration, setVideoDuration] = useState(6); // 4-10 seconds
  const [bounceSpeed, setBounceSpeed] = useState(1); // 0.5-2x speed
  const [retroFlare, setRetroFlare] = useState(false);
  const [scanlines, setScanlines] = useState(false);

  const downloadPNG = async () => {
    if (generated.length === 0) {
      alert('Please generate ASCII art first!');
      return;
    }
    
    try {
      // Create canvas and render using shared utility
      const canvas = document.createElement('canvas');
      renderStaticASCII({
        canvas,
        text,
        fontSize: 20,
        padding: 50
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob from canvas');
        }
        downloadFile(blob, `cc-logo-${Date.now()}.png`);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert(`Failed to generate PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleDownloadVideo = useCallback(async () => {
    if (!canvasRef.current || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);

      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 400;

      const videoRecorder = createVideoRecorder(canvas);
      videoRecorder.start();

      const duration = videoDuration * 1000; // Convert to milliseconds
      const startTime = Date.now();
      
      const recordAnimation = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setRecordingProgress(progress * 100);
        
        renderAnimatedASCII({
          canvas,
          text,
          progress,
          fontSize: 16,
          bounceIntensity: 30,
          rotationIntensity: 0.05,
          scaleIntensity: 0.05,
          bounceSpeed,
          retroFlare,
          scanlines
        });
        
        if (elapsed < duration) {
          requestAnimationFrame(recordAnimation);
        } else {
          videoRecorder.stop().then((videoBlob) => {
            downloadFile(videoBlob, `bouncing-ascii-${Date.now()}.webm`);
            setIsRecording(false);
            setRecordingProgress(0);
          }).catch((error) => {
            console.error('Video recording failed:', error);
            alert(`Video recording failed: ${error.message}`);
            setIsRecording(false);
            setRecordingProgress(0);
          });
        }
      };

      recordAnimation();
      
    } catch (error) {
      console.error('Video recording failed:', error);
      alert(`Video recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRecording(false);
      setRecordingProgress(0);
    }
  }, [text, isRecording, videoDuration, bounceSpeed, retroFlare, scanlines]);

  // Animation for preview
  useEffect(() => {
    if (!isAnimating || !canvasRef.current) return;

    let startTime = Date.now();
    const duration = 10000; // 10 seconds loop

    const animate = () => {
      const elapsed = (Date.now() - startTime) % duration;
      const progress = elapsed / duration;
      
      if (canvasRef.current) {
        renderAnimatedASCII({
          canvas: canvasRef.current,
          text,
          progress,
          bounceSpeed,
          retroFlare,
          scanlines
        });
      }
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, text, bounceSpeed, retroFlare, scanlines]);

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
        Export Options
      </h3>
        
        <div className="text-center space-y-4">
          {/* Video Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Duration Control */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D97757' }}>
                Duration: {videoDuration}s
              </label>
              <input
                type="range"
                min="4"
                max="10"
                step="1"
                value={videoDuration}
                onChange={(e) => setVideoDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D97757 0%, #D97757 ${(videoDuration - 4) / 6 * 100}%, #374151 ${(videoDuration - 4) / 6 * 100}%, #374151 100%)`
                }}
              />
            </div>

            {/* Bounce Speed Control */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D97757' }}>
                Bounce Speed: {bounceSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={bounceSpeed}
                onChange={(e) => setBounceSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D97757 0%, #D97757 ${(bounceSpeed - 0.5) / 1.5 * 100}%, #374151 ${(bounceSpeed - 0.5) / 1.5 * 100}%, #374151 100%)`
                }}
              />
            </div>


            {/* Toggle Controls */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={retroFlare}
                  onChange={(e) => setRetroFlare(e.target.checked)}
                  className="mr-2"
                />
                <span style={{ color: '#D97757' }}>Retro Flare Effects</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scanlines}
                  onChange={(e) => setScanlines(e.target.checked)}
                  className="mr-2"
                />
                <span style={{ color: '#D97757' }}>CRT Scanlines</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={downloadPNG}
              className="px-4 py-2 text-white rounded-md transition-colors font-semibold"
              style={{ backgroundColor: '#D97757' }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#C96747';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#D97757';
              }}
            >
              Download PNG
            </button>
            
            <button
              onClick={handleDownloadVideo}
              disabled={isRecording}
              className="px-4 py-2 text-white rounded-md transition-colors font-semibold"
              style={{ 
                backgroundColor: isRecording ? '#999999' : '#D97757',
                cursor: isRecording ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isRecording) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#C96747';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRecording) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#D97757';
                }
              }}
            >
              {isRecording ? `Recording... ${Math.round(recordingProgress)}%` : 'Download Video'}
            </button>
          </div>
          
          {isRecording && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all duration-300" 
                style={{ 
                  backgroundColor: '#D97757',
                  width: `${recordingProgress}%`
                }}
              ></div>
            </div>
          )}
          
          <div className="mt-4 border-2 border-orange-400 rounded-lg overflow-hidden bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                display: 'block'
              }}
            />
          </div>
        </div>
    </div>
  );
};

export default ASCIIGenerator;