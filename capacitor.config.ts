import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familypay.app',
  appName: 'FamilyPay',
  webDir: 'dist',
  server: {
    url: 'https://familypay-aw26.onrender.com',
    cleartext: true
  }
};

export default config;
