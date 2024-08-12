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
  // serverの設定をしないと WebSocket connection to 'ws://localhost/' failed:  というエラーが出る
  // https://github.com/crxjs/chrome-extension-tools/issues/746#issuecomment-1647484887
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
    },
  },
  build: {
    // Base64 URLへのインライン化を無効にする
    assetsInlineLimit: 0,
  },
})
