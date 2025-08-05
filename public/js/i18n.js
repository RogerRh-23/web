// i18next initialization and DOM translation logic
// Requires i18next and i18nextXHRBackend via CDN

document.addEventListener('DOMContentLoaded', function () {
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
  if (langBtn) {
    function updateLangBtn() {
      var nextLang = i18next.language === 'es' ? 'EN' : 'ES';
      langBtn.innerHTML = '<i class="bi bi-translate"></i> ' + nextLang;
    }
    updateLangBtn();
    langBtn.addEventListener('click', function () {
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
          updateLangBtn();
        });
      });
    });
    i18next.on('languageChanged', updateLangBtn);
  }

  // Expose for dynamic content
  window.updateI18nContent = updateContent;
  // Forzar traducción inicial si i18next ya está listo
  if (i18next.isInitialized) updateContent();
});
