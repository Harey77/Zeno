// Plain (server-safe) module: the layout inlines this before first paint so the saved theme applies without a flash.
// Dark is the brand default; a saved choice always wins.
export const THEME_KEY = "zeno:theme";
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.dataset.theme=t==='light'?'light':'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;
