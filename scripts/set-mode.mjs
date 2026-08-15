import fs from "fs";
import path from "path";

const cwd = process.cwd();
const envLocalPath = path.join(cwd, ".env.local");

const mode = process.argv[2];

if (!mode || (mode !== "gh-pages" && mode !== "domain")) {
  console.log("Usage: node scripts/set-mode.mjs [gh-pages|domain]");
  process.exit(1);
}

let envContent = "";
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, "utf-8");
}

let newBasePath = "/shopdocauchitoanfishing";
if (mode === "domain") {
  newBasePath = "";
}

let updatedContent = "";
if (envContent.includes("NEXT_PUBLIC_BASE_PATH=")) {
  updatedContent = envContent.replace(
    /NEXT_PUBLIC_BASE_PATH=.*/g,
    `NEXT_PUBLIC_BASE_PATH=${newBasePath}`,
  );
} else {
  updatedContent =
    envContent.trim() + `\nNEXT_PUBLIC_BASE_PATH=${newBasePath}\n`;
}

fs.writeFileSync(envLocalPath, updatedContent, "utf-8");

console.log(`\n✅ Đã chuyển đổi chế độ deployment thành thành công!`);
console.log(
  `📌 Chế độ: ${mode === "domain" ? "🌐 Tên miền riêng (Custom Domain)" : "🐙 GitHub Pages"}`,
);
console.log(`🔗 NEXT_PUBLIC_BASE_PATH = "${newBasePath}"`);
console.log(`💡 File .env.local đã được cập nhật.\n`);
