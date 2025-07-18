import { ExpoConfig, ConfigContext } from 'expo/config';

// Your custom config for API URLs
export const customConfig = {
  API_BASE_URL: 'http://10.0.2.2:5000',
  WS_BASE_URL: 'ws://10.0.2.2:8080',
};

// The main Expo config function
export default ({ config }: ConfigContext): ExpoConfig => ({
  // This is the base config, don't remove it.
  ...config,

  // === All settings from your app.json go here ===
  name: 'sc-mobile',
  owner: 'j4n-r',
  slug: 'sc-mobile',
  version: '1.0.0',
  scheme: 'sc-mobile',
  newArchEnabled: true,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    // It's good practice to add the bundleIdentifier here
    bundleIdentifier: 'com.anonymous.scmobile',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    // This is the package name Expo was asking for
    package: 'com.anonymous.scmobile',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-sqlite'],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },

  extra: {
    // This makes your customConfig available in the app
    ...customConfig,
    eas: {
      projectId: 'd546bf38-9bd7-4714-b315-c5c1b780bad0',
    },
  },
});
