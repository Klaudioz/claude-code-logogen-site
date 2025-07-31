import { asciiFont } from './font';

export const generateASCIILines = (inputText: string): string[] => {
  const processedText = inputText.replace(/\\n/g, '\n');
  const lines = processedText.split('\n');
  
  if (lines.length > 5) {
    throw new Error('Maximum 5 lines allowed. Please reduce your text.');
  }
  
  // Check horizontal length for each line
  lines.forEach((line, index) => {
    if (line.length > 15) {
      throw new Error(`Line ${index + 1} is too long (${line.length} characters). Maximum 15 characters per line.`);
    }
  });
  
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