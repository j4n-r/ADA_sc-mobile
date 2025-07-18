# sc-mobile
Sadly when installing the app the websocket and api url (http://10.0.2.2:PORT) do not work.
Running the app in expo-go works. 
Changing the URLs to the local IP address could work, but is no suitable for the presentation since the app needs to be completely recompiled (5-10 mins) with the current local IP.

## Commands
Create an emulator

```bash
avdmanager create avd --force --name android-emulator --package 'system-images;android-35;google_apis_playstore_ps16k;x86_64'
```

manually start emulatro
``` bash
emulator -avd android-emulator -no-snapshot-load
```

``` bash
npx expo-router-sitemap
```

Compile apk locally
``` bash
eas build -p android --profile preview
```

Install on android emulator
``` bash
eas build:run -p android
# or 
adb install path-to-apk.apk
```

Uninstall on android emulator
```bash
 adb uninstall com.anonymous.scmobile
```


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```
   
   
