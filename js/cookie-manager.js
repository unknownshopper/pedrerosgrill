// Gestor de cookies para Pedreros Grill
const cookieManager = {
  // Establecer una cookie
  setCookie: function(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  
  // Obtener el valor de una cookie
  getCookie: function(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  // Eliminar una cookie
  eraseCookie: function(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
  },
  
  // Gestionar visitantes recurrentes
  handleReturningVisitor: function() {
    const visitCount = parseInt(this.getCookie('visitCount') || '0');
    const lastVisit = this.getCookie('lastVisit');
    
    // Incrementar contador de visitas
    this.setCookie('visitCount', visitCount + 1, 365);
    this.setCookie('lastVisit', new Date().toISOString(), 365);
    
    // Si es un visitante recurrente, podemos personalizar la experiencia
    if (visitCount > 0) {
      console.log('Visitante recurrente detectado');
      // Aquí podríamos mostrar un mensaje personalizado
      if (lastVisit) {
        const lastVisitDate = new Date(lastVisit);
        const daysSinceLastVisit = Math.floor((new Date() - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastVisit > 30) {
          // Mostrar mensaje para visitantes que regresan después de mucho tiempo
          this.showWelcomeBackMessage(daysSinceLastVisit);
        }
      }
    }
  },
  
  // Mostrar mensaje de bienvenida para visitantes recurrentes
  showWelcomeBackMessage: function(days) {
    // Verificar si Bootstrap está disponible
    if (typeof bootstrap !== 'undefined') {
      // Crear un elemento para mostrar el mensaje
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'welcome-back-message';
      welcomeMsg.innerHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">¡Bienvenido de nuevo!</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            Nos alegra verte de nuevo después de ${days} días. ¿En qué podemos ayudarte hoy?
          </div>
        </div>
      `;
      document.body.appendChild(welcomeMsg);
      
      // Usar Bootstrap para mostrar el toast
      const toastEl = document.querySelector('.toast');
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    } else {
      // Fallback si Bootstrap no está disponible
      console.log("Bienvenido de nuevo después de " + days + " días");
    }
  },
  
  // Inicializar la gestión de cookies
  init: function() {
    // Verificar si es necesario mostrar el banner de cookies
    if (!this.getCookie('cookieConsent')) {
      this.showCookieBanner();
    } else if (this.getCookie('cookieConsent') === 'accepted') {
      // Si ya aceptó cookies, gestionar visitante recurrente
      this.handleReturningVisitor();
    }
  },
  
  // Mostrar banner de consentimiento de cookies (obligatorio en muchos países)
  showCookieBanner: function() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="alert alert-dark alert-dismissible fade show fixed-bottom m-0" role="alert">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-9">
              Este sitio utiliza cookies para mejorar su experiencia. Al continuar navegando, acepta nuestro uso de cookies.
            </div>
            <div class="col-md-3 text-md-end mt-2 mt-md-0">
              <button id="accept-cookies" class="btn btn-primary btn-sm me-2">Aceptar</button>
              <button id="reject-cookies" class="btn btn-outline-secondary btn-sm">Rechazar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    
    // Configurar eventos para los botones
    document.getElementById('accept-cookies').addEventListener('click', () => {
      this.setCookie('cookieConsent', 'accepted', 365);
      banner.remove();
      
      // Inicializar analytics si se aceptan las cookies
      if (typeof siteAnalytics !== 'undefined') {
        siteAnalytics.init();
      }
      
      // Gestionar visitante recurrente
      this.handleReturningVisitor();
    });
    
    document.getElementById('reject-cookies').addEventListener('click', () => {
      this.setCookie('cookieConsent', 'rejected', 365);
      banner.remove();
      // Si se rechazan las cookies, no inicializamos analytics
    });
  }
};

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', function() {
  cookieManager.init();
});
