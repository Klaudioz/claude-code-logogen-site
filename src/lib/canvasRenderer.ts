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
  matrixRain?: boolean;
  chromaticAberration?: boolean;
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

const applyBinaryTransitionToText = (finalLines: string[], progress: number, text: string): string[] => {
  // Apply binary transition effect during the first 50% of the animation (extended from 30%)
  const transitionProgress = Math.min(progress / 0.5, 1);
  const binaryPhase = Math.min(progress * 2, 1); // Slower binary flickering to match extended duration
  
  if (transitionProgress >= 1) {
    return finalLines; // No more binary transition, show final text
  }
  
  return finalLines.map((finalLine, lineIndex) => {
    let displayLine = '';
    
    for (let charIndex = 0; charIndex < finalLine.length; charIndex++) {
      // More gradual character reveal over extended duration
      const charProgress = Math.max(0, Math.min(1, (transitionProgress - (charIndex / finalLine.length) * 0.3) * 1.5));
      
      if (charProgress < 0.4) {
        // Extended binary flickering phase with independent timing for each character
        const charSpeed = 12 + (charIndex * 3.7) % 18; // Slightly slower speed for longer viewing
        const charOffset = (lineIndex * 2.3 + charIndex * 1.7) % 10; // Different phase offset
        const timeVariation = binaryPhase * charSpeed + charOffset;
        
        // Use multiple layers of randomness for true independence
        const random1 = Math.sin(timeVariation) > 0;
        const random2 = Math.cos(timeVariation * 1.618) > 0; // Golden ratio for non-repeating pattern
        const random3 = Math.sin(timeVariation * 0.786 + charIndex) > 0;
        
        // Combine multiple random sources for each character
        const binaryValue = (random1 ? 1 : 0) + (random2 ? 1 : 0) + (random3 ? 1 : 0);
        displayLine += binaryValue % 2 === 0 ? '0' : '1';
      } else if (charProgress < 0.8) {
        // Extended transition phase - mix of binary and final character
        const mixPhase = (charProgress - 0.4) / 0.4;
        if (Math.random() < mixPhase) {
          displayLine += finalLine[charIndex];
        } else {
          // Independent random for transition phase too
          const charSpeed = 10 + (charIndex * 4.1) % 12;
          const timeVariation = transitionProgress * charSpeed + charIndex * 2.1 + lineIndex * 1.3;
          const randomBit = Math.sin(timeVariation) * Math.cos(timeVariation * 2.1) > 0;
          displayLine += randomBit ? '1' : '0';
        }
      } else {
        // Final character revealed
        displayLine += finalLine[charIndex];
      }
    }
    
    return displayLine;
  });
};

const renderBounceAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, bounceIntensity = 20, rotationIntensity = 0.02, scaleIntensity = 0.02, bounceSpeed = 1, lineHeight, text } = options;
  
  const speedMultiplier = bounceSpeed;
  const bounceY = Math.sin(progress * Math.PI * 4 * speedMultiplier) * bounceIntensity;
  const floatY = Math.sin(progress * Math.PI * 2 * speedMultiplier) * (bounceIntensity * 0.5);
  const rotation = Math.sin(progress * Math.PI * 3 * speedMultiplier) * rotationIntensity;
  const scale = 1 + Math.sin(progress * Math.PI * 6 * speedMultiplier) * scaleIntensity;

  // Apply binary transition effect
  const displayLines = applyBinaryTransitionToText(asciiLines, progress, text);

  ctx.save();
  ctx.translate(options.canvas.width / 2, options.canvas.height / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(0, bounceY + floatY);

  renderTextLines(ctx, displayLines, options, { lineHeight });
  
  ctx.restore();
  
  return Math.abs(Math.sin(progress * Math.PI * 4 * speedMultiplier));
};

const renderSlideFromBottomAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, lineHeight, text } = options;
  
  // Use progress directly - video duration will control the speed
  const slideProgress = Math.min(progress, 1);
  const easeOutProgress = 1 - Math.pow(1 - slideProgress, 3);
  
  const startY = options.canvas.height;
  const endY = options.canvas.height / 2; // Center the text vertically
  const currentY = startY + (endY - startY) * easeOutProgress;

  // Apply binary transition effect
  const displayLines = applyBinaryTransitionToText(asciiLines, progress, text);

  ctx.save();
  ctx.translate(options.canvas.width / 2, currentY);
  renderTextLines(ctx, displayLines, options, { lineHeight });
  
  ctx.restore();
  
  return slideProgress;
};

const renderSlideFromTopAnimation = (ctx: CanvasRenderingContext2D, asciiLines: string[], options: AnimationOptions & { lineHeight: number }) => {
  const { progress, lineHeight, text } = options;
  
  const totalHeight = asciiLines.length * lineHeight;
  // Use progress directly - video duration will control the speed
  const slideProgress = Math.min(progress, 1);
  const easeOutProgress = 1 - Math.pow(1 - slideProgress, 3);
  
  const startY = -totalHeight;
  const endY = options.canvas.height / 2; // Center the text vertically
  const currentY = startY + (endY - startY) * easeOutProgress;

  // Apply binary transition effect
  const displayLines = applyBinaryTransitionToText(asciiLines, progress, text);

  ctx.save();
  ctx.translate(options.canvas.width / 2, currentY);
  renderTextLines(ctx, displayLines, options, { lineHeight });
  
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
        // Binary flickering phase with independent timing for each character
        // Each character has its own flickering speed and offset
        const charSpeed = 10 + (charIndex * 3.7) % 15; // Different speed for each char (10-25)
        const charOffset = (lineIndex * 2.3 + charIndex * 1.7) % 10; // Different phase offset
        const timeVariation = binaryPhase * charSpeed + charOffset;
        
        // Use multiple layers of randomness for true independence
        const random1 = Math.sin(timeVariation) > 0;
        const random2 = Math.cos(timeVariation * 1.618) > 0; // Golden ratio for non-repeating pattern
        const random3 = Math.sin(timeVariation * 0.786 + charIndex) > 0;
        
        // Combine multiple random sources for each character
        const binaryValue = (random1 ? 1 : 0) + (random2 ? 1 : 0) + (random3 ? 1 : 0);
        displayLine += binaryValue % 2 === 0 ? '0' : '1';
      } else if (charProgress < 0.8) {
        // Extended transition phase - mix of binary and final character
        const mixPhase = (charProgress - 0.2) / 0.6;
        if (Math.random() < mixPhase) {
          displayLine += finalLine[charIndex];
        } else {
          // Independent random for transition phase too
          const charSpeed = 8 + (charIndex * 4.1) % 12;
          const timeVariation = transitionProgress * charSpeed + charIndex * 2.1 + lineIndex * 1.3;
          const randomBit = Math.sin(timeVariation) * Math.cos(timeVariation * 2.1) > 0;
          displayLine += randomBit ? '1' : '0';
        }
      } else {
        // Final character revealed
        displayLine += finalLine[charIndex];
      }
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
    scanlines = true,
    matrixRain = false,
    chromaticAberration = false
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

  // Add Matrix Rain effect
  if (matrixRain) {
    ctx.save();
    ctx.font = `${fontSize * 0.6}px "Courier New", monospace`;
    ctx.fillStyle = '#00FF41';
    
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columnWidth = fontSize * 1.2;
    const columns = Math.floor(canvas.width / columnWidth);
    
    // Calculate text boundaries to avoid overlap
    const textCenterY = canvas.height / 2;
    const textHeight = asciiLines.length * (fontSize * 1.125);
    const textTopY = textCenterY - textHeight / 2;
    const textBottomY = textCenterY + textHeight / 2;
    const textPadding = fontSize;
    
    for (let i = 0; i < columns; i++) {
      // Random chance for each column to have rain (creates gaps)
      const columnSeed = Math.sin(i * 12.34) * 10000;
      const randomOffset = (columnSeed - Math.floor(columnSeed)) * 1000;
      if ((progress * 100 + randomOffset) % 300 > 120) continue; // Show ~40% of columns
      
      const x = i * columnWidth + (Math.sin(i * 7.89 + progress * 3) * 5); // Slight horizontal drift
      const speed = 0.8 + (Math.sin(i * 3.45) * 0.4); // More varied, slower speeds
      const phaseOffset = Math.sin(i * 2.17) * 500;
      const offset = (progress * speed * 400 + phaseOffset) % (canvas.height + 300);
      
      const trailLength = 8 + Math.floor(Math.sin(i * 4.56) * 4); // Variable trail lengths 8-12
      
      for (let j = 0; j < trailLength; j++) {
        const y = offset - j * fontSize * 0.9;
        
        // Skip characters that would overlap with main text
        if (y > textTopY - textPadding && y < textBottomY + textPadding) {
          continue;
        }
        
        if (y > -fontSize && y < canvas.height + fontSize) {
          // More random character selection
          const timeVariation = progress * 8 + i * 2.3 + j * 1.7;
          const charSeed = Math.sin(timeVariation) * Math.cos(timeVariation * 1.6) * 1000;
          const charIndex = Math.floor((charSeed - Math.floor(charSeed)) * matrixChars.length);
          
          const alpha = Math.max(0.08, 1 - j * 0.15); // Slower fade
          ctx.globalAlpha = alpha * 0.35; // Slightly stronger than original
          
          // Only add glow to the very first character
          if (j === 0) {
            ctx.shadowColor = '#00FF41';
            ctx.shadowBlur = 4;
          } else {
            ctx.shadowBlur = 0;
          }
          
          ctx.fillText(matrixChars[charIndex], x, y);
        }
      }
    }
    ctx.restore();
  }

  // Add simple Chromatic Aberration effect (very efficient)
  if (chromaticAberration) {
    ctx.save();
    const aberrationOffset = Math.sin(progress * Math.PI * 2) * 2;
    
    // Create subtle color fringing effect
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    
    // Red fringe (shifted left and up)
    ctx.fillStyle = '#FF0040';
    ctx.fillRect(-aberrationOffset, -aberrationOffset * 0.5, canvas.width, canvas.height);
    
    // Blue fringe (shifted right and down)
    ctx.fillStyle = '#0040FF';
    ctx.fillRect(aberrationOffset, aberrationOffset * 0.5, canvas.width, canvas.height);
    
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