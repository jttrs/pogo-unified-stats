// vite.config.js
import { defineConfig } from "file:///C:/Users/torre/Dropbox/Hobbies/Coding/pogo-unified-stats/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/torre/Dropbox/Hobbies/Coding/pogo-unified-stats/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3e3,
    proxy: {
      // Proxy GitHub raw content for PVPoke repository  
      "/api/pvpoke-github": {
        target: "https://raw.githubusercontent.com/pvpoke/pvpoke/master",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pvpoke-github/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("\u{1F310} Proxying PVPoke repository request:", req.url);
          });
        }
      },
      // Proxy GitHub raw content for PokeMiners repository
      "/api/pokeminers": {
        target: "https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pokeminers/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("\u{1F310} Proxying PokeMiners repository request:", req.url);
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0b3JyZVxcXFxEcm9wYm94XFxcXEhvYmJpZXNcXFxcQ29kaW5nXFxcXHBvZ28tdW5pZmllZC1zdGF0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdG9ycmVcXFxcRHJvcGJveFxcXFxIb2JiaWVzXFxcXENvZGluZ1xcXFxwb2dvLXVuaWZpZWQtc3RhdHNcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3RvcnJlL0Ryb3Bib3gvSG9iYmllcy9Db2RpbmcvcG9nby11bmlmaWVkLXN0YXRzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC8vIFByb3h5IEdpdEh1YiByYXcgY29udGVudCBmb3IgUFZQb2tlIHJlcG9zaXRvcnkgIFxyXG4gICAgICAnL2FwaS9wdnBva2UtZ2l0aHViJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9wdnBva2UvcHZwb2tlL21hc3RlcicsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9wdnBva2UtZ2l0aHViLywgJycpLFxyXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdURGMTAgUHJveHlpbmcgUFZQb2tlIHJlcG9zaXRvcnkgcmVxdWVzdDonLCByZXEudXJsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgLy8gUHJveHkgR2l0SHViIHJhdyBjb250ZW50IGZvciBQb2tlTWluZXJzIHJlcG9zaXRvcnlcclxuICAgICAgJy9hcGkvcG9rZW1pbmVycyc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vUG9rZU1pbmVycy9nYW1lX21hc3RlcnMvbWFzdGVyL2xhdGVzdCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9wb2tlbWluZXJzLywgJycpLFxyXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdURGMTAgUHJveHlpbmcgUG9rZU1pbmVycyByZXBvc2l0b3J5IHJlcXVlc3Q6JywgcmVxLnVybCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pICJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1csU0FBUyxvQkFBb0I7QUFDclksT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLHNCQUFzQjtBQUFBLFFBQ3BCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSx5QkFBeUIsRUFBRTtBQUFBLFFBQzNELFdBQVcsQ0FBQyxPQUFPLFlBQVk7QUFDN0IsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFFBQVE7QUFDM0Msb0JBQVEsSUFBSSxpREFBMEMsSUFBSSxHQUFHO0FBQUEsVUFDL0QsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLG1CQUFtQjtBQUFBLFFBQ2pCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxzQkFBc0IsRUFBRTtBQUFBLFFBQ3hELFdBQVcsQ0FBQyxPQUFPLFlBQVk7QUFDN0IsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFFBQVE7QUFDM0Msb0JBQVEsSUFBSSxxREFBOEMsSUFBSSxHQUFHO0FBQUEsVUFDbkUsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
