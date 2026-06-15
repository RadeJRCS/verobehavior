import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientKey = searchParams.get('key') || 'unknown'
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://verobehavior.vercel.app'

  const js = `
;(function(){
  var KEY='${clientKey}';
  var BASE='${base}';
  var events=[];
  var startTime=Date.now();
  var scrollDepth=0;
  var sessionId='vb_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  var siteUrl=window.location.origin;

  var scrollMilestones={25:false,50:false,75:false,100:false};
  window.addEventListener('scroll',function(){
    var d=Math.round((window.scrollY+window.innerHeight)/Math.max(document.body.scrollHeight,1)*100);
    if(d>scrollDepth)scrollDepth=Math.min(d,100);
    [25,50,75,100].forEach(function(m){
      if(scrollDepth>=m && !scrollMilestones[m]){
        scrollMilestones[m]=true;
        events.push({type:'scroll_milestone',ts:Date.now()-startTime,data:{percent:m}});
      }
    });
  },{passive:true});

  // Exit intent: cursor leaves toward the top of the viewport (tab bar / close)
  var exitIntentFired=false;
  document.addEventListener('mouseout',function(e){
    if(exitIntentFired)return;
    if(e.clientY<=10 && e.relatedTarget===null){
      exitIntentFired=true;
      events.push({type:'exit_intent',ts:Date.now()-startTime,data:{}});
    }
  });

  // Hover-dwell on images, prices, ratings/reviews: a pause here often
  // signals the visitor is trying to compensate for information they
  // cannot get any other way (e.g. cannot physically inspect a product).
  var HOVER_SELECTOR='img,[class*="price" i],[class*="rating" i],[class*="review" i]';
  var HOVER_DWELL_MS=1500;
  var hoverTimers=new WeakMap();
  document.addEventListener('mouseover',function(e){
    var el=e.target.closest&&e.target.closest(HOVER_SELECTOR);
    if(!el||hoverTimers.has(el))return;
    var start=Date.now();
    var timer=setTimeout(function(){
      var txt=el.tagName==='IMG'?(el.alt||el.getAttribute('aria-label')||'image'):(el.textContent||'').trim().slice(0,80);
      events.push({type:'hover',ts:Date.now()-startTime,data:{text:txt,tag:el.tagName.toLowerCase(),durationMs:Date.now()-start}});
    },HOVER_DWELL_MS);
    hoverTimers.set(el,timer);
  },{passive:true});
  document.addEventListener('mouseout',function(e){
    var el=e.target.closest&&e.target.closest(HOVER_SELECTOR);
    if(!el)return;
    var timer=hoverTimers.get(el);
    if(timer){clearTimeout(timer);hoverTimers.delete(el);}
  },{passive:true});

  // Section visibility: how long key sections (headings, pricing, plans,
  // testimonials, reviews, FAQ) actually stayed in view.
  var SECTION_SELECTOR='h1,h2,h3,[class*="price" i],[class*="plan" i],[class*="testimonial" i],[class*="review" i],[class*="faq" i],[class*="pricing" i]';
  if(typeof IntersectionObserver!=='undefined'){
    var sectionStart=new WeakMap();
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var el=entry.target;
        if(entry.isIntersecting){
          sectionStart.set(el,Date.now());
        }else{
          var start=sectionStart.get(el);
          if(start){
            var dur=Date.now()-start;
            if(dur>800){
              var txt=(el.textContent||'').trim().slice(0,80);
              events.push({type:'section_view',ts:Date.now()-startTime,data:{text:txt,tag:el.tagName.toLowerCase(),durationMs:dur}});
            }
            sectionStart.delete(el);
          }
        }
      });
    },{threshold:0.4});
    Array.from(document.querySelectorAll(SECTION_SELECTOR)).slice(0,30).forEach(function(el){io.observe(el);});
  }

  var ACCORDION_GLYPH_RE=/[\\u25B8\\u25B9\\u25BA\\u25BC\\u25BE\\u25B6\\u203A\\u02C4\\u02C5\\u2304\\u2303]\\s*$/;

  function elClass(el){return (el&&el.className&&el.className.toString)?el.className.toString():'';}

  function looksLikeAccordionTrigger(el){
    var txt=(el.textContent||'').trim();
    if(ACCORDION_GLYPH_RE.test(txt))return true;
    if(el.hasAttribute('aria-expanded')||el.hasAttribute('aria-controls'))return true;
    if(/accordion|faq|toggle|collapse|expand/i.test(elClass(el)))return true;
    if(el.parentElement&&/accordion|faq|toggle|collapse|expand/i.test(elClass(el.parentElement)))return true;
    return false;
  }

  function findRelatedText(el){
    function tryEl(cand){
      if(!cand)return null;
      var t=(cand.textContent||'').trim();
      return (t.length>0&&t.length<=200)?t:null;
    }
    var controlsId=el.getAttribute('aria-controls');
    if(controlsId){
      var r=tryEl(document.getElementById(controlsId));
      if(r)return r;
    }
    var r2=tryEl(el.nextElementSibling);
    if(r2)return r2;
    if(el.parentElement){
      var r3=tryEl(el.parentElement.nextElementSibling);
      if(r3)return r3;
      var siblings=Array.from(el.parentElement.children).filter(function(c){return c!==el;});
      for(var i=0;i<siblings.length;i++){
        var r4=tryEl(siblings[i]);
        if(r4)return r4;
      }
    }
    return null;
  }

  var lastClickEl=null, lastClickTime=0, clickStreak=0;

  document.addEventListener('click',function(e){
    var el=e.target.closest('button,a,[role="button"],[data-vb-event]');
    if(!el)return;
    var isConv=el.getAttribute('data-vb-event')==='conversion';
    var text=(el.textContent||'').trim().slice(0,120);
    var evData={text:text,tag:el.tagName.toLowerCase(),vbType:el.getAttribute('data-vb-type')||null};
    if(looksLikeAccordionTrigger(el)){
      var related=findRelatedText(el);
      if(related)evData.relatedText=related;
    }
    events.push({type:isConv?'conversion':'click',ts:Date.now()-startTime,data:evData});

    // Rage click: 3+ clicks on the same element within 1 second usually
    // means the visitor expected something to happen and it did not.
    var now=Date.now();
    if(el===lastClickEl&&(now-lastClickTime)<1000){clickStreak++;}else{clickStreak=1;}
    lastClickEl=el;lastClickTime=now;
    if(clickStreak===3){
      events.push({type:'rage_click',ts:now-startTime,data:{text:text,tag:el.tagName.toLowerCase()}});
    }

    var testId=el.getAttribute('data-vb-test');
    if(testId&&testParticipation[testId]){recordTestResult(testId,testParticipation[testId],true);}
    if(isConv)sendData(true);
  });


  document.addEventListener('focus',function(e){
    if(e.target.matches&&e.target.matches('input,textarea,select')){
      events.push({type:'form_focus',ts:Date.now()-startTime,data:{field:e.target.name||e.target.id||e.target.type||'unknown'}});
    }
  },true);

  function getContext(){
    var ld='';
    try{var s=document.querySelector('script[type="application/ld+json"]');if(s)ld=s.textContent.slice(0,500);}catch(x){}
    return document.title+' | '+location.pathname+(ld?' | '+ld:'');
  }

  function sendData(force){
    if(events.length<2&&!force)return;
    var participation=Object.keys(testParticipation).map(function(id){return{testId:id,variant:testParticipation[id]};});
    try{
      fetch(BASE+'/api/analyze',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clientKey:KEY,
          sessionId:sessionId,
          siteUrl:siteUrl,
          pageContext:getContext(),
          events:events.slice(-30),
          sessionDuration:Math.round((Date.now()-startTime)/1000),
          scrollDepth:scrollDepth,
          referral:document.referrer||'direct',
          activeTests:participation
        }),
        keepalive:true
      });
    }catch(x){}
  }

  window.addEventListener('pagehide',function(){sendData(false);});
  setTimeout(function(){sendData(false);},30000);
  setTimeout(function(){if(events.length>=5)sendData(false);},8000);

  var testParticipation={};

  function getVariant(testId){
    var stored;
    try{stored=localStorage.getItem('_vb_t_'+testId);}catch(x){}
    if(stored)return stored;
    var v=Math.random()<0.5?'A':'B';
    try{localStorage.setItem('_vb_t_'+testId,v);}catch(x){}
    return v;
  }

  function recordTestResult(testId,variant,converted){
    try{
      fetch(BASE+'/api/test-results',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({testId:testId,clientKey:KEY,variant:variant,converted:converted||false,pageUrl:location.href}),keepalive:true});
    }catch(x){}
  }

  var ALLOWED_STYLES=['backgroundColor','color','fontSize','fontWeight','padding','borderRadius','border'];
  var INTERACTIVE_SELECTOR='button,a,[role="button"],input[type="submit"],input[type="button"],[data-vb-event]';
  var BROAD_SELECTOR='h1,h2,h3,h4,p,span,div,label,'+INTERACTIVE_SELECTOR;
  var MAX_TARGET_DESCENDANTS=8;

  function isInteractive(el){
    return /^(BUTTON|A|INPUT)$/.test(el.tagName)||el.getAttribute('role')==='button'||el.hasAttribute('data-vb-event');
  }

  // Lower score = more specific = better match. Penalize large containers
  // heavily so a wrapping <div> never outranks the actual button/element
  // whose text was captured in the click event.
  function specificityScore(el,needleLen){
    var txt=(el.textContent||el.value||'').trim();
    var descendants=el.querySelectorAll('*').length;
    return descendants*1000 + Math.max(txt.length-needleLen,0) + (isInteractive(el)?0:5);
  }

  function searchSelector(selector,needle,needleLen){
    var els=Array.from(document.querySelectorAll(selector));
    var candidates=els.filter(function(el){
      var txt=(el.textContent||el.value||'').trim();
      return txt.length>0 && txt.length<200 && txt.toLowerCase().indexOf(needle)!==-1;
    });
    if(!candidates.length)return null;
    candidates.sort(function(a,b){return specificityScore(a,needleLen)-specificityScore(b,needleLen);});
    return candidates[0];
  }

  function findAnchor(action){
    var needle=action.element_find_text.toLowerCase();
    var needleLen=action.element_find_text.length;
    // Prefer interactive elements first (buttons/links), since
    // element_find_text is derived from click events on those.
    var best=searchSelector(INTERACTIVE_SELECTOR,needle,needleLen)||searchSelector(BROAD_SELECTOR,needle,needleLen);
    if(!best)return null;
    // Safety net: if even the best match is a large container (e.g. an
    // accordion item wrapping a question and its answer), refuse to apply
    // rather than risk wiping out unrelated content.
    if(best.querySelectorAll('*').length>MAX_TARGET_DESCENDANTS)return null;
    return best;
  }

  var ICON_GLYPHS='\u25B8\u25B9\u25BA\u25BC\u25BE\u25B6\u203A\u276E\u276F\u00AB\u00BB\u02C4\u02C5\u2304\u2303\u2192\u2190\u2193\u2191';
  var ICON_TAIL_RE=new RegExp('[\\s]*['+ICON_GLYPHS+']+[\\s]*$');
  var ICON_GLYPHS_ONLY_RE=new RegExp('^['+ICON_GLYPHS+'\\s]+$');

  function isIconElement(el){
    if(!el)return false;
    var tag=el.tagName;
    if(tag==='SVG'||tag==='IMG'||tag==='I')return true;
    var cls=(el.className&&el.className.toString)?el.className.toString():'';
    if(/icon|arrow|chevron|caret/i.test(cls))return true;
    var txt=(el.textContent||'').trim();
    return txt.length>0 && txt.length<=2 && ICON_GLYPHS_ONLY_RE.test(txt);
  }

  function applyTextReplace(action,target,testId){
    if(!action.variant_text)return false;
    if(target.tagName==='INPUT'){
      target.value=action.variant_text;
      target.setAttribute('data-vb-test',testId);
      return true;
    }
    var last=target.lastElementChild;
    if(isIconElement(last)){
      // Preserve a trailing icon element (e.g. an accordion arrow that
      // rotates on expand). Only swap the label text in front of it.
      var variantA=action.variant_text.replace(ICON_TAIL_RE,'').replace(/\s+$/,'');
      while(target.firstChild && target.firstChild!==last){target.removeChild(target.firstChild);}
      target.insertBefore(document.createTextNode(variantA+' '),last);
    }else{
      var variantB=action.variant_text;
      var controlTail=(action.control_text||'').match(ICON_TAIL_RE);
      if(controlTail && !ICON_TAIL_RE.test(variantB)){
        variantB=variantB.replace(/\s+$/,'')+controlTail[0].trim();
      }
      target.textContent=variantB;
    }
    target.setAttribute('data-vb-test',testId);
    return true;
  }

  function applyInsertElement(action,target,testId){
    if(!action.variant_text)return false;
    var span=document.createElement('span');
    span.textContent=action.variant_text;
    span.setAttribute('data-vb-test',testId);
    span.setAttribute('data-vb-injected','true');
    span.style.display='inline-block';
    span.style.fontSize='0.85em';
    span.style.opacity='0.85';
    span.style.marginTop='4px';
    span.style.marginBottom='4px';
    if(action.position==='before'){
      target.parentNode.insertBefore(span,target);
    }else{
      if(target.nextSibling)target.parentNode.insertBefore(span,target.nextSibling);
      else target.parentNode.appendChild(span);
    }
    // Mark the anchor too, so clicks on it still register for this test if relevant
    target.setAttribute('data-vb-test',testId);
    return true;
  }

  function applyStyleChange(action,target,testId){
    if(!action.style_changes)return false;
    Object.keys(action.style_changes).forEach(function(prop){
      if(ALLOWED_STYLES.indexOf(prop)!==-1){
        try{target.style[prop]=action.style_changes[prop];}catch(x){}
      }
    });
    target.setAttribute('data-vb-test',testId);
    return true;
  }

  function applyAction(action,testId){
    function doApply(){
      var target=findAnchor(action);
      if(!target)return false;
      var type=action.type||'text_replace';
      if(type==='insert_element')return applyInsertElement(action,target,testId);
      if(type==='style_change')return applyStyleChange(action,target,testId);
      return applyTextReplace(action,target,testId);
    }
    if(!doApply()){
      var obs=new MutationObserver(function(){if(doApply())obs.disconnect();});
      obs.observe(document.body,{childList:true,subtree:true});
      setTimeout(function(){obs.disconnect();},10000);
    }
  }

  function applyTest(test){
    var actions=test.actions&&test.actions.length?test.actions:
      (test.element_find_text?[{type:test.test_type||'text_replace',element_find_text:test.element_find_text,control_text:test.control_text,variant_text:test.variant_text,position:test.position,style_changes:test.style_changes}]:[]);
    if(!actions.length)return;

    var variant=getVariant(test.id);
    testParticipation[test.id]=variant;
    recordTestResult(test.id,variant,false);
    if(variant==='A')return;

    actions.forEach(function(action){applyAction(action,test.id);});
  }

  try{
    fetch(BASE+'/api/tests?key='+KEY+'&status=active')
      .then(function(r){return r.json();})
      .then(function(d){if(d.tests&&d.tests.length){d.tests.forEach(applyTest);}})
      .catch(function(){});
  }catch(x){}

  window._vb={track:function(event,data){
    events.push({type:event,ts:Date.now()-startTime,data:data||{}});
    if(event==='conversion')sendData(true);
  }};

  console.log('[VeroBehavior] Behavioral intelligence active \u2713 | key: '+KEY);
})();
`
  return new NextResponse(js, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ...CORS },
  })
}
