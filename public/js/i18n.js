// i18next initialization and DOM translation logic
// Requires i18next and i18nextXHRBackend via CDN

document.addEventListener('DOMContentLoaded', function () {
  // Observa cambios en el DOM para inicializar los botones de idioma tras cargar navbars dinámicamente
  var langBtnInit = false;
  function initLangSwitchers() {
    var btnDesktop = document.getElementById('lang-switcher');
    var btnMobile = document.getElementById('lang-switcher-mobile');
    if (btnDesktop) btnDesktop.onclick = handleLangSwitch;
    if (btnMobile) btnMobile.onclick = handleLangSwitch;
  }
  window.initLangSwitchers = initLangSwitchers;

  // Leer idioma guardado en localStorage, si existe
  var savedLang = localStorage.getItem('selectedLang') || 'es';
  i18next.use(i18nextXHRBackend).init({
    lng: savedLang,
    fallbackLng: 'es',
    debug: false,
    backend: {
      // Ruta absoluta desde la raíz pública para evitar problemas de subcarpetas
      loadPath: '/locales/{{lng}}.json'
    },
    interpolation: {
      escapeValue: false // Permite HTML y símbolos
    }
  }, function (err, t) {
    updateContent();
    updateLangBtnAll();
    initLangSwitchers();
  });

  // Traducir cuando i18next esté listo o cargue recursos (para cards dinámicas)
  i18next.on('initialized', function () {
    if (window.updateI18nContent) window.updateI18nContent();
  });
  i18next.on('loaded', function () {
    if (window.updateI18nContent) window.updateI18nContent();
  });

  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      // Si es el copyright, pasar el año actual como parámetro
      if (key === 'footer.copyright') {
        var year = new Date().getFullYear();
        var value = i18next.t(key, { year, defaultValue: key });
        el.innerHTML = value;
      } else {
        var value = i18next.t(key, { defaultValue: key });
        el.innerHTML = value;
      }
    });
    if (window.updateI18nContent && window.updateI18nContent !== updateContent) window.updateI18nContent();
  }
  // Language switcher (debe estar dentro del DOMContentLoaded)
  var langBtn = document.getElementById('lang-switcher');
  function updateLangBtnAll() {
    var nextLang = i18next.language === 'es' ? 'EN' : 'ES';
    var btnDesktop = document.getElementById('lang-switcher');
    var btnMobile = document.getElementById('lang-switcher-mobile');
    if (btnDesktop) btnDesktop.innerHTML = '<i class="bi bi-translate"></i> ' + nextLang;
    if (btnMobile) btnMobile.innerHTML = '<i class="bi bi-translate"></i> ' + nextLang;
    updateContent();
  }
  updateLangBtnAll();
  function handleLangSwitch() {
    var newLang = i18next.language === 'es' ? 'en' : 'es';
    // Guardar idioma en localStorage
    localStorage.setItem('selectedLang', newLang);
    i18next.changeLanguage(newLang, function (err) {
      if (err) {
        alert('No se pudo cargar el idioma: ' + newLang + '. ¿Existe locales/' + newLang + '.json?');
        return;
      }
      i18next.reloadResources([newLang], function () {
        updateContent();
        if (window.updateI18nContent) window.updateI18nContent();
        updateLangBtnAll();
      });
      updateContent();
    });
  }
  // (No agregar listeners aquí, solo en initLangSwitchers)
  i18next.on('languageChanged', updateLangBtnAll);

  // Expose for dynamic content
  window.updateI18nContent = updateContent;
  // Forzar traducción inicial si i18next ya está listo
  if (i18next.isInitialized) updateContent();
});
