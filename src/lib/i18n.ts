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
        error_action: "Sincronizar Dados",
        empty_title: "Repositório Digital Vazio",
        empty_description: "Nenhum protocolo ou registro estratégico foi localizado nesta coordenada.",
        restart: "Recomeçar",
        search: "Sincronização global...",
        no_results: "Nenhum protocolo localizado",
        loading: "Carregando protocolo...",
        showing: "Mostrando",
        to: "a",
        of: "de",
        records: "registros",
        quick_actions: "Ações Rápidas",
        quick_launcher_title: "Centro de Comando Estratégico",
        quick_launcher_placeholder: "Defina sua próxima ação operacional...",
        no_actions: "Nenhuma diretriz de ação localizada",
        home: "Voltar ao Início",
      },
    },
  },
  en: {
    translation: {
      common: {
        error_title: "Sync Interrupted",
        error_description: "We detected an instability in the loading protocol. Please check your strategic connection and try again.",
        retry: "Restart Protocol",
        error_action: "Sync Data",
        empty_title: "Empty Digital Repository",
        empty_description: "No strategic protocol or record was located at this coordinate.",
        restart: "Restart",
        search: "Global synchronization...",
        no_results: "No protocols located",
        loading: "Loading protocol...",
        showing: "Showing",
        to: "to",
        of: "of",
        records: "records",
        quick_actions: "Quick Actions",
        quick_launcher_title: "Strategic Command Center",
        quick_launcher_placeholder: "Define your next operational action...",
        no_actions: "No action guidelines located",
        home: "Back to Home",
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


