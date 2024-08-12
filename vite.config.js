import { crx, defineManifest } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'

// https://developer.chrome.com/docs/extensions/reference/manifest
const manifest = defineManifest({
  manifest_version: 3,
  name: 'CRXJS Vanilla JS Example',
  version: '1.0.0',
  action: {
    default_popup: 'index.html',
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [crx({ manifest })],
  // Without configuring the server, the error "WebSocket connection to 'ws://localhost/' failed" will occur.
  // https://github.com/crxjs/chrome-extension-tools/issues/746#issuecomment-1647484887
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
    },
  },
  build: {
    // Disable inlining to Base64 URLs.
    assetsInlineLimit: 0,
  },
})
