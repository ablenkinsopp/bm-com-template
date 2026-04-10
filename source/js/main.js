/* global balanceText */
// {% raw %}
import debugLog from './modules/_debugLog';
import loadScript from './modules/_loadScript';
import flyingPages from "flying-pages-module";
import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import collapse from "@alpinejs/collapse";
import focus from "@alpinejs/focus";
import dataDOM from "./modules/Alpine.data/DOM";

// The window.Alpine = Alpine bit is optional, but is nice to have for
// freedom and flexibility. Like when tinkering with Alpine from the devtools for example.
window.Alpine = Alpine;

// Function for executing code on document ready
function domReady(callback) {
  if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

// If you imported Alpine into a bundle, you have to make sure you are registering any
// extension code IN BETWEEN when you import the Alpine global object, and when you
// initialize Alpine by calling Alpine.start().

// Add plugins to Alpine
Alpine.plugin(intersect);
Alpine.plugin(collapse);
Alpine.plugin(focus);

Alpine.data("xDOM", dataDOM);

// Load balance-text script if the browser is Safari
if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
  loadScript('//cdn.jsdelivr.net/npm/balance-text@3.3.1/balancetext.min.js', 'async', () => {
    balanceText(document.querySelectorAll('[x-balance-text]'), {watch: true});
  });
}

// Start Alpine when the page is ready.
domReady(() => {
  Alpine.start();
  flyingPages({
    // Prefetch all pages by default
  });
});
// {% endraw %}

function getNearestColoredBackground(el) {
    let node = el.closest('.row-fluid-wrapper');

    if (node) {
        const styles = window.getComputedStyle(node);
        const bg = styles.backgroundImage; // e.g. 'none', 'url("...")', 'linear-gradient(...)'

        // Ignore if it has any image URL; accept gradients/other non-url values
        if (bg && bg !== 'none' && !bg.includes('url(')) {
            // bg is a color/gradient/etc. – use it
            return bg;
        }
    }

    return null;
}

function applyNearestBackground(selector = '.match-nearest-bg') {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
        const bg = getNearestColoredBackground(el);
        if (bg) {
            el.style.backgroundImage = bg;
        }
    });
}

let animationObserver = null;

function applyAnimationObserver() {
    if (animationObserver) return; // Already running

    animationObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const animClass = el.dataset.animateClass || 'animate-fade-up';
            el.classList.add(animClass);
            
            el.className.split(' ').forEach(cls => {
                if (cls.startsWith('animate-start-')) {
                    el.classList.remove(cls);
                }
            });
            obs.unobserve(el);
        });
    }, { threshold: 0.2 });
    
    // Observe existing items immediately
    document.querySelectorAll('[data-animate-on-scroll]').forEach(el => {
        animationObserver.observe(el);
    });
}

function enhanceForm() {
    const container = document.querySelector('.body-container--form');
    const formWrapper = container.querySelector('.hsfc-FormWrapper');
    if (!formWrapper) return false;
    
    formWrapper.classList.add('animate-start-fade-up-8');
    formWrapper.dataset.animateOnScroll = true;
    formWrapper.dataset.animateClass = 'animate-fade-up';
    formWrapper.style.setProperty('--delay', '100ms');
    formWrapper.style.setProperty('--duration', '600ms');

    if (animationObserver) {
        animationObserver.observe(formWrapper);
    }

    return true;
}

function waitForForm() {
    if (!document.querySelector('.body-container--form')) return;

    if (enhanceForm()) return;
    
    requestAnimationFrame(waitForForm);
}

document.addEventListener('DOMContentLoaded', () => {
    waitForForm();
    applyNearestBackground();
    applyAnimationObserver();
});
