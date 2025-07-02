const { join } = require("path");
const {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} = require("fs");

const publicDestDir = ".next/standalone";
const src = join(process.cwd(), "public");
const dest = join(process.cwd(), publicDestDir, "public");

const copyRecursive = (srcDir, destDir) => {
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  for (const item of readdirSync(srcDir)) {
    const srcPath = join(srcDir, item);
    const destPath = join(destDir, item);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
};

copyRecursive(src, dest);
console.log("✅ Public assets copied to", dest);
