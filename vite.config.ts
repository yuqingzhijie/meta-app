import vue from "@vitejs/plugin-vue";
import { VantResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  return {
    base: isProd ? "/meta-app/" : "/",
    plugins: [
      vue(),
      Components({
        resolvers: [VantResolver()]
      })
    ],
    server: {
      host: "0.0.0.0",
      port: 5173
    }
  };
});
