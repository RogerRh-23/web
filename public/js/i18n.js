// i18next initialization and DOM translation logic
// Requires i18next and i18nextXHRBackend via CDN

document.addEventListener('DOMContentLoaded', function () {
  // Observa cambios en el DOM para inicializar los botones de idioma tras cargar navbars dinámicamente
  var langBtnInit = false;
  // function initLangSwitchers() {
  //   var btnDesktop = document.getElementById('lang-switcher');
  //   var btnMobile = document.getElementById('lang-switcher-mobile');
  //   if (btnDesktop) {
  //     btnDesktop.onclick = handleLangSwitch;
  //   }
  //   if (btnMobile) {
  //     btnMobile.onclick = handleLangSwitch;
  //   }
  // }
  // (MutationObserver desactivado para descartar ciclos infinitos)
  // Inicializa por si ya están presentes
  // setTimeout(function () {
  //   updateLangBtnAll();
  //   initLangSwitchers();
  // }, 300);
  i18next.use(i18nextXHRBackend).init({
    lng: 'es',
    fallbackLng: 'es',
    debug: false,
    backend: {
      loadPath: './locales/{{lng}}.json'
    }
  }, function (err, t) {
    updateContent();
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
      var value = i18next.t(key, { defaultValue: key });
      el.innerText = value;
      console.log('Clave:', key, '| Valor:', value, '| Idioma:', i18next.language);
    });
    if (window.updateI18nContent && window.updateI18nContent !== updateContent) window.updateI18nContent();
    console.log('Idioma actual (updateContent):', i18next.language);
  }
  // Language switcher (debe estar dentro del DOMContentLoaded)
  var langBtn = document.getElementById('lang-switcher');
  function updateLangBtnAll() {
    var nextLang = i18next.language === 'es' ? 'EN' : 'ES';
    var btnDesktop = document.getElementById('lang-switcher');
    var btnMobile = document.getElementById('lang-switcher-mobile');
    if (btnDesktop) btnDesktop.innerHTML = '<i class="bi bi-translate"></i> ' + nextLang;
    if (btnMobile) btnMobile.innerHTML = '<i class="bi bi-translate"></i> ' + nextLang;
  }
  updateLangBtnAll();
  function handleLangSwitch() {
    var newLang = i18next.language === 'es' ? 'en' : 'es';
    console.log('Cambiando idioma a:', newLang);
    i18next.changeLanguage(newLang, function (err) {
      if (err) {
        alert('No se pudo cargar el idioma: ' + newLang + '. ¿Existe locales/' + newLang + '.json?');
        return;
      }
      console.log('Idioma después de changeLanguage:', i18next.language);
      i18next.reloadResources([newLang], function () {
        console.log('Recursos recargados para:', newLang);
        updateContent();
        if (window.updateI18nContent) window.updateI18nContent();
        updateLangBtnAll();
      });
    });
  }
  // (No agregar listeners aquí, solo en initLangSwitchers)
  i18next.on('languageChanged', updateLangBtnAll);

  // Expose for dynamic content
  window.updateI18nContent = updateContent;
  // Forzar traducción inicial si i18next ya está listo
  if (i18next.isInitialized) updateContent();
});
