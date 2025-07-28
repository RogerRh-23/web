// lang-switcher.js
// Traducción automática usando Google Translate Website Plugin
(function() {
  function loadGoogleTranslate() {
    if (document.getElementById('google-translate-script')) return;
    var gt = document.createElement('script');
    gt.id = 'google-translate-script';
    gt.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(gt);
    window.googleTranslateElementInit = function() {
      new window.google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'es,en',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };
  }

  function triggerTranslate(lang) {
    var select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  }

  function setupSwitcher(btnId, lang) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      loadGoogleTranslate();
      setTimeout(function() {
        triggerTranslate(lang);
      }, 800);
    });
  }

  // Crea el contenedor oculto para el plugin
  var gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  gtDiv.style.display = 'none';
  document.body.appendChild(gtDiv);

  // Desktop
  setupSwitcher('lang-switcher', 'en');
  // Mobile
  setupSwitcher('lang-switcher-mobile', 'en');
})();
