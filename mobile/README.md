# Tourist Safety Mobile App

## Prerequisites
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed
- [Android Studio](https://developer.android.com/studio) installed and configured
- Android device or emulator set up

## Installation
1. Clone this repository:
	```sh
	git clone <repo-url>
	cd tourist-safety/mobile
	```
2. Install dependencies (use legacy peer deps to avoid conflicts):
	```sh
	npm install --legacy-peer-deps
	```

## Running the App
1. Start the Metro bundler (in Terminal 1):
	```sh
	npm start
	```
2. Build and launch the app on Android (in Terminal 2):
	```sh
	npm run android
	```

## Notes
- Make sure Android Studio is installed and the emulator/device is running before executing `npm run android`.
- For iOS, use Xcode and run `npm run ios` (macOS only).
- If you encounter dependency issues, try deleting `node_modules` and reinstalling.

## Troubleshooting
- If the app fails to build, check that your Android SDK and emulator are properly configured.
- For common React Native issues, refer to the [React Native documentation](https://reactnative.dev/docs/environment-setup).
