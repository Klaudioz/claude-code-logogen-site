import React, { useRef, useCallback, useState } from 'react';
import { generateBinaryTransformationVideo } from '../lib/videoUtils';
import { downloadFile } from '../lib/asciiUtils';

interface VideoGeneratorProps {
  text?: string;
  onVideoGenerate?: () => Promise<void>;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ text = 'CLAUDE CODE', onVideoGenerate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const handleGenerateVideo = useCallback(async () => {
    if (onVideoGenerate) {
      await onVideoGenerate();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsGeneratingVideo(true);

      const videoBlob = await generateBinaryTransformationVideo(canvas, text);
      downloadFile(videoBlob, `claude-code-transformation-${Date.now()}.webm`);
      
    } catch (error) {
      console.error('Video generation failed:', error);
      alert(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [onVideoGenerate]);

  return (
    <div className="bg-gray-900 p-6 rounded-md border-2 space-y-4" style={{ borderColor: '#D97757' }}>
      <h3 className="text-xl font-bold text-center" style={{ color: '#D97757' }}>
        Video Export
      </h3>
      
      <div className="text-center">
        <button
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
          className="px-6 py-3 text-white rounded-md transition-colors font-semibold mx-auto"
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
          {isGeneratingVideo ? 'Generating...' : 'Download Video'}
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
  );
};

export default VideoGenerator;