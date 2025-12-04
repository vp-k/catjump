import { defineConfig } from 'vite';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

// Firebase 설정을 Service Worker용 파일로 생성하는 플러그인
function generateFirebaseConfig() {
  return {
    name: 'generate-firebase-config',
    buildStart() {
      const config = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.VITE_FIREBASE_APP_ID || '',
      };

      const content = `// Auto-generated Firebase config for Service Worker
// DO NOT EDIT - This file is generated during build
self.__FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 2)};
`;
      writeFileSync('public/firebase-config.js', content);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [generateFirebaseConfig()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@managers': resolve(__dirname, 'src/managers'),
      '@config': resolve(__dirname, 'src/config'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@services': resolve(__dirname, 'src/services'),
    },
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
