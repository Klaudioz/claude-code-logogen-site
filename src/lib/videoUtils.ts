import { asciiFont } from './font';

export interface BinaryParticle {
  x: number;
  y: number;
  char: string;
  targetX: number;
  targetY: number;
  speed: number;
  phase: number;
  opacity: number;
}

export const generateBinaryTransformationVideo = async (
  canvas: HTMLCanvasElement,
  targetText: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    // Set canvas size
    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    // Animation constants
    const ORANGE_COLOR = '#D97757';
    const BLACK_COLOR = '#000000';
    const BINARY_CHARS = ['0', '1'];
    const TARGET_TEXT = targetText.replace(/\\n/g, ' ').toUpperCase();
    
    // Animation phases (in milliseconds)
    const PHASE_1_DURATION = 1500; // Pure binary swirl
    const PHASE_2_DURATION = 2000; // Binary organizing into letter shapes
    const PHASE_3_DURATION = 1500; // Final text reveal
    const TOTAL_DURATION = PHASE_1_DURATION + PHASE_2_DURATION + PHASE_3_DURATION;

    // Generate target ASCII art
    const generateTargetASCII = () => {
      const words = TARGET_TEXT.split(' ');
      const allLines: string[] = [];
      
      words.forEach((word, wordIndex) => {
        const lineChars = Array(6).fill('');
        
        for (let char of word) {
          const charPattern = asciiFont[char];
          if (charPattern) {
            for (let i = 0; i < 6; i++) {
              lineChars[i] += charPattern[i];
            }
          }
        }
        
        allLines.push(...lineChars);
        
        if (wordIndex < words.length - 1) {
          allLines.push(''); // Space between words
        }
      });
      
      return allLines;
    };

    const targetLines = generateTargetASCII();
    const particles: BinaryParticle[] = [];
    
    // Generate particles for each target character position
    targetLines.forEach((line, lineIndex) => {
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char !== ' ' && char !== '') {
          const targetX = 100 + charIndex * 8;
          const targetY = 50 + lineIndex * 20;
          
          // Create multiple particles per target position for smoother animation
          for (let p = 0; p < 3; p++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              char: BINARY_CHARS[Math.floor(Math.random() * 2)],
              targetX,
              targetY,
              speed: 0.02 + Math.random() * 0.03,
              phase: Math.random() * Math.PI * 2,
              opacity: 0.3 + Math.random() * 0.7
            });
          }
        }
      }
    });

    // Add extra swirling particles for phase 1
    for (let i = 0; i < 300; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: BINARY_CHARS[Math.floor(Math.random() * 2)],
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.5
      });
    }

    // Create MediaRecorder
    const stream = canvas.captureStream(30);
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

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      stream.getTracks().forEach(track => track.stop());
      resolve(videoBlob);
    };

    mediaRecorder.onerror = () => {
      stream.getTracks().forEach(track => track.stop());
      reject(new Error('Recording failed'));
    };

    mediaRecorder.start();
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      
      // Report progress
      if (onProgress) {
        onProgress(progress);
      }
      
      // Clear canvas
      ctx.fillStyle = BLACK_COLOR;
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = ORANGE_COLOR;
      ctx.font = '12px monospace';
      
      if (elapsed < PHASE_1_DURATION) {
        // Phase 1: Pure binary swirl
        particles.forEach(particle => {
          // Swirling motion
          particle.phase += 0.02;
          const swirl = Math.sin(particle.phase) * 50;
          const x = particle.x + Math.cos(elapsed * 0.001 + particle.phase) * swirl;
          const y = particle.y + Math.sin(elapsed * 0.001 + particle.phase) * swirl;
          
          ctx.globalAlpha = particle.opacity * (0.3 + 0.7 * Math.sin(elapsed * 0.005 + particle.phase));
          ctx.fillText(particle.char, x, y);
        });
        
      } else if (elapsed < PHASE_1_DURATION + PHASE_2_DURATION) {
        // Phase 2: Binary organizing into letter shapes
        const phase2Progress = (elapsed - PHASE_1_DURATION) / PHASE_2_DURATION;
        const easeProgress = 1 - Math.pow(1 - phase2Progress, 3); // Ease out cubic
        
        particles.forEach(particle => {
          // Move towards target positions
          const currentX = particle.x + (particle.targetX - particle.x) * easeProgress;
          const currentY = particle.y + (particle.targetY - particle.y) * easeProgress;
          
          // Add some noise to make it look more organic
          const noise = Math.sin(elapsed * 0.01 + particle.phase) * (1 - easeProgress) * 10;
          
          ctx.globalAlpha = particle.opacity * (0.4 + 0.6 * phase2Progress);
          ctx.fillText(particle.char, currentX + noise, currentY + noise);
        });
        
      } else {
        // Phase 3: Final text reveal
        const phase3Progress = (elapsed - PHASE_1_DURATION - PHASE_2_DURATION) / PHASE_3_DURATION;
        const fadeProgress = Math.min(phase3Progress * 2, 1);
        
        // Draw final ASCII art
        ctx.font = '14px monospace';
        ctx.globalAlpha = fadeProgress;
        
        targetLines.forEach((line, lineIndex) => {
          const x = 100;
          const y = 50 + lineIndex * 20;
          ctx.fillText(line, x, y);
        });
        
        // Gradually fade out remaining binary particles
        particles.forEach(particle => {
          if (Math.random() > phase3Progress) {
            ctx.globalAlpha = (1 - phase3Progress) * 0.3;
            ctx.font = '12px monospace';
            ctx.fillText(particle.char, particle.targetX, particle.targetY);
          }
        });
      }
      
      ctx.globalAlpha = 1.0;
      
      if (elapsed < TOTAL_DURATION) {
        requestAnimationFrame(animate);
      } else {
        mediaRecorder.stop();
      }
    };
    
    animate();
  });
};