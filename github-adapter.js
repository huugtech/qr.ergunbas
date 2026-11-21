/**
 * GitHub Pages → Google Apps Script bridge
 * The site is static. Registration, settings and Sheets writes are executed by
 * the deployed Apps Script via a cross-origin HTML form POST. Every POST is
 * confirmed by a separate JSONP receipt before showing success.
 * No false "saved" response is generated on network errors.
 */
(function () {
  'use strict';
  const endpoint = String(window.ERDOOR_GITHUB_CONFIG?.appsScriptUrl || '').trim();
  const ready = /^https:\/\/script\.google\.com\/macros\/s\/AK[A-Za-z0-9_-]+\/exec$/.test(endpoint);

  function backendError() {
    return new Error('Apps Script bağlantısı ayarlanmamış veya geçersiz. config.js dosyasındaki URL’yi kontrol edin.');
  }
  function jsonp(action, params) {
    if (!ready) return Promise.reject(backendError());
    return new Promise((resolve, reject) => {
      const callback = '__erdoor_cb_' + Math.random().toString(36).slice(2) + '_' + Date.now();
      const query = new URLSearchParams({api:'1',action,callback,...params});
      const el = document.createElement('script');
      let finished = false;
      function finish(ok,value) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        delete window[callback];
        el.remove();
        ok ? resolve(value) : reject(value);
      }
      window[callback] = result => finish(true,result);
      el.onerror = () => finish(false,new Error('Apps Script yanıtına erişilemedi. URL veya yayın izinlerini kontrol edin.'));
      const timeout = setTimeout(() => finish(false,new Error('Apps Script yanıt süresi doldu.')), 8000);
      el.src = endpoint + '?' + query.toString();
      document.head.appendChild(el);
    });
  }
  function requestId() {
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    const a=new Uint8Array(16);window.crypto.getRandomValues(a);
    return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');
  }
  async function postAndConfirm(action, payload) {
    if (!ready) throw backendError();
    const id=requestId();
    // Form targets a private iframe. This works across origins without CORS
    // and avoids opaque fetch results being treated as a successful save.
    const frame=document.createElement('iframe');
    frame.name='erdoor_frame_'+id.replace(/-/g,'');
    frame.title='registration transport';
    frame.setAttribute('aria-hidden','true');
    frame.hidden=true;
    const form=document.createElement('form');
    form.action=endpoint;
    form.target=frame.name;
    form.method='POST';
    form.acceptCharset='UTF-8';
    form.hidden=true;
    [['api','1'],['action',action],['requestId',id],['payload',JSON.stringify(payload)]].forEach(([k,v])=>{
      const inp=document.createElement('input');
      inp.type='hidden';inp.name=k;inp.value=v;form.appendChild(inp);
    });
    document.body.append(frame,form);
    try {
      form.submit();
      // Post receipt appears only after server-side Sheets operation is finished.
      const until=Date.now()+30000;
      let lastError=null;
      while(Date.now()<until) {
        await new Promise(r=>setTimeout(r,1200));
        let receipt;
        try {
          receipt=await jsonp('receipt',{requestId:id});
        } catch(e) {
          lastError=e;
          continue;
        }
        if(receipt?.pending) continue;
        if(!receipt?.ok) throw new Error(receipt?.error||'Google Sheets kayıt işlemi başarısız.');
        return receipt;
      }
      throw new Error('Kayıt sonucu doğrulanamadı. Yeniden göndermeden önce Google Sheets tablosunu kontrol edin.'+(lastError?' ('+lastError.message+')':''));
    } finally {
      form.remove();
      setTimeout(()=>frame.remove(),6000);
    }
  }
  const actions={
    submitLead: data => postAndConfirm('register',data),
    getSpreadsheetSettings: () => jsonp('settings',{}),
    updateSpreadsheetSettings: data => postAndConfirm('settings-update',data)
  };
  function chain(success,failure) {
    return {
      withSuccessHandler(fn) { return chain(fn,failure); },
      withFailureHandler(fn) { return chain(success,fn); },
      submitLead(data) { actions.submitLead(data).then(success||(()=>{}),failure||(()=>{})); },
      getSpreadsheetSettings() { actions.getSpreadsheetSettings().then(success||(()=>{}),failure||(()=>{})); },
      updateSpreadsheetSettings(data) { actions.updateSpreadsheetSettings(data).then(success||(()=>{}),failure||(()=>{})); }
    };
  }
  window.google=window.google||{};
  window.google.script=window.google.script||{};
  window.google.script.run=chain(null,null);
})();
