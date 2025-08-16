# SC Mobile

## Team Members:
| Name | Matriculation Number |
|------|---------------------|
| Jan Rueggeberg | 77212019358 |

A React Native chat application built with Expo, featuring real-time messaging, offline support, and cross-platform compatibility.

## Features

- **Real-time Chat**: WebSocket-based messaging with instant delivery
- **Offline Support**: Local SQLite database with Drizzle ORM for offline message storage
- **Cross-platform**: Runs on iOS, Android, and web
- **User Authentication**: Secure login system with session management
- **Responsive UI**: Native mobile experience with TailwindCSS styling
- **Message History**: Persistent chat history with local caching

## Tech Stack

- **Framework**: React Native with Expo (SDK 52)
- **Navigation**: Expo Router with TypeScript typed routes
- **Database**: SQLite with Drizzle ORM
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Real-time**: WebSocket connections
- **State Management**: React Query for server state
- **Authentication**: Access Token through sc-admin backend
- **Development**: TypeScript, ESLint, Prettier

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## APK
The APK build can be found in `dist/` is in configured with:
``` json
{
  "EXPO_PUBLIC_API_BASE_URL": "http://127.0.0.1:5000",
  "EXPO_PUBLIC_WS_BASE_URL": "ws://127.0.0.1:8080"
}
```
Also chekout [known issues](#known-issues).

## Development

### Start the development server:

```bash
npm start
# or
npx expo start
#or
npx expo run:android
```

### Platform-specific development:

```bash
# iOS (requires macOS)
npm run ios

# Android
npm run android

# Web
npm run web
```

## Building for Production

### Local APK build:

```bash
eas build -p android --profile preview
```

### Install on Android emulator:

```bash
eas build:run -p android
# or
adb install path-to-apk.apk
```

## Android Emulator Setup

### Create a new emulator:

```bash
avdmanager create avd --force --name android-emulator --package 'system-images;android-35;google_apis_playstore_ps16k;x86_64'
```

### Start emulator manually:

```bash
emulator -avd android-emulator -no-snapshot-load
```

### Uninstall app from emulator:

```bash
adb uninstall com.anonymous.scmobile
kk1```

## Project Structure

```
app/                    # App screens and navigation
├── (tabs)/            # Tab-based navigation
├── chat.tsx           # Chat screen with WebSocket functionality
├── login.tsx          # Authentication screen
└── _layout.tsx        # Root layout

components/            # Reusable UI components
├── ScreenContent.tsx  # Screen content wrapper
└── TabBarIcon.tsx     # Tab bar icons

db/                    # Database layer
├── client.ts          # Database client setup
├── operations.ts      # Database operations
├── queries.ts         # Database queries
└── schema.ts          # Drizzle schema definitions

utils/                 # Utility functions
├── api.ts             # API client functions
├── auth.ts            # Authentication utilities

assets/                # Static assets (images, icons)
```

## Known Issues

### Network Configuration

- WebSocket connections may not work with the default `10.0.2.2` localhost address on physical devices
- For presentation/demo purposes, you may need to use your local IP address instead
- This requires rebuilding the app (5-10 minutes) with the updated IP address
- Consider using Expo Go for development to avoid this issue

### Workarounds

- Use Expo Go for development and testing
- For production builds, ensure proper network configuration for your deployment environment

## Environment Variables

```bash
EXPO_PUBLIC_API_BASE_URL=your_api_url
EXPO_PUBLIC_WS_BASE_URL=your_websocket_url
```

## Scripts Reference

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Check code quality
- `npm run format` - Fix formatting and linting issues
- `npx expo-router-sitemap` - Generate sitemap for web

