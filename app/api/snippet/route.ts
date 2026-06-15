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

  window.addEventListener('scroll',function(){
    var d=Math.round((window.scrollY+window.innerHeight)/Math.max(document.body.scrollHeight,1)*100);
    if(d>scrollDepth)scrollDepth=Math.min(d,100);
  },{passive:true});

  document.addEventListener('click',function(e){
    var el=e.target.closest('button,a,[role="button"],[data-vb-event]');
    if(!el)return;
    var isConv=el.getAttribute('data-vb-event')==='conversion';
    var text=(el.textContent||'').trim().slice(0,120);
    events.push({type:isConv?'conversion':'click',ts:Date.now()-startTime,data:{text:text,tag:el.tagName.toLowerCase(),vbType:el.getAttribute('data-vb-type')||null}});
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

  function findAnchor(test){
    var els=Array.from(document.querySelectorAll('button,a,[role="button"],input[type="submit"],input[type="button"],h1,h2,h3,p,span,div,label'));
    return els.find(function(el){
      var txt=(el.textContent||el.value||'').trim();
      return txt.length>0 && txt.length<200 && txt.toLowerCase().indexOf(test.element_find_text.toLowerCase())!==-1;
    });
  }

  function applyTextReplace(test,target){
    if(!test.variant_text)return false;
    if(target.tagName==='INPUT')target.value=test.variant_text;
    else target.textContent=test.variant_text;
    target.setAttribute('data-vb-test',test.id);
    return true;
  }

  function applyInsertElement(test,target){
    if(!test.variant_text)return false;
    var span=document.createElement('span');
    span.textContent=test.variant_text;
    span.setAttribute('data-vb-test',test.id);
    span.setAttribute('data-vb-injected','true');
    span.style.display='inline-block';
    span.style.fontSize='0.85em';
    span.style.opacity='0.85';
    span.style.marginTop='4px';
    span.style.marginBottom='4px';
    if(test.position==='before'){
      target.parentNode.insertBefore(span,target);
    }else{
      if(target.nextSibling)target.parentNode.insertBefore(span,target.nextSibling);
      else target.parentNode.appendChild(span);
    }
    // Mark the anchor too, so clicks on it still register for this test if relevant
    target.setAttribute('data-vb-test',test.id);
    return true;
  }

  function applyStyleChange(test,target){
    if(!test.style_changes)return false;
    Object.keys(test.style_changes).forEach(function(prop){
      if(ALLOWED_STYLES.indexOf(prop)!==-1){
        try{target.style[prop]=test.style_changes[prop];}catch(x){}
      }
    });
    target.setAttribute('data-vb-test',test.id);
    return true;
  }

  function applyTest(test){
    if(!test.element_find_text)return;
    var variant=getVariant(test.id);
    testParticipation[test.id]=variant;
    recordTestResult(test.id,variant,false);
    if(variant==='A')return;

    function doApply(){
      var target=findAnchor(test);
      if(!target)return false;
      var type=test.test_type||'text_replace';
      if(type==='insert_element')return applyInsertElement(test,target);
      if(type==='style_change')return applyStyleChange(test,target);
      return applyTextReplace(test,target);
    }

    if(!doApply()){
      var obs=new MutationObserver(function(){if(doApply())obs.disconnect();});
      obs.observe(document.body,{childList:true,subtree:true});
      setTimeout(function(){obs.disconnect();},10000);
    }
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
