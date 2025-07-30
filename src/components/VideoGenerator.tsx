import React, { useRef, useCallback, useState } from 'react';

const VideoGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const generateBlackScreenVideo = useCallback(async () => {
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
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      padding: '2rem', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: '#ffffff', marginBottom: '2rem' }}>
        Video Generator
      </h2>
      
      <button
        onClick={generateBlackScreenVideo}
        disabled={isGeneratingVideo}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: isGeneratingVideo ? '#999999' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isGeneratingVideo ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {isGeneratingVideo ? 'Generating Video...' : 'Generate Video'}
      </button>
      
      <canvas
        ref={canvasRef}
        style={{ 
          border: '2px solid #333',
          backgroundColor: '#000000',
          width: '400px',
          height: '225px'
        }}
      />
      
    </div>
  );
};

export default VideoGenerator;