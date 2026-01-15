export const consentTranslations = {
  en: {
    title: "Your table, your choice",
    description: "We use cookies to enhance your experience and understand how you found us. You can customize your preferences below.",
    acceptAll: "Accept all",
    rejectAll: "Decline",
    managePreferences: "Preferences",
    savePreferences: "Save preferences",
    close: "Close",
    showDetails: "Show details",
    hideDetails: "Hide details",
    categories: {
      necessary: {
        title: "Essential",
        description: "Required for reservations and basic site functionality. Always enabled.",
      },
      analytics: {
        title: "Analytics",
        description: "Help us understand how guests find and navigate our site (Google Analytics).",
      },
      functional: {
        title: "Functional",
        description: "Enable enhanced features like reservation widgets and personalized content.",
      },
      advertising: {
        title: "Advertising",
        description: "Allow Google Ads to measure campaign performance and show relevant ads.",
      },
    },
    privacyLink: "Privacy Policy",
  },
  pt: {
    title: "A sua mesa, a sua escolha",
    description: "Utilizamos cookies para melhorar a sua experiência e perceber como nos encontrou. Pode personalizar as suas preferências abaixo.",
    acceptAll: "Aceitar todos",
    rejectAll: "Recusar",
    managePreferences: "Preferências",
    savePreferences: "Guardar preferências",
    close: "Fechar",
    showDetails: "Ver detalhes",
    hideDetails: "Ocultar detalhes",
    categories: {
      necessary: {
        title: "Essenciais",
        description: "Necessários para reservas e funcionalidades básicas do site. Sempre ativos.",
      },
      analytics: {
        title: "Analíticos",
        description: "Ajudam-nos a perceber como os visitantes encontram e navegam no nosso site (Google Analytics).",
      },
      functional: {
        title: "Funcionais",
        description: "Permitem funcionalidades melhoradas como widgets de reserva e conteúdo personalizado.",
      },
      advertising: {
        title: "Publicidade",
        description: "Permite ao Google Ads medir o desempenho das campanhas e mostrar anúncios relevantes.",
      },
    },
    privacyLink: "Política de Privacidade",
  },
  de: {
    title: "Ihr Tisch, Ihre Wahl",
    description: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und zu verstehen, wie Sie uns gefunden haben. Sie können Ihre Einstellungen unten anpassen.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Ablehnen",
    managePreferences: "Einstellungen",
    savePreferences: "Einstellungen speichern",
    close: "Schließen",
    showDetails: "Details anzeigen",
    hideDetails: "Details verbergen",
    categories: {
      necessary: {
        title: "Notwendig",
        description: "Erforderlich für Reservierungen und grundlegende Website-Funktionen. Immer aktiviert.",
      },
      analytics: {
        title: "Analytisch",
        description: "Helfen uns zu verstehen, wie Gäste unsere Website finden und nutzen (Google Analytics).",
      },
      functional: {
        title: "Funktional",
        description: "Ermöglichen erweiterte Funktionen wie Reservierungs-Widgets und personalisierte Inhalte.",
      },
      advertising: {
        title: "Werbung",
        description: "Ermöglicht Google Ads, die Kampagnenleistung zu messen und relevante Anzeigen zu zeigen.",
      },
    },
    privacyLink: "Datenschutzrichtlinie",
  },
  it: {
    title: "Il tuo tavolo, la tua scelta",
    description: "Utilizziamo i cookie per migliorare la tua esperienza e capire come ci hai trovato. Puoi personalizzare le tue preferenze qui sotto.",
    acceptAll: "Accetta tutti",
    rejectAll: "Rifiuta",
    managePreferences: "Preferenze",
    savePreferences: "Salva preferenze",
    close: "Chiudi",
    showDetails: "Mostra dettagli",
    hideDetails: "Nascondi dettagli",
    categories: {
      necessary: {
        title: "Essenziali",
        description: "Necessari per le prenotazioni e le funzionalità di base del sito. Sempre attivi.",
      },
      analytics: {
        title: "Analitici",
        description: "Ci aiutano a capire come gli ospiti trovano e navigano nel nostro sito (Google Analytics).",
      },
      functional: {
        title: "Funzionali",
        description: "Abilitano funzionalità avanzate come widget di prenotazione e contenuti personalizzati.",
      },
      advertising: {
        title: "Pubblicità",
        description: "Consente a Google Ads di misurare le prestazioni delle campagne e mostrare annunci pertinenti.",
      },
    },
    privacyLink: "Informativa sulla Privacy",
  },
  es: {
    title: "Tu mesa, tu elección",
    description: "Utilizamos cookies para mejorar tu experiencia y entender cómo nos encontraste. Puedes personalizar tus preferencias a continuación.",
    acceptAll: "Aceptar todas",
    rejectAll: "Rechazar",
    managePreferences: "Preferencias",
    savePreferences: "Guardar preferencias",
    close: "Cerrar",
    showDetails: "Ver detalles",
    hideDetails: "Ocultar detalles",
    categories: {
      necessary: {
        title: "Esenciales",
        description: "Necesarias para reservas y funcionalidad básica del sitio. Siempre activas.",
      },
      analytics: {
        title: "Analíticas",
        description: "Nos ayudan a entender cómo los visitantes encuentran y navegan por nuestro sitio (Google Analytics).",
      },
      functional: {
        title: "Funcionales",
        description: "Permiten funciones mejoradas como widgets de reserva y contenido personalizado.",
      },
      advertising: {
        title: "Publicidad",
        description: "Permite a Google Ads medir el rendimiento de las campañas y mostrar anuncios relevantes.",
      },
    },
    privacyLink: "Política de Privacidad",
  },
};

export type ConsentLocale = keyof typeof consentTranslations;
export type ConsentTranslation = typeof consentTranslations.en;
