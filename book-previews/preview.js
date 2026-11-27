/* Independent book-preview modal for the existing Books & Stories shelf.
   No homepage layout/styling changes; purchase links remain functional. */
(()=>{
  'use strict';
  const base=new URL('.',document.currentScript.src);
  const books={
    mithi:{title:'Mithi | Ang Ating Mithi ay Magmahalan',slug:'/l/mithi',url:'https://sspluscreativestudio.gumroad.com/l/mithi',pages:['mithi-cover.webp','mithi-3.webp','mithi-4.webp']},
    heal:{title:'How to Heal a Broken Heart Using AI?',slug:'/l/heal',url:'https://sspluscreativestudio.gumroad.com/l/heal',pages:['heal-cover.webp','heal-3.webp','heal-4.webp']}
  };
  const markup=`<section id="ssplus-book-preview" aria-hidden="true" data-open="false">
    <div class="ssbp-panel" role="dialog" aria-modal="true" aria-labelledby="ssbp-title" tabindex="-1">
      <header class="ssbp-head"><div class="ssbp-title" id="ssbp-title"></div><button type="button" class="ssbp-close" aria-label="Close book preview">×</button></header>
      <div class="ssbp-stage"><img alt="Sample book page"/></div>
      <footer class="ssbp-bottom"><div class="ssbp-controls"><button type="button" class="ssbp-prev" aria-label="Previous page">‹</button><span class="ssbp-count">1 of 3</span><button type="button" class="ssbp-next" aria-label="Next page">›</button></div><a class="ssbp-buy" target="_blank" rel="noopener noreferrer">Get the Full Book ↗</a></footer>
      <div class="ssbp-caption">Three preview pages only · Swipe or use the arrows</div>
    </div></section>`;
  document.body.insertAdjacentHTML('beforeend',markup);
  const root=document.getElementById('ssplus-book-preview'), $=s=>root.querySelector(s);
  let active=null,page=0,returnFocus=null,previousOverflow='';
  const coverUrl=n=>new URL('assets/'+n,base).href;
  function render(){const b=books[active];$('.ssbp-stage img').src=coverUrl(b.pages[page]);$('.ssbp-stage img').alt=`${b.title}, preview page ${page+1} of 3`;$('.ssbp-count').textContent=`${page+1} of 3`;$('.ssbp-prev').disabled=page===0;$('.ssbp-next').disabled=page===2;}
  function open(key){if(!books[key])return;returnFocus=document.activeElement;active=key;page=0;$('.ssbp-title').textContent=books[key].title;$('.ssbp-buy').href=books[key].url;root.dataset.open='true';root.setAttribute('aria-hidden','false');previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';render();$('.ssbp-close').focus();}
  function close(){active=null;root.dataset.open='false';root.setAttribute('aria-hidden','true');document.body.style.overflow=previousOverflow;returnFocus?.focus?.();}
  function turn(delta){if(active && page+delta>=0 && page+delta<3){page+=delta;render();}}
  $('.ssbp-close').addEventListener('click',close);
  root.addEventListener('click',e=>{if(e.target===root)close();});
  $('.ssbp-prev').addEventListener('click',()=>turn(-1));
  $('.ssbp-next').addEventListener('click',()=>turn(1));
  document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')turn(-1);if(e.key==='ArrowRight')turn(1);});
  let startX=null;$('.ssbp-stage').addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});$('.ssbp-stage').addEventListener('touchend',e=>{if(startX===null)return;let d=e.changedTouches[0].clientX-startX;startX=null;if(Math.abs(d)>45)turn(d<0?1:-1);},{passive:true});
  // Existing book covers are discovered by their associated Gumroad product link.
  // We do not alter the Gumroad link itself. If the cover is not identifiable,
  // we add a small Preview book button beside that link as a safe fallback.
  for(const [key,book] of Object.entries(books)){
    const links=[...document.querySelectorAll('a[href]')].filter(a=>{try{const u=new URL(a.href);return u.hostname.endsWith('gumroad.com')&&(u.pathname.replace(/\/$/,'')===book.slug || (key==='heal' && u.pathname.replace(/\/$/,'')==='/l/gsqph'));}catch{return false}});
    if(!links.length)continue;
    let assigned=false;
    for(const a of links){
      // Some sites wrap the cover itself in a purchase link.
      if(a.querySelector('img')){a.addEventListener('click',e=>{e.preventDefault();open(key)});a.setAttribute('aria-label',`Preview ${book.title}`);assigned=true;continue;}
      // Limit cover selection to a book/card region, not unrelated site images.
      const card=a.closest('article, .book-card, .book-item, .book, .bookshelf-item, .book-tile, [data-book], [class*="book-card"], [class*="book-item"]');
      const img=card?.querySelector('img');
      if(img && !img.closest('a[href*="gumroad.com"]')){
        img.style.cursor='pointer';img.setAttribute('tabindex','0');img.setAttribute('role','button');img.setAttribute('aria-label',`Preview ${book.title}`);
        img.addEventListener('click',()=>open(key));
        img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(key)}});
        assigned=true;
      }
    }
    if(!assigned){
      const anchor=links[0],button=document.createElement('button');button.type='button';button.textContent='Preview book';button.setAttribute('aria-label',`Preview ${book.title}`);
      button.style.cssText='cursor:pointer;margin-inline-end:10px;padding:7px 11px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;font:inherit;';
      button.addEventListener('click',()=>open(key));anchor.parentNode.insertBefore(button,anchor);
    }
  }
})();