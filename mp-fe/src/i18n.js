// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to MUSICLOUD",
      login: "Login",
      signup: "Sign Up",
      // Add more translations
    },
  },
  ro: {
    translation: {
      welcome: "Bine ați venit la MUSICLOUD",
      login: "Autentificare",
      signup: "Înregistrare",
      // Add more translations
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ro",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
