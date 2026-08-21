// Navbar acceptance checks — the behavioural half of the header contract.
// lib/data/navigation.test.ts covers the IA and the route contract without a
// browser; this covers what only a real layout can answer: does the bar fit,
// does the keyboard work, does the drawer behave.
//
//   npm run build && npm run start          # must be the CURRENT build
//   node scripts/nav-acceptance.mjs
//
// Playwright is NOT a dependency of this package — it is available globally
// in the build container. Install it (`npm i -D playwright`) before wiring
// this into CI. Nothing runs it automatically today, on purpose: a check
// that needs a running server is a poor fit for a pre-commit hook.
//
// The claim most likely to be wrong is that four menus buy the lg (1024px)
// breakpoint, so it is measured at the exact width rather than estimated
// from label lengths — the previous seven-item bar had exactly 0px of slack
// there, which is what pinned it to xl.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const URL = 'http://localhost:3000/';
let failures = 0;
const check = (name, pass, detail = '') => {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? `  — ${detail}` : ''}`);
  if (!pass) failures++;
};

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  // ── 1. Does the bar actually fit at lg? ─────────────────────────────────
  console.log('\n1. Fit at the lg breakpoint (the claim that buys 1024-1279px)\n');
  for (const width of [1024, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(URL, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const row = document.querySelector('header .flex.items-center.justify-between');
      const nav = document.querySelector('header nav[aria-label="Main"]');
      const logo = document.querySelector('header a[href="/"]');
      const actions = row?.lastElementChild;
      const rect = (el) => (el ? el.getBoundingClientRect() : null);
      const navR = rect(nav), logoR = rect(logo), actR = rect(actions), rowR = rect(row);
      const navVisible = nav ? getComputedStyle(nav).display !== 'none' : false;
      return {
        navVisible,
        rowW: rowR ? Math.round(rowR.width) : 0,
        used: [logoR, navR, actR].filter(Boolean).reduce((s, x) => s + x.width, 0),
        // Slack = row width minus the three blocks' combined width.
        slack: rowR ? Math.round(rowR.width - [logoR, navR, actR].filter(Boolean).reduce((s, x) => s + x.width, 0)) : 0,
        rowH: rowR ? Math.round(rowR.height) : 0,
        wrapped: rowR ? rowR.height > 72 : false,
      };
    });
    check(
      `${width}px: desktop nav visible`,
      r.navVisible,
      r.navVisible ? `slack ${r.slack}px, row ${r.rowH}px` : 'hamburger shown'
    );
    check(`${width}px: row did not wrap`, !r.wrapped, `height ${r.rowH}px`);
    // The old bar sat at exactly 0px here, which is why it was pinned to xl.
    // 24px is the floor at which one more character does not break the row.
    check(`${width}px: slack above the 24px floor`, r.slack >= 24, `${r.slack}px`);
    await page.close();
  }

  // ── 2. Keyboard + ARIA on the disclosure ────────────────────────────────
  console.log('\n2. Keyboard and ARIA (the part that did not exist before)\n');
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: 'networkidle' });

    const trigger = page.locator('header nav[aria-label="Main"] button').first();
    const label = (await trigger.textContent())?.trim();

    check('trigger is a <button>', await trigger.evaluate((el) => el.tagName === 'BUTTON'));
    check('aria-haspopup present', (await trigger.getAttribute('aria-haspopup')) === 'true');
    check('aria-expanded starts false', (await trigger.getAttribute('aria-expanded')) === 'false');

    const controls = await trigger.getAttribute('aria-controls');
    check('aria-controls set', !!controls, controls || '');

    // Enter opens.
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
    check('Enter opens the panel', (await trigger.getAttribute('aria-expanded')) === 'true');
    check(
      'panel matches aria-controls id',
      controls ? (await page.locator(`#${controls}`).count()) > 0 : false
    );

    // Escape closes and restores focus to the trigger.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    check('Escape closes', (await trigger.getAttribute('aria-expanded')) === 'false');
    const refocused = await page.evaluate(
      () => document.activeElement?.tagName === 'BUTTON' &&
            document.activeElement?.getAttribute('aria-haspopup') === 'true'
    );
    check('Escape returns focus to the trigger', refocused);

    // ArrowDown opens and moves into the panel.
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    const inPanel = await page.evaluate((id) => {
      const p = document.getElementById(id);
      return !!p && !!document.activeElement && p.contains(document.activeElement);
    }, controls);
    check('ArrowDown moves focus into the panel', inPanel);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // ArrowRight moves between triggers.
    const before = await page.evaluate(() => document.activeElement?.textContent?.trim());
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(80);
    const after = await page.evaluate(() => document.activeElement?.textContent?.trim());
    check('ArrowRight moves to the next trigger', before !== after, `${before} -> ${after}`);

    // Coming-soon must not be reachable by keyboard.
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('header nav[aria-label="Main"] button')];
      btns.find((b) => b.textContent.includes('Readiness'))?.click();
    });
    await page.waitForTimeout(150);
    const comingSoonFocusable = await page.evaluate(() => {
      const el = [...document.querySelectorAll('header a, header button')]
        .find((n) => n.textContent?.includes('Deep assessment'));
      return !!el;
    });
    check('coming-soon item is not a link or button', !comingSoonFocusable);
    check(
      'coming-soon item is still rendered',
      await page.locator('text=Deep assessment').count() > 0
    );

    console.log(`\n     (first trigger: "${label}")`);
    await page.close();
  }

  // ── 3. Mobile drawer accordion ──────────────────────────────────────────
  console.log('\n3. Mobile drawer at 360px\n');
  {
    const page = await browser.newPage({
      viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true,
    });
    await page.goto(URL, { waitUntil: 'networkidle' });

    const burger = page.locator('header button[aria-controls="mobile-nav"]');
    check('hamburger present at 360px', (await burger.count()) === 1);
    check('hamburger has aria-expanded', (await burger.getAttribute('aria-expanded')) === 'false');

    await burger.click();
    await page.waitForTimeout(150);
    check('drawer opens', (await page.locator('#mobile-nav').count()) === 1);

    const section = page.locator('#mobile-nav button[aria-expanded]').first();
    check('sections are accordions, collapsed by default',
      (await section.getAttribute('aria-expanded')) === 'false');
    await section.click();
    await page.waitForTimeout(120);
    check('section expands on tap', (await section.getAttribute('aria-expanded')) === 'true');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth);
    check('no horizontal overflow with drawer open', overflow <= 361, `${overflow}px`);

    const small = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('#mobile-nav a, #mobile-nav button, header button')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 44) out.push(`${Math.round(r.width)}x${Math.round(r.height)} "${el.textContent.trim().slice(0, 20)}"`);
      }
      return out;
    });
    check('every drawer target is >= 44px tall', small.length === 0, small.slice(0, 4).join(', '));
    await page.close();
  }

  console.log(`\n${failures === 0 ? '✓ all navbar acceptance checks passed' : `✗ ${failures} check(s) failed`}\n`);
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})();
