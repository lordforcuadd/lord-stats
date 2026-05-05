import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api-americas": {
        target: "https://americas.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-americas/, ""),
      },
      "/api-europe": {
        target: "https://europe.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-europe/, ""),
      },
      "/api-asia": {
        target: "https://asia.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-asia/, ""),
      },
      "/api-la1": {
        target: "https://la1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-la1/, ""),
      },
      "/api-la2": {
        target: "https://la2.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-la2/, ""),
      },
      "/api-euw1": {
        target: "https://euw1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-euw1/, ""),
      },
      "/api-eun1": {
        target: "https://eun1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-eun1/, ""),
      },
      "/api-na1": {
        target: "https://na1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-na1/, ""),
      },
      "/api-br1": {
        target: "https://br1.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-br1/, ""),
      },
      "/api-kr": {
        target: "https://kr.api.riotgames.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-kr/, ""),
      },
    },
  },
});
