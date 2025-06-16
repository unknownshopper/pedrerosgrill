// Objeto para almacenar datos de análisis
const siteAnalytics = {
  // Información de la sesión
  sessionStart: new Date(),
  pageViews: [],
  interactions: [],
  
  // Recopilar información básica del navegador
  collectBrowserInfo: function() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      referrer: document.referrer || 'direct'
    };
  },
  
  // Registrar una vista de página
  logPageView: function() {
    this.pageViews.push({
      page: window.location.pathname,
      title: document.title,
      timestamp: new Date()
    });
    
    // Guardar en localStorage para persistencia
    this.saveToStorage();
  },
  
  // Registrar interacciones (clics en elementos importantes)
  trackInteraction: function(element, type) {
    this.interactions.push({
      element: element,
      type: type,
      timestamp: new Date()
    });
    
    this.saveToStorage();
  },
  
  // Guardar datos en localStorage
  saveToStorage: function() {
    const analyticsData = {
      browserInfo: this.collectBrowserInfo(),
      sessionStart: this.sessionStart,
      pageViews: this.pageViews,
      interactions: this.interactions
    };
    
    localStorage.setItem('pedrerosAnalytics', JSON.stringify(analyticsData));
  },
  
  // Inicializar el seguimiento
  init: function() {
    // Cargar datos existentes si los hay
    const existingData = localStorage.getItem('pedrerosAnalytics');
    if (existingData) {
      try {
        const parsedData = JSON.parse(existingData);
        this.pageViews = parsedData.pageViews || [];
        this.interactions = parsedData.interactions || [];
      } catch (e) {
        console.error("Error parsing analytics data", e);
        localStorage.removeItem('pedrerosAnalytics');
      }
    }
    
    // Registrar vista de página actual
    this.logPageView();
    
    // Configurar seguimiento de eventos
    this.setupEventTracking();
  },
  
  // Configurar seguimiento de eventos importantes
  setupEventTracking: function() {
    // Seguimiento de clics en botones de llamada a la acción
    document.querySelectorAll('.btn-primary').forEach(button => {
      button.addEventListener('click', () => {
        this.trackInteraction(button.textContent, 'button_click');
      });
    });
    
    // Seguimiento de envíos de formulario
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        this.trackInteraction('form_' + (form.id || form.name || 'unknown'), 'form_submit');
      });
    });
    
    // Seguimiento de desplazamiento profundo
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercentage = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        if (maxScroll % 25 === 0) { // Registrar cada 25% de desplazamiento
          this.trackInteraction('scroll_depth', maxScroll + '%');
        }
      }
    });
  },
  
  // Obtener datos recopilados (para uso del administrador)
  getAnalyticsData: function() {
    const data = localStorage.getItem('pedrerosAnalytics');
    return data ? JSON.parse(data) : null;
  },
  
  // Limpiar datos recopilados
  clearAnalyticsData: function() {
    localStorage.removeItem('pedrerosAnalytics');
    this.pageViews = [];
    this.interactions = [];
    this.sessionStart = new Date();
  }
};

// Iniciar seguimiento cuando la página esté cargada
document.addEventListener('DOMContentLoaded', function() {
  // Solo inicializar si el usuario ha aceptado cookies
  if (document.cookie.indexOf('cookieConsent=accepted') !== -1) {
    siteAnalytics.init();
  }
});
