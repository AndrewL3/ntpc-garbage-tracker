export function initDarkMode() {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  function apply(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
  }

  apply(mql.matches);
  mql.addEventListener("change", (e) => apply(e.matches));
}
