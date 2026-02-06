/**
 * Extract dominant colors from an image URL
 */
export async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    // Don't use crossOrigin for same-origin images, use it for external URLs
    if (imageUrl.startsWith('http')) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      console.log('✅ Image loaded successfully, extracting colors...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        console.error('❌ Canvas context not available');
        resolve(['#9f84bd', '#c09bd8', '#ebc3db', '#ede3e9', '#e6e4ce']); // vibrant fallback
        return;
      }
      
      // Scale down for faster processing
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        const colors = extractDominantColors(imageData.data);
        
        if (colors.length === 0) {
          console.warn('⚠️ No vibrant colors extracted, using colorful fallback');
          resolve(['#9f84bd', '#c09bd8', '#ebc3db', '#ede3e9', '#e6e4ce']);
        } else {
          console.log('✅ Successfully extracted colors:', colors);
          resolve(colors);
        }
      } catch (error) {
        console.error('❌ Error extracting colors:', error);
        resolve(['#9f84bd', '#c09bd8', '#ebc3db', '#ede3e9', '#e6e4ce']); // vibrant fallback
      }
    };
    
    img.onerror = (error) => {
      console.error('❌ Failed to load image:', imageUrl, error);
      resolve(['#9f84bd', '#c09bd8', '#ebc3db', '#ede3e9', '#e6e4ce']); // vibrant fallback
    };
    
    // For GitHub avatars, ensure we're loading the image properly
    img.src = imageUrl;
  });
}

function extractDominantColors(pixels: Uint8ClampedArray): string[] {
  const colorMap = new Map<string, { count: number; r: number; g: number; b: number; saturation: number }>();
  let totalPixels = 0;
  
  // Sample pixels
  for (let i = 0; i < pixels.length; i += 8) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip fully transparent pixels
    if (a < 128) continue;
    
    // Skip very light pixels (close to white)
    if (r > 235 && g > 235 && b > 235) continue;
    
    // Skip very dark pixels (close to black)
    if (r < 20 && g < 20 && b < 20) continue;
    
    // Calculate saturation to filter out grays
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    // Skip grayscale/low saturation colors (grays, blacks, whites)
    if (saturation < 0.15) continue;
    
    totalPixels++;
    
    // Quantize colors
    const qr = Math.floor(r / 25) * 25;
    const qg = Math.floor(g / 25) * 25;
    const qb = Math.floor(b / 25) * 25;
    const key = `${qr},${qg},${qb}`;
    
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
      existing.r = Math.floor((existing.r * (existing.count - 1) + r) / existing.count);
      existing.g = Math.floor((existing.g * (existing.count - 1) + g) / existing.count);
      existing.b = Math.floor((existing.b * (existing.count - 1) + b) / existing.count);
      existing.saturation = Math.max(existing.saturation, saturation);
    } else {
      colorMap.set(key, { count: 1, r, g, b, saturation });
    }
  }
  
  console.log(`Analyzed ${totalPixels} colorful pixels, found ${colorMap.size} unique colors`);
  
  if (colorMap.size === 0) {
    console.warn('No vibrant colors found, using defaults');
    return ['#9f84bd', '#c09bd8', '#ebc3db', '#ede3e9', '#e6e4ce'];
  }
  
  // Sort by saturation first, then by frequency to prefer vibrant colors
  const sortedColors = Array.from(colorMap.values())
    .sort((a, b) => {
      // Prefer more saturated colors
      const satDiff = b.saturation - a.saturation;
      if (Math.abs(satDiff) > 0.2) return satDiff;
      // Then by frequency
      return b.count - a.count;
    })
    .filter((color, index, arr) => {
      if (index === 0) return true;
      
      // Ensure colors are distinct
      const selected = arr.slice(0, index);
      return !selected.some(s => {
        const diff = Math.abs(s.r - color.r) + Math.abs(s.g - color.g) + Math.abs(s.b - color.b);
        return diff < 80;
      });
    })
    .slice(0, 6);
  
  // Boost saturation and convert to hex
  const hexColors = sortedColors.map(color => {
    const { r, g, b } = boostSaturation(color.r, color.g, color.b, 1.4);
    return rgbToHex(r, g, b);
  });
  
  console.log('Extracted vibrant colors:', hexColors);
  
  // If we still don't have enough colors, generate variations
  if (hexColors.length < 3) {
    const baseColors = sortedColors.length > 0 ? sortedColors : [
      { r: 99, g: 102, b: 241, saturation: 0.8 }
    ];
    const variations = generateColorVariations(baseColors[0].r, baseColors[0].g, baseColors[0].b);
    return [...hexColors, ...variations].slice(0, 4);
  }
  
  return hexColors;
}

/**
 * Generate color variations from a base color
 */
function generateColorVariations(r: number, g: number, b: number): string[] {
  const variations: string[] = [];
  
  // Create a complementary hue shift
  const shifted1 = shiftHue(r, g, b, 60);
  variations.push(rgbToHex(shifted1.r, shifted1.g, shifted1.b));
  
  // Create another hue shift
  const shifted2 = shiftHue(r, g, b, -60);
  variations.push(rgbToHex(shifted2.r, shifted2.g, shifted2.b));
  
  // Lighter version
  const lighter = {
    r: Math.min(255, Math.floor(r * 1.4)),
    g: Math.min(255, Math.floor(g * 1.4)),
    b: Math.min(255, Math.floor(b * 1.4)),
  };
  variations.push(rgbToHex(lighter.r, lighter.g, lighter.b));
  
  return variations;
}

/**
 * Shift the hue of a color
 */
function shiftHue(r: number, g: number, b: number, degrees: number): { r: number; g: number; b: number } {
  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  
  if (max === min) {
    return { r, g, b }; // Grayscale
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h = 0;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }
  
  // Shift hue
  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;
  
  // Convert back to RGB
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return {
    r: Math.round(hueToRgb(p, q, h + 1/3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1/3) * 255),
  };
}

/**
 * Boost color saturation for more vibrant gradients
 */
function boostSaturation(r: number, g: number, b: number, factor: number): { r: number; g: number; b: number } {
  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  
  if (max === min) {
    return { r, g, b }; // Grayscale, no saturation
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const newS = Math.min(1, s * factor);
  
  // Convert back to RGB with boosted saturation
  const q = l < 0.5 ? l * (1 + newS) : l + newS - l * newS;
  const p = 2 * l - q;
  
  let h = 0;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }
  
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  return {
    r: Math.round(hueToRgb(p, q, h + 1/3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1/3) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Generate a CSS gradient string from colors
 */
export function createGradientBorder(colors: string[]): string {
  if (colors.length < 2) {
    return 'linear-gradient(135deg, #8b5cf6, #ec4899)';
  }
  
  // Create a smooth conic gradient for Instagram-like effect
  // Repeat the first color at the end for seamless loop
  const gradientColors = [...colors, colors[0]];
  const angleStep = 360 / colors.length;
  
  const colorStops = gradientColors.map((color, index) => {
    const angle = index * angleStep;
    return `${color} ${angle}deg`;
  }).join(', ');
  
  return `conic-gradient(from 45deg, ${colorStops})`;
}
