import { ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const bundleIdentifier = IS_DEV
  ? "io.apuyou.mobilecode.dev"
  : "io.apuyou.mobilecode";

const config: ExpoConfig = {
  name: IS_DEV ? "MobileCode Dev" : "MobileCode",
  slug: "mobilecode",
  version: "0.3.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mobilecode",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    edgeToEdgeEnabled: true,
    package: bundleIdentifier,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "333fd236-e054-466d-8b1a-81a16213d955",
    },
  },
  owner: "apuyou",
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    fallbackToCacheTimeout: 3000,
    url: "https://u.expo.dev/333fd236-e054-466d-8b1a-81a16213d955",
  },
};

export default { expo: config };
