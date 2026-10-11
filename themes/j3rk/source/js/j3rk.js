// j3rk —— Miuix 风格顶栏折叠 + 明暗切换 + 回顶
// 可选 Monet 动态取色: <html data-monet="true"> 时才动态加载 md3.bundle.js
const root = document.documentElement;
const MODE = root.dataset.mode || 'system';   // ThemeController: system | light | dark
const MONET = root.dataset.monet === 'true';

/* ---------------- 顶栏折叠 ----------------
   等价 Compose TopAppBar 的 heightOffset: 大标题区上移出视口,
   折叠标题按进度 p 淡入 (TopAppBar.kt 里的 smallTitleAlpha) */
const ab = document.getElementById('ab');
const abLarge = document.getElementById('ab-large');

function measureAb() {
  if (ab && abLarge) root.style.setProperty('--ab-large-h', abLarge.offsetHeight + 'px');
}

function onScroll() {
  if (!ab || !abLarge) return;
  const h = abLarge.offsetHeight || 1;
  const p = Math.min(1, Math.max(0, (scrollY || 0) / h));
  ab.style.setProperty('--p', p.toFixed(3));
  ab.classList.toggle('is-scrolled', p > 0.98);
  if (toTop) toTop.hidden = (scrollY || 0) <= 400;
}

/* ---------------- 回顶 ---------------- */
const toTop = document.getElementById('to-top');
toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

measureAb();
addEventListener('resize', () => { measureAb(); onScroll(); }, { passive: true });
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------------- 明暗切换 ---------------- */
const prefersDark = matchMedia('(prefers-color-scheme: dark)');

function resolve() {
  let saved = null;
  try { saved = localStorage.getItem('j3rk-theme'); } catch (e) {}
  if (MODE === 'light' || MODE === 'dark') return MODE;
  if (saved === 'light' || saved === 'dark') return saved;
  return prefersDark.matches ? 'dark' : 'light';
}

function applyTheme(mode) {
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('j3rk-theme', next); } catch (e) {}
  applyTheme(next);
});

prefersDark.addEventListener?.('change', () => {
  if (MODE === 'system') applyTheme(prefersDark.matches ? 'dark' : 'light');
});

applyTheme(resolve());

/* ---------------- Monet 动态取色 (Miuix ThemeController 的 Monet 模式) ----------------
   默认关闭: 标准配色见 css/miuix.css (docs/zh_CN/guide/colors.md 的固定值)。
   开启后用种子色算出 Material You 色板覆盖同名变量。映射是近似的 (Miuix 色名 ≠ MD3 色名)。 */
if (MONET) {
  import('./md3.bundle.js').then(function (m) {
    const seed = root.dataset.seed || '#3482FF';
    const src = m.Hct.fromInt(m.argbFromHex(seed));
    const schemes = {
      light: new m.SchemeTonalSpot(src, false, 0),
      dark: new m.SchemeTonalSpot(src, true, 0)
    };
    function paint() {
      const dark = root.dataset.theme === 'dark';
      const s = dark ? schemes.dark : schemes.light;
      const D = m.MaterialDynamicColors;
      const map = {
        '--primary': D.primary,
        '--on-primary': D.onPrimary,
        '--primary-variant': D.primaryContainer,
        '--tertiary-container': D.primaryContainer,
        '--on-tertiary-container': D.onPrimaryContainer,
        '--secondary-container': D.surfaceContainerHigh,
        '--on-secondary-container': D.onSurfaceVariant,
        '--surface': D.surface,
        '--on-surface': D.onSurface,
        '--on-surface-summary': D.onSurfaceVariant,
        '--on-background-variant': D.onSurfaceVariant,
        '--surface-container': dark ? D.surfaceContainerHigh : D.surfaceContainerLowest,
        '--on-surface-container': D.onSurface,
        '--surface-container-high': D.surfaceContainerHighest,
        '--outline': D.outlineVariant,
        '--divider': D.outlineVariant,
        '--error': D.error
      };
      for (const k in map) {
        const role = map[k];
        if (role && typeof role.getArgb === 'function') root.style.setProperty(k, m.hexFromArgb(role.getArgb(s)));
      }
    }
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }).catch(function () { /* 取不到就继续用标准配色 */ });
}
