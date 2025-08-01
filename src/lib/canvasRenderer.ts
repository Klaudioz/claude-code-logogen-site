import { generateASCIILines } from './asciiUtils';

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  text: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  shadow?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
}

export type AnimationType = 'bounce' | 'slideFromBottom' | 'slideFromTop' | 'binaryTransition';

export interface AnimationOptions extends RenderOptions {
  progress: number; // 0 to 1
  animationType?: AnimationType;
  bounceIntensity?: number;
  rotationIntensity?: number;
  scaleIntensity?: number;
  bounceSpeed?: number;
  retroFlare?: boolean;
  glowIntensity?: number;
  scanlines?: boolean;
}

export const renderStaticASCII = (options: RenderOptions): void => {
  const {
    canvas,
    text,
    fontSize = 20,
    color = '#D97757',
    backgroundColor = '#000000',
    padding = 50,
    shadow = false,
    shadowBlur = 0,
    shadowColor = 'rgba(217, 119, 87, 0.5)'
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Generate ASCII lines
  const asciiLines = (() => {
    try {
      return generateASCIILines(text);
    } catch (error) {
      return generateASCIILines('CLAUDE CODE');
    }
  })();

  // Calculate dimensions
  const lineHeight = fontSize * 1.1;
  const charWidth = fontSize * 0.6;
  const maxLineLength = Math.max(...asciiLines.map(line => line.length));
  
  canvas.width = Math.max(800, maxLineLength * charWidth + padding * 2);
  canvas.height = asciiLines.length * lineHeight + padding * 2;

  // Clear background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Setup text rendering
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  
  if (shadow) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
  }

  // Determine alignment
  const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');

  // Render ASCII lines
  asciiLines.forEach((line, index) => {
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

  if (shadow) {
    ctx.shadowBlur = 0;
  }
};

const renderBounceAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, bounceIntensity = 20, rotationIntensity = 0.02, scaleIntensity = 0.02, bounceSpeed = 1, lineHeight } = options;
  
  const speedMultiplier = bounceSpeed;
  const bounceY = Math.sin(progress * Math.PI * 4 * speedMultiplier) * bounceIntensity;
  const floatY = Math.sin(progress * Math.PI * 2 * speedMultiplier) * (bounceIntensity * 0.5);
  const rotation = Math.sin(progress * Math.PI * 3 * speedMultiplier) * rotationIntensity;
  const scale = 1 + Math.sin(progress * Math.PI * 6 * speedMultiplier) * scaleIntensity;

  ctx.save();
  ctx.translate(options.canvas.width / 2, options.canvas.height / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(0, bounceY + floatY);

  renderTextLines(ctx, asciiLines, options, { lineHeight });
  ctx.restore();
  
  return Math.abs(Math.sin(progress * Math.PI * 4 * speedMultiplier));
};

const renderSlideFromBottomAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, lineHeight } = options;
  
  // Use progress directly - video duration will control the speed
  const slideProgress = Math.min(progress, 1);
  const easeOutProgress = 1 - Math.pow(1 - slideProgress, 3);
  
  const startY = options.canvas.height;
  const endY = options.canvas.height / 2; // Center the text vertically
  const currentY = startY + (endY - startY) * easeOutProgress;

  ctx.save();
  ctx.translate(options.canvas.width / 2, currentY);
  renderTextLines(ctx, asciiLines, options, { lineHeight });
  ctx.restore();
  
  return slideProgress;
};

const renderSlideFromTopAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, lineHeight } = options;
  
  const totalHeight = asciiLines.length * lineHeight;
  // Use progress directly - video duration will control the speed
  const slideProgress = Math.min(progress, 1);
  const easeOutProgress = 1 - Math.pow(1 - slideProgress, 3);
  
  const startY = -totalHeight;
  const endY = options.canvas.height / 2; // Center the text vertically
  const currentY = startY + (endY - startY) * easeOutProgress;

  ctx.save();
  ctx.translate(options.canvas.width / 2, currentY);
  renderTextLines(ctx, asciiLines, options, { lineHeight });
  ctx.restore();
  
  return slideProgress;
};

const renderBinaryTransitionAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, lineHeight, text } = options;
  
  // Use the full duration - transition completes at 95% to allow final text to show
  const transitionProgress = Math.min(progress / 0.95, 1);
  const binaryPhase = Math.min(progress * 2, 1); // Slower binary flickering
  
  ctx.save();
  ctx.translate(options.canvas.width / 2, options.canvas.height / 2);
  
  const startY = -(asciiLines.length * lineHeight) / 2;
  const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');

  asciiLines.forEach((finalLine, lineIndex) => {
    const y = startY + (lineIndex * lineHeight);
    
    let x: number;
    if (hasMultipleTextLines) {
      const maxLineWidth = Math.max(...asciiLines.map(l => ctx.measureText(l).width));
      x = -maxLineWidth / 2;
      ctx.textAlign = 'left';
    } else {
      x = 0;
      ctx.textAlign = 'center';
    }

    let displayLine = '';
    
    for (let charIndex = 0; charIndex < finalLine.length; charIndex++) {
      // More gradual character reveal throughout the full duration
      const charProgress = Math.max(0, Math.min(1, (transitionProgress - (charIndex / finalLine.length) * 0.6) * 1.5));
      
      if (charProgress < 0.2) {
        // Binary flickering phase (longer)
        const flickerSpeed = binaryPhase * 15;
        displayLine += Math.sin(flickerSpeed + charIndex) > 0 ? '1' : '0';
      } else if (charProgress < 0.8) {
        // Extended transition phase - mix of binary and final character
        const mixPhase = (charProgress - 0.2) / 0.6;
        if (Math.random() < mixPhase) {
          displayLine += finalLine[charIndex];
        } else {
          displayLine += Math.random() > 0.5 ? '1' : '0';
        }
      } else {
        // Final character revealed
        displayLine += finalLine[charIndex];
      }
    }
    
    // Add glitch effect during transition
    if (transitionProgress > 0.1 && transitionProgress < 0.9) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 255, 0, ${0.2 * (1 - Math.abs(transitionProgress - 0.5) * 2)})`;
      ctx.fillText(displayLine, x + Math.random() * 3 - 1.5, y + Math.random() * 2 - 1);
      ctx.restore();
    }
    
    ctx.fillText(displayLine, x, y);
  });
  
  ctx.restore();
  return transitionProgress;
};

const renderTextLines = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions, renderOptions: { lineHeight: number }) => {
  const { text } = options;
  const { lineHeight } = renderOptions;
  const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');
  const startY = -(asciiLines.length * lineHeight) / 2;

  asciiLines.forEach((line, index) => {
    let x: number;
    if (hasMultipleTextLines) {
      const maxLineWidth = Math.max(...asciiLines.map(l => ctx.measureText(l).width));
      x = -maxLineWidth / 2;
      ctx.textAlign = 'left';
    } else {
      x = 0;
      ctx.textAlign = 'center';
    }
    
    const y = startY + (index * lineHeight);
    ctx.fillText(line || '\u00A0', x, y);
  });
};

export const renderAnimatedASCII = (options: AnimationOptions): void => {
  const {
    canvas,
    text,
    progress,
    animationType = 'bounce',
    fontSize = 16,
    color = '#D97757',
    backgroundColor = '#000000',
    shadow = true,
    shadowBlur = 10,
    shadowColor = 'rgba(217, 119, 87, 0.5)',
    bounceSpeed = 1,
    retroFlare = true,
    glowIntensity = 1,
    scanlines = true
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Generate ASCII lines
  const asciiLines = (() => {
    try {
      return generateASCIILines(text);
    } catch (error) {
      return generateASCIILines('CLAUDE CODE');
    }
  })();

  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add retro scanlines effect
  if (scanlines) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#00FF00';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    ctx.restore();
  }

  // Setup text rendering
  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  const lineHeight = fontSize * 1.125;
  let effectIntensity = 0;

  // Enhanced glow effect
  if (shadow) {
    const dynamicGlow = shadowBlur * glowIntensity;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = dynamicGlow;
  }

  // Render based on animation type
  switch (animationType) {
    case 'bounce':
      effectIntensity = renderBounceAnimation(ctx, asciiLines, { ...options, lineHeight });
      break;
    case 'slideFromBottom':
      effectIntensity = renderSlideFromBottomAnimation(ctx, asciiLines, { ...options, lineHeight });
      break;
    case 'slideFromTop':
      effectIntensity = renderSlideFromTopAnimation(ctx, asciiLines, { ...options, lineHeight });
      break;
    case 'binaryTransition':
      effectIntensity = renderBinaryTransitionAnimation(ctx, asciiLines, { ...options, lineHeight });
      break;
  }

  // Add retro flare effects for bounce animation
  if (retroFlare && animationType === 'bounce' && effectIntensity > 0.7) {
    ctx.save();
    ctx.globalAlpha = effectIntensity * 0.3;
    
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, 200
    );
    gradient.addColorStop(0, 'rgba(217, 119, 87, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.4)');
    gradient.addColorStop(0.6, 'rgba(255, 0, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  
  // Add retro CRT vignette effect
  if (retroFlare) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  
  if (shadow) {
    ctx.shadowBlur = 0;
  }
};

export const createVideoRecorder = (canvas: HTMLCanvasElement): {
  recorder: MediaRecorder;
  chunks: Blob[];
  start: () => void;
  stop: () => Promise<Blob>;
} => {
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
    throw new Error('No supported video format found');
  }

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  return {
    recorder: mediaRecorder,
    chunks,
    start: () => mediaRecorder.start(),
    stop: (): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          stream.getTracks().forEach(track => track.stop());
          resolve(videoBlob);
        };
        
        mediaRecorder.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Recording failed'));
        };
        
        mediaRecorder.stop();
      });
    }
  };
};