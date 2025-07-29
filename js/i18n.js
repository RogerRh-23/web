// i18next initialization and DOM translation logic
// Requires i18next and i18nextXHRBackend via CDN

document.addEventListener('DOMContentLoaded', function() {
  i18next.use(i18nextXHRBackend).init({
    lng: 'es',
    fallbackLng: 'es',
    debug: false,
    backend: {
      loadPath: './locales/{{lng}}.json'
    }
  }, function(err, t) {
    updateContent();
  });

  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = i18next.t(key);
    });
  }

  // Language switcher
  var langBtn = document.getElementById('lang-switcher');
  if (langBtn) {
    langBtn.addEventListener('click', function() {
      var newLang = i18next.language === 'es' ? 'en' : 'es';
      i18next.changeLanguage(newLang, updateContent);
      langBtn.innerHTML = '<i class="bi bi-translate"></i> ' + (newLang === 'es' ? 'EN' : 'ES');
    });
  }

  // Expose for dynamic content
  window.updateI18nContent = updateContent;
});
