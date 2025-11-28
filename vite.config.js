// import { defineConfig } from "vite";

// //export default defineConfig({});
// export default {
//   server: {
//     host: "127.0.0.1",
//     port: 5173
//   }
// };

import { defineConfig } from "vite";

export default defineConfig({
  base: "/Spotify/",   // nome EXATO do repositório
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
