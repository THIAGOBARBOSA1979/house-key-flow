import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  pt: {
    translation: {
      common: {
        error_title: "Sincronização Interrompida",
        error_description: "Detectamos uma instabilidade no protocolo de carregamento. Verifique sua conexão estratégica e tente novamente.",
        retry: "Reiniciar Protocolo",
        empty_title: "Repositório Digital Vazio",
        empty_description: "Nenhum protocolo ou registro estratégico foi localizado nesta coordenada.",
        restart: "Recomeçar",
        search: "Sincronização global...",
        no_results: "Nenhum protocolo localizado",
        loading: "Carregando protocolo...",
      },
    },
  },
  en: {
    translation: {
      common: {
        error_title: "Sync Interrupted",
        error_description: "We detected an instability in the loading protocol. Please check your strategic connection and try again.",
        retry: "Restart Protocol",
        empty_title: "Empty Digital Repository",
        empty_description: "No strategic protocol or record was located at this coordinate.",
        restart: "Restart",
        search: "Global synchronization...",
        no_results: "No protocols located",
        loading: "Loading protocol...",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pt",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
