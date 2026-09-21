import { chromium } from '@playwright/test';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
await p.goto('http://localhost:4173/components/button',{waitUntil:'load'});
await p.waitForTimeout(4500);
console.log('at load:', await p.evaluate(()=>({
  wrappers: document.querySelectorAll('[data-sk-deferred-code]').length,
  hydrated: document.querySelectorAll('[data-sk-deferred-ready]').length,
  templatesFilled: [...document.querySelectorAll('template[data-sk-deferred-source]')]
    .map(t=>t.content.querySelectorAll('*').length).slice(0,4),
  liveSpansInContractTab: document.querySelectorAll('[data-sk-tabs-content][data-value="contract"] span[class^=tk-]').length,
})));
await p.click('[data-sk-tabs-trigger][data-value="contract"]');
await p.waitForTimeout(1500);
console.log('after opening Reference:', await p.evaluate(()=>{
  const panel=document.querySelector('[data-sk-tabs-content][data-value="contract"]');
  const pre=panel?.querySelector('pre');
  return { hydrated: document.querySelectorAll('[data-sk-deferred-ready]').length,
           liveSpans: panel?panel.querySelectorAll('span[class^=tk-]').length:0,
           hasPre: !!pre, text:(pre?.textContent??'').replace(/\s+/g,' ').trim().slice(0,60) };
}));
console.log('errors:', errs.length?errs:'none');
await b.close();
