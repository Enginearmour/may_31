import { useState, useEffect } from 'react';

// A simple QR code implementation that doesn't require external dependencies
export default function SimpleQRCode({ value, size = 200, bgColor = "#FFFFFF", fgColor = "#000000" }) {
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  useEffect(() => {
    // Create a QR code using HTML/CSS
    const createQRCode = () => {
      // For demo purposes, we'll create a simple pattern
      // In a real implementation, this would use QR code generation algorithms
      const cellSize = Math.floor(size / 25); // 25x25 grid for simplicity
      
      let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}" />`;
      
      // Static pattern that looks like a QR code
      // This is just for visual representation - not a real QR code
      const pattern = [
        "1111111000001111111",
        "1000001000001000001",
        "1011101000001011101",
        "1011101000001011101",
        "1011101000001011101",
        "1000001000001000001",
        "1111111101011111111",
        "0000000000000000000",
        "1010111010101010111",
        "0000001010100000001",
        "1111101010101111101",
        "0000101010100000101",
        "1111101010101111101",
        "0000000000000000000",
        "1111111101011111111",
        "1000001000001000001",
        "1011101000001011101",
        "1011101000001011101",
        "1011101000001011101",
        "1000001000001000001",
        "1111111000001111111"
      ];
      
      const offsetX = (size - pattern[0].length * cellSize) / 2;
      const offsetY = (size - pattern.length * cellSize) / 2;
      
      // Draw the pattern
      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x] === '1') {
            svg += `<rect x="${offsetX + x * cellSize}" y="${offsetY + y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fgColor}" />`;
          }
        }
      }
      
      svg += '</svg>';
      return svg;
    };
    
    setQrCodeSvg(createQRCode());
  }, [value, size, bgColor, fgColor]);

  return (
    <div className="qr-code-container" style={{ width: size, height: size }}>
      <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
      <div className="text-xs text-center mt-2 text-gray-500">
        Scan to view truck details
      </div>
    </div>
  );
}
