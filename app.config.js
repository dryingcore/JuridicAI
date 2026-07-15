// Expo SDK 49+ carrega o .env automaticamente antes de avaliar este arquivo.
// Não é necessário importar 'dotenv/config' manualmente.

const maritacaApiKey = process.env.EXPO_PUBLIC_MARITACA_API_KEY;
console.log('[app.config.js] EXPO_PUBLIC_MARITACA_API_KEY carregada:', maritacaApiKey ? '✅ OK' : '❌ VAZIA');

export default {
  expo: {
    name: "JuridicAI",
    slug: "JuridicAI",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.juridicai.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      maritacaApiKey: maritacaApiKey,
      eas: {
        projectId: "7adda713-5da3-44f1-b654-1f423b0f164a",
      },
    },
    owner: "dryingcore",
  },
};
