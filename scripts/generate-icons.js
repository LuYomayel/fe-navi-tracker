const fs = require("fs");
const path = require("path");

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG base del icono
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#gradient)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="white">NT</text>
  <circle cx="256" cy="150" r="60" fill="white" opacity="0.9"/>
  <path d="M226 130 L256 160 L286 130" stroke="url(#gradient)" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Tamaños de iconos necesarios
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generar archivo SVG
fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgIcon);

// Crear archivos placeholder PNG (en un entorno real usarías una librería como sharp)
sizes.forEach((size) => {
  const pngPlaceholder = `<!-- Placeholder para icon-${size}x${size}.png -->
<!-- En producción, convierte el SVG a PNG usando herramientas como sharp o imagemagick -->
<!-- Comando: convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png -->`;

  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.png.placeholder`),
    pngPlaceholder
  );
});

console.log("✅ Iconos generados en public/icons/");
console.log("📝 Para generar los PNG reales, usa ImageMagick o sharp:");
console.log("   npm install sharp");
console.log("   node scripts/convert-svg-to-png.js");
