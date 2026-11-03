const { chromium } = require(process.env.HOME + '/.local/lib/node_modules/@playwright/cli/node_modules/playwright-core');
const U = 'http://localhost:8765/ca-scan-motion-review.html';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto(U); await p.evaluate(() => localStorage.clear()); await p.reload();
  // keyboard path: q0 arrow + Enter
  await p.focus('#q0-lt50'); await p.keyboard.press('Space'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  console.log('after Enter qi heading:', await p.textContent('#qt'), '| focused:', await p.evaluate(() => document.activeElement.id));
  console.log('rail:', await p.getAttribute('#pbar','aria-valuetext'), '| hash', await p.evaluate(()=>location.hash));
  // answer q1, double-click next
  await p.check('#q1-gst'); await p.dblclick('#next'); await p.waitForTimeout(500);
  console.log('after dblclick:', (await p.textContent('.prog-meta span')));
  await p.goBack(); await p.waitForTimeout(400);
  console.log('after browser back:', (await p.textContent('.prog-meta span')), '| answer kept:', await p.isChecked('#q1-gst'));
  // storage blocked
  await p.check('#sim-nostore'); await p.waitForTimeout(200);
  console.log('nostore banner:', await p.locator('.banner.info').allTextContents());
  await p.uncheck('#sim-nostore');
  // offline
  await p.check('#sim-offline'); await p.waitForTimeout(200);
  console.log('offline banner:', await p.locator('#net').textContent());
  console.log('sr:', await p.textContent('#sr'));
  // expired
  await p.uncheck('#sim-offline'); await p.click('#expire'); await p.waitForTimeout(300);
  console.log('expired:', await p.locator('.banner.info').allTextContents());
  // worst case, slow scoring
  await p.check('#sim-slow'); await p.click('#worst'); await p.waitForTimeout(2300);
  console.log('slow btn:', await p.textContent('#next'));
  await p.waitForTimeout(2500);
  console.log('focus on result:', await p.evaluate(()=>document.activeElement.id), '|', await p.textContent('#rhead'));
  console.log('areas visible:', await p.locator('#bks .bk:visible').count());
  await p.click('#more'); console.log('after more:', await p.locator('#bks .bk:visible').count(), await p.getAttribute('#more','aria-expanded'));
  // form validation
  await p.fill('#g-email','dilip@'); await p.fill('#g-phone','12345'); await p.click('#send');
  console.log('errors:', await p.locator('.ferr:visible').allTextContents(), '| focus', await p.evaluate(()=>document.activeElement.id), '| describedby', await p.getAttribute('#g-name','aria-describedby'));
  await p.fill('#g-name','Dilip'); await p.fill('#g-firm','Sahu & Co'); await p.fill('#g-email','dilip@firm.in'); await p.fill('#g-phone','+91 98765-43210');
  console.log('cleared:', await p.locator('.ferr:visible').count());
  await p.selectOption('#sim-form','error'); await p.click('#send'); await p.waitForTimeout(200);
  console.log('sending:', await p.textContent('#send'), await p.getAttribute('#g-name','readonly'));
  await p.waitForTimeout(1300); console.log('server err:', await p.textContent('#form-alert'), '| btn', await p.textContent('#send'), '| name kept', await p.inputValue('#g-name'));
  await p.check('#sim-offline'); await p.waitForTimeout(100); console.log('result offline banner:', await p.locator('#net-r').count());
  await p.click('#send'); await p.waitForTimeout(1400); console.log('offline err:', await p.textContent('#form-alert'));
  await p.uncheck('#sim-offline'); await p.selectOption('#sim-form','ok'); await p.click('#send'); await p.waitForTimeout(1400);
  console.log('sent:', await p.textContent('#sent-h'), '| focus', await p.evaluate(()=>document.activeElement.id), '| fixes', await p.locator('.restfix li').count());
  await p.screenshot({ path: 'worst-sent.png', fullPage: true });
  // best case
  await p.uncheck('#sim-slow'); await p.click('#best'); await p.waitForTimeout(2600);
  console.log('best:', await p.textContent('#rhead'), '|', await p.locator('.panel.clear h3').allTextContents(), '| free:', await p.textContent('.free-fix'), '| gate:', await p.textContent('#gate-h'));
  await p.screenshot({ path: 'best.png', fullPage: true });
  // axe
  try {
    await p.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    for (const st of ['result']) { const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] })).violations.map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; '))); console.log('axe', st, r); }
    await p.click('#restart'); await p.waitForTimeout(300);
    console.log('axe quiz', await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] })).violations.map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; '))));
    await p.click('#sample'); await p.waitForTimeout(2600); await p.fill('#g-email','x'); await p.click('#send');
    console.log('axe form-errors', await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice'] })).violations.map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; '))));
  } catch (e) { console.log('axe failed', e.message); }
  // mobile 360 + 200% zoom (640 css px)
  for (const w of [360, 640]) {
    await p.setViewportSize({ width: w, height: 800 }); await p.click('#sample'); await p.waitForTimeout(2600);
    console.log(w, 'overflow:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    await p.screenshot({ path: 'r' + w + '.png', fullPage: true });
  }
  // fonts sizes / weights used in main
  console.log(await p.evaluate(() => { const s = new Set(), w = new Set(); document.querySelectorAll('main *').forEach(e => { if (e.childNodes.length && [...e.childNodes].some(n => n.nodeType===3 && n.textContent.trim())) { const c = getComputedStyle(e); s.add(c.fontSize); w.add(c.fontWeight); } }); return [[...s], [...w]]; }));
  console.log('errors', errs);
  await b.close();
})();
