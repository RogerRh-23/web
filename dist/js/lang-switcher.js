// lang-switcher.js
// Traducción automática usando Google Translate Website Plugin
(function() {
  // Crea el contenedor para el plugin, visible pero fuera de la vista
  var gtDiv = document.getElementById('google_translate_element');
  if (!gtDiv) {
    gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.position = 'absolute';
    gtDiv.style.left = '-9999px';
    gtDiv.style.top = '0';
    gtDiv.style.width = '1px';
    gtDiv.style.height = '1px';
    document.body.appendChild(gtDiv);
  }

  function loadGoogleTranslate(cb) {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      if (typeof cb === 'function') cb();
      return;
    }
    if (document.getElementById('google-translate-script')) {
      // Espera a que cargue
      var interval = setInterval(function() {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          clearInterval(interval);
          if (typeof cb === 'function') cb();
        }
      }, 200);
      return;
    }
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
      if (typeof cb === 'function') cb();
    };
  }

  function triggerTranslate(lang) {
    var select = document.querySelector('.goog-te-combo');
    if (select) {
      if (select.value !== lang) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    }
  }

  function getCurrentLang() {
    var select = document.querySelector('.goog-te-combo');
    return select ? select.value : 'es';
  }

  function setupSwitcher(btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      loadGoogleTranslate(function() {
        // Espera a que el select esté disponible
        var tries = 0;
        function waitForSelectAndTranslate() {
          var select = document.querySelector('.goog-te-combo');
          if (select) {
            var current = getCurrentLang();
            var next = current === 'en' ? 'es' : 'en';
            triggerTranslate(next);
            btn.innerHTML = '<i class="bi bi-translate"></i> ' + (next === 'en' ? 'EN' : 'ES');
            btn.disabled = false;
            btn.style.opacity = '';
          } else if (tries < 30) {
            tries++;
            setTimeout(waitForSelectAndTranslate, 150);
          } else {
            btn.disabled = false;
            btn.style.opacity = '';
            alert('No se pudo cargar el traductor. Intenta de nuevo.');
          }
        }
        waitForSelectAndTranslate();
      });
    });
  }

  // Desktop
  setupSwitcher('lang-switcher');
  // Mobile
  setupSwitcher('lang-switcher-mobile');
})();
