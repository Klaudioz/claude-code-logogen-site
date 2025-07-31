import { asciiFont } from './font';

export const generateASCIILines = (inputText: string): string[] => {
  const processedText = inputText.replace(/\\n/g, '\n');
  const lines = processedText.split('\n');
  
  if (lines.length > 10) {
    throw new Error('Maximum 10 lines allowed. Please reduce your text.');
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
    
    allGeneratedLines.push(...lineChars);
    
    if (lineIndex < lines.length - 1) {
      allGeneratedLines.push('');
    }
  });
  
  return allGeneratedLines;
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};