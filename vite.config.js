import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const injectToken = (proxy) => {
    proxy.on("proxyReq", (proxyReq) => {
      if (env.RIOT_API_KEY) {
        proxyReq.setHeader("X-Riot-Token", env.RIOT_API_KEY);
      }
    });
  };

  return {
    plugins: [vue()],
    server: {
      proxy: {
        "/api-americas": {
          target: "https://americas.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-americas/, ""),
          configure: injectToken,
        },
        "/api-la1": {
          target: "https://la1.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-la1/, ""),
          configure: injectToken,
        },
        "/api-la2": {
          target: "https://la2.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-la2/, ""),
          configure: injectToken,
        },
        "/api-europe": {
          target: "https://europe.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-europe/, ""),
          configure: injectToken,
        },
        "/api-asia": {
          target: "https://asia.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-asia/, ""),
          configure: injectToken,
        },
        "/api-euw1": {
          target: "https://euw1.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-euw1/, ""),
          configure: injectToken,
        },
        "/api-eun1": {
          target: "https://eun1.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-eun1/, ""),
          configure: injectToken,
        },
        "/api-na1": {
          target: "https://na1.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-na1/, ""),
          configure: injectToken,
        },
        "/api-br1": {
          target: "https://br1.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-br1/, ""),
          configure: injectToken,
        },
        "/api-kr": {
          target: "https://kr.api.riotgames.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api-kr/, ""),
          configure: injectToken,
        },
      },
    },
  };
});
