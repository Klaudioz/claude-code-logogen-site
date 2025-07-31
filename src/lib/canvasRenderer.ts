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

export interface AnimationOptions extends RenderOptions {
  progress: number; // 0 to 1
  bounceIntensity?: number;
  rotationIntensity?: number;
  scaleIntensity?: number;
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

export const renderAnimatedASCII = (options: AnimationOptions): void => {
  const {
    canvas,
    text,
    progress,
    fontSize = 16,
    color = '#D97757',
    backgroundColor = '#000000',
    shadow = true,
    shadowBlur = 10,
    shadowColor = 'rgba(217, 119, 87, 0.5)',
    bounceIntensity = 20,
    rotationIntensity = 0.02,
    scaleIntensity = 0.02
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

  // Calculate animation effects
  const bounceY = Math.sin(progress * Math.PI * 4) * bounceIntensity;
  const floatY = Math.sin(progress * Math.PI * 2) * (bounceIntensity * 0.5);
  const rotation = Math.sin(progress * Math.PI * 3) * rotationIntensity;
  const scale = 1 + Math.sin(progress * Math.PI * 6) * scaleIntensity;

  // Setup text rendering
  ctx.font = `${fontSize}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  if (shadow) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
  }

  // Determine alignment
  const hasMultipleTextLines = text.includes('\\n') || text.includes('\n');
  const lineHeight = fontSize * 1.125;
  const startY = -(asciiLines.length * lineHeight) / 2;

  // Apply transformations
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(0, bounceY + floatY);

  // Render ASCII art with proper alignment
  asciiLines.forEach((line, index) => {
    let x: number;
    if (hasMultipleTextLines) {
      // Left-align for multi-line text
      const maxLineWidth = Math.max(...asciiLines.map(l => ctx.measureText(l).width));
      x = -maxLineWidth / 2;
      ctx.textAlign = 'left';
    } else {
      // Center for single line
      x = 0;
      ctx.textAlign = 'center';
    }
    
    const y = startY + (index * lineHeight);
    ctx.fillText(line || '\u00A0', x, y);
  });

  ctx.restore();
  
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