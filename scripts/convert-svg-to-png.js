const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateIcons() {
  const iconsDir = path.join(__dirname, "..", "public", "icons");
  const svgPath = path.join(iconsDir, "icon.svg");

  if (!fs.existsSync(svgPath)) {
    console.error("❌ No se encontró icon.svg");
    return;
  }

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

      console.log(`✅ Generado icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generando icon-${size}x${size}.png:`, error);
    }
  }

  console.log("🎉 Todos los iconos generados exitosamente!");
}

generateIcons();
