import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";
import type { KIT_ROUTES } from "$lib/ROUTES";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { kitRoutes } from "vite-plugin-kit-routes";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    kitRoutes<KIT_ROUTES>(),
    devtoolsJson()
  ],
  test: {
    reporters: ["verbose"],
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "node",
    setupFiles: ["./src/test-setup.ts"]
  }
});
