import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// בנייה לקובץ HTML יחיד שנפתח בכל דפדפן בלי שרת
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: "./",
  build: { target: "es2022", assetsInlineLimit: 100000000, cssCodeSplit: false },
});
