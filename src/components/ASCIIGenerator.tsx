import React, { useState, useCallback, useRef, useEffect } from 'react';
import { downloadFile } from '../lib/asciiUtils';
import { renderStaticASCII, renderAnimatedASCII, createVideoRecorder } from '../lib/canvasRenderer';

interface ASCIIGeneratorProps {
  text: string;
  generated: string[];
}

const ASCIIGenerator: React.FC<ASCIIGeneratorProps> = ({ text, generated }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

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

  const handlePreviewVideo = useCallback(() => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [showPreview]);

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

      const duration = 10000; // 10 seconds
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
          scaleIntensity: 0.05
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
  }, [text, isRecording]);

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
          progress
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
  }, [isAnimating, text]);

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
    <div className="space-y-6">
      {/* PNG Export */}
      <div className="bg-gray-900 p-6 rounded-md border-2 space-y-4" style={{ borderColor: '#D97757' }}>
        <h3 className="text-xl font-bold text-center" style={{ color: '#D97757' }}>
          PNG Export
        </h3>
        
        <div className="text-center">
          <button
            onClick={downloadPNG}
            className="px-6 py-3 text-white rounded-md transition-colors font-semibold mx-auto"
            style={{ backgroundColor: '#D97757' }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C96747'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#D97757'}
          >
            Download PNG
          </button>
        </div>
      </div>

      {/* Video Export */}
      <div className="bg-gray-900 p-6 rounded-md border-2 space-y-4" style={{ borderColor: '#D97757' }}>
        <h3 className="text-xl font-bold text-center" style={{ color: '#D97757' }}>
          Video Export
        </h3>
        
        <div className="text-center space-y-3">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePreviewVideo}
              className="px-4 py-2 text-white rounded-md transition-colors font-semibold"
              style={{ backgroundColor: '#D97757' }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#C96747';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#D97757';
              }}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
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
          
          {showPreview && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ASCIIGenerator;