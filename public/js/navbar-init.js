(function () {
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var _authDropdownOpen = false;

    function clearAuthDropdown() {
        var dd = document.getElementById('auth-dropdown');
        if (!dd) return;
        dd.innerHTML = '';
    }

    function prepareAuthDropdown(user) {
        var dd = document.getElementById('auth-dropdown');
        if (!dd) return;
        clearAuthDropdown();
        var logoutItem = document.createElement('button');
        logoutItem.className = 'dropdown-item';
        logoutItem.style.cssText = 'display:block;border:none;background:transparent;width:100%;text-align:left;padding:8px 12px;cursor:pointer;';
        logoutItem.textContent = 'Cerrar sesión';
        logoutItem.addEventListener('click', function (e) {
            e.preventDefault();
            doLogout();
        });
        if (user && user.role === 'dev') {
            var devItem = document.createElement('a');
            devItem.className = 'dropdown-item';
            devItem.style.cssText = 'display:block;padding:8px 12px;color:inherit;text-decoration:none;';
            devItem.href = '/static/components/dev-panel.html';
            devItem.textContent = 'Panel Dev';
            dd.appendChild(devItem);
        }
        dd.appendChild(logoutItem);
    }

    function onAuthBtnClick(e) {
        var user = null;
        try { user = JSON.parse(localStorage.getItem('user')); } catch (err) { user = null; }
        if (!user) return;
        e.preventDefault();
        toggleAuthDropdown();
    }

    function toggleAuthDropdown() {
        var dd = document.getElementById('auth-dropdown');
        var btn = document.getElementById('auth-btn');
        if (!dd || !btn) return;
        if (_authDropdownOpen) {
            dd.style.display = 'none';
            _authDropdownOpen = false;
            return;
        }
        var rect = btn.getBoundingClientRect();
        dd.style.minWidth = Math.max(140, rect.width) + 'px';
        dd.style.position = 'fixed';
        dd.style.left = rect.left + 'px';
        dd.style.top = (rect.bottom + 6) + 'px';
        dd.style.zIndex = '9999';
        dd.style.display = 'block';
        _authDropdownOpen = true;
        setTimeout(function () {
            window.addEventListener('click', onWindowClickClose);
            window.addEventListener('resize', closeAuthDropdown);
            window.addEventListener('scroll', closeAuthDropdown);
            window.addEventListener('keydown', onKeyDownAuthDropdown);
        }, 0);
    }

    function closeAuthDropdown() {
        var dd = document.getElementById('auth-dropdown');
        if (!dd) return;
        dd.style.display = 'none';
        _authDropdownOpen = false;
        window.removeEventListener('click', onWindowClickClose);
        window.removeEventListener('resize', closeAuthDropdown);
        window.removeEventListener('scroll', closeAuthDropdown);
        window.removeEventListener('keydown', onKeyDownAuthDropdown);
    }

    function onWindowClickClose(e) {
        var dd = document.getElementById('auth-dropdown');
        var btn = document.getElementById('auth-btn');
        if (!dd || !btn) return;
        if (dd.contains(e.target) || btn.contains(e.target)) return;
        closeAuthDropdown();
    }

    function onKeyDownAuthDropdown(e) {
        if (e.key === 'Escape') closeAuthDropdown();
    }

    function doLogout() {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('dev_token');
        } catch (e) {
            console.log('[Navbar] logout error:', e);
        }
        closeAuthDropdown();
        // Actualizar la UI dinámicamente sin recargar
        try {
            if (typeof window.updateAuthButton === 'function') window.updateAuthButton();
            if (typeof window.showDevPanelLinkIfDev === 'function') window.showDevPanelLinkIfDev();
        } catch (e) {
            console.log('[Navbar] error updating UI after logout:', e);
            window.location.reload();
        }
    }

    function removeAuthBtnBehavior() {
        var btn = document.getElementById('auth-btn');
        if (!btn) return;
        btn.setAttribute('href', '/static/components/login.html');
        try { btn.removeEventListener('click', onAuthBtnClick); } catch (e) { }
        closeAuthDropdown();
    }

    function updateAuthButton() {
        // Desktop navbar
        var btn = document.getElementById('auth-btn');
        var authSpan = null;

        if (btn) {
            authSpan = btn.querySelector('span[data-i18n]');
            if (authSpan && !authSpan.dataset.defaultText) {
                authSpan.dataset.defaultText = authSpan.textContent || 'Iniciar Sesión';
            }
        }

        // Mobile navbar
        var mobileBtn = document.getElementById('navbar-mobile-login-link');
        var mobileSpan = null;

        if (mobileBtn) {
            mobileSpan = mobileBtn.querySelector('span[data-i18n]');
            if (mobileSpan && !mobileSpan.dataset.defaultText) {
                mobileSpan.dataset.defaultText = mobileSpan.textContent || 'Iniciar sesión';
            }
        }

        try {
            var userStr = localStorage.getItem('user');
            var user = userStr ? JSON.parse(userStr) : null;

            if (user && (user.name || user.username || user.email || user.firstName || user.user)) {
                var display = user.name || user.firstName || user.username || user.email || user.user;
                if (display.indexOf && display.indexOf(' ') > -1) display = display.split(' ')[0];
                display = escapeHtml(display);

                // Update desktop navbar
                if (btn && authSpan) {
                    authSpan.textContent = display;
                    btn.setAttribute('aria-label', 'Cuenta de ' + display);
                    prepareAuthDropdown(user);
                    btn.setAttribute('href', '#');
                    removeAuthBtnBehavior();
                    btn.addEventListener('click', onAuthBtnClick);
                }

                // Update mobile navbar
                if (mobileBtn && mobileSpan) {
                    mobileSpan.textContent = display;
                    mobileBtn.setAttribute('aria-label', 'Cuenta de ' + display);
                    mobileBtn.setAttribute('href', '#');
                }
            } else {
                // Desktop navbar reset
                if (btn && authSpan) {
                    authSpan.textContent = authSpan.dataset.defaultText || 'Iniciar Sesión';
                    btn.setAttribute('aria-label', authSpan.dataset.defaultText || 'Iniciar Sesión');
                    removeAuthBtnBehavior();
                }

                // Mobile navbar reset
                if (mobileBtn && mobileSpan) {
                    mobileSpan.textContent = mobileSpan.dataset.defaultText || 'Iniciar sesión';
                    mobileBtn.setAttribute('aria-label', mobileSpan.dataset.defaultText || 'Iniciar sesión');
                    mobileBtn.setAttribute('href', '/static/components/login.html');
                }
            }
        } catch (e) {
            console.log('[Navbar] updateAuthButton error:', e);
            if (btn && authSpan) authSpan.textContent = authSpan.dataset.defaultText || 'Iniciar Sesión';
            if (mobileBtn && mobileSpan) mobileSpan.textContent = mobileSpan.dataset.defaultText || 'Iniciar sesión';
        }
    }

    window.updateAuthButton = updateAuthButton;
    window.doLogout = doLogout;

    window.addEventListener('storage', function (e) {
        if (e.key === 'user') updateAuthButton();
    });

    document.addEventListener('DOMContentLoaded', function () {
        // If navbar was injected after DOMContentLoaded, callers should call window.updateAuthButton();
        updateAuthButton();
    });
})();
