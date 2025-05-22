import { crx, defineManifest } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'

// https://developer.chrome.com/docs/extensions/reference/manifest
const manifest = defineManifest({
  manifest_version: 3,
  name: '__MSG_ext_name__',
  description: '__MSG_ext_desc__',
  version: '1.0.0',
  default_locale: 'en',
  permissions: ['storage'],
  host_permissions: ['*://*/issues/*'],
  icons: {
    16: 'icon.png',
    48: 'icon.png',
    128: 'icon.png',
  },
  action: {
    default_popup: 'src/popup/popup.html',
    default_icon: 'icon.png',
  },
  content_scripts: [
    {
      js: ['src/features/checkboxes/content.js'],
      matches: ['*://*/issues/*'],
    },
  ],
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [crx({ manifest })],
  // Without configuring the server, the error "WebSocket connection to 'ws://localhost/' failed" will occur.
  // https://github.com/crxjs/chrome-extension-tools/issues/746#issuecomment-1647484887
  server: {
    cors: {
      origin: [
        // ⚠️ SECURITY RISK: Allows any chrome-extension to access the vite server ⚠️
        // See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
        // I don't believe that the linked issue mentions a potential solution
        /chrome-extension:\/\//,
      ],
    },
  },
  legacy: {
    // ⚠️ SECURITY RISK: Allows WebSockets to connect to the vite server without a token check ⚠️
    // See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
    // The linked issue gives a potential fix that @crxjs/vite-plugin could implement
    skipWebSocketTokenCheck: true,
  },
})
