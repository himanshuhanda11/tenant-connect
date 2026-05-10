/*! Aireatro WhatsApp Widget v1 — https://aireatro.com */
(function () {
  if (window.__AireatroWidgetLoaded) return;
  window.__AireatroWidgetLoaded = true;

  var script = document.currentScript || (function(){ var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var widgetId = script && script.getAttribute('data-id');
  if (!widgetId) { console.warn('[Aireatro] Missing data-id'); return; }

  var ORIGIN = (script && script.getAttribute('data-origin')) || 'https://fygwjpdasnhaomoqdvcu.supabase.co';
  var FN = ORIGIN + '/functions/v1';

  // Session id (persisted to keep variant assignment stable per visitor)
  var SKEY = 'aireatro:wid:' + widgetId;
  var sessionStore = (function(){
    try { return JSON.parse(localStorage.getItem(SKEY) || '{}'); } catch(_) { return {}; }
  })();
  function persistSession(){ try { localStorage.setItem(SKEY, JSON.stringify(sessionStore)); } catch(_){} }
  if (!sessionStore.sid) { sessionStore.sid = 'aw_' + Math.random().toString(36).slice(2) + Date.now().toString(36); persistSession(); }
  var sid = sessionStore.sid;
  var assignedVariantId = null;

  function detectDevice(){ return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'; }

  function track(type, extra){
    try {
      navigator.sendBeacon
        ? navigator.sendBeacon(FN + '/widget-event', new Blob([JSON.stringify(Object.assign({ id: widgetId, event_type: type, page_url: location.href, referrer: document.referrer, device: detectDevice(), session_id: sid }, extra || {}))], { type: 'application/json' }))
        : fetch(FN + '/widget-event', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: widgetId, event_type: type, page_url: location.href, referrer: document.referrer, device: detectDevice(), session_id: sid }), keepalive: true });
    } catch(_) {}
  }

  function shouldShow(cfg){
    var v = (cfg.visibility || 'both');
    var d = detectDevice();
    if (v === 'desktop' && d !== 'desktop') return false;
    if (v === 'mobile' && d !== 'mobile') return false;
    var inc = cfg.includePaths, exc = cfg.excludePaths;
    var path = location.pathname;
    if (Array.isArray(exc) && exc.some(function(p){ return p && path.indexOf(p) === 0; })) return false;
    if (Array.isArray(inc) && inc.length && !inc.some(function(p){ return p && path.indexOf(p) === 0; })) return false;
    return true;
  }

  function injectStyles(cfg){
    if (document.getElementById('aireatro-widget-style')) return;
    var primary = cfg.primaryColor || '#25D366';
    var accent = cfg.accentColor || '#128C7E';
    var bg = cfg.bgColor || '#ffffff';
    var text = cfg.textColor || '#0f172a';
    var radius = (cfg.radius || 20) + 'px';
    var pos = cfg.position || 'bottom-right';
    var anim = cfg.animation || 'pulse';
    var corner = pos === 'bottom-left' ? 'left:24px;right:auto;' : 'right:24px;left:auto;';
    var dark = cfg.darkMode ? '#0b1220' : bg;
    var darkText = cfg.darkMode ? '#e2e8f0' : text;
    var css =
      ".aw-root{position:fixed;bottom:24px;"+corner+"z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;}"+
      ".aw-bubble{width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,"+primary+","+accent+");box-shadow:0 12px 30px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;color:#fff;transition:transform .25s ease;}"+
      ".aw-bubble:hover{transform:scale(1.08);}"+
      ".aw-bubble svg{width:32px;height:32px;}"+
      ".aw-pulse::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid "+primary+";animation:aw-pulse 2s infinite;pointer-events:none;}"+
      "@keyframes aw-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}"+
      ".aw-glow{box-shadow:0 0 0 0 "+primary+";animation:aw-glow 2.4s infinite;}"+
      "@keyframes aw-glow{0%{box-shadow:0 0 0 0 "+primary+"66}70%{box-shadow:0 0 0 18px "+primary+"00}100%{box-shadow:0 0 0 0 "+primary+"00}}"+
      ".aw-bounce{animation:aw-bounce 2s infinite}@keyframes aw-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}"+
      ".aw-float{animation:aw-float 4s ease-in-out infinite}@keyframes aw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}"+
      ".aw-panel{position:absolute;bottom:80px;"+corner+"width:340px;max-width:calc(100vw - 32px);background:"+dark+";color:"+darkText+";border-radius:"+radius+";overflow:hidden;box-shadow:0 24px 60px rgba(2,6,23,.35);transform:translateY(12px) scale(.96);opacity:0;pointer-events:none;transition:all .25s cubic-bezier(.2,.9,.3,1.4);}"+
      ".aw-open .aw-panel{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}"+
      ".aw-header{padding:18px 18px 16px;background:linear-gradient(135deg,"+primary+","+accent+");color:#fff;}"+
      ".aw-h-row{display:flex;align-items:center;gap:12px;}"+
      ".aw-avatar{width:44px;height:44px;border-radius:50%;background:#ffffff33;overflow:hidden;flex-shrink:0;}"+
      ".aw-avatar img{width:100%;height:100%;object-fit:cover}"+
      ".aw-h-name{font-weight:600;font-size:15px}"+
      ".aw-h-sub{font-size:12px;opacity:.85;display:flex;align-items:center;gap:6px;margin-top:2px}"+
      ".aw-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px #ffffff33}"+
      ".aw-body{padding:18px;}"+
      ".aw-msg{background:"+(cfg.darkMode?'#111827':'#f1f5f9')+";color:"+darkText+";padding:12px 14px;border-radius:14px;border-top-left-radius:4px;font-size:14px;line-height:1.45;max-width:90%;}"+
      ".aw-typing{display:inline-flex;gap:4px;padding:10px 14px;background:"+(cfg.darkMode?'#111827':'#f1f5f9')+";border-radius:14px;border-top-left-radius:4px;}"+
      ".aw-typing span{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:aw-dot 1.2s infinite}.aw-typing span:nth-child(2){animation-delay:.2s}.aw-typing span:nth-child(3){animation-delay:.4s}"+
      "@keyframes aw-dot{0%,80%,100%{opacity:.3}40%{opacity:1}}"+
      ".aw-form{margin-top:14px;display:grid;gap:8px}"+
      ".aw-form input,.aw-form textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid "+(cfg.darkMode?'#1f2937':'#e2e8f0')+";background:"+(cfg.darkMode?'#0b1220':'#fff')+";color:"+darkText+";font:inherit;font-size:14px;outline:none;}"+
      ".aw-form input:focus,.aw-form textarea:focus{border-color:"+primary+";}"+
      ".aw-cta{margin-top:12px;width:100%;padding:12px 14px;border-radius:12px;border:none;background:linear-gradient(135deg,"+primary+","+accent+");color:#fff;font-weight:600;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;}"+
      ".aw-cta:hover{filter:brightness(1.05)}"+
      ".aw-agents{display:grid;gap:8px;margin-top:12px}"+
      ".aw-agent{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:"+(cfg.darkMode?'#0f172a':'#f8fafc')+";cursor:pointer;border:1px solid transparent;transition:.15s}"+
      ".aw-agent:hover{border-color:"+primary+"}"+
      ".aw-agent .aw-avatar{width:36px;height:36px;background:#cbd5e1}"+
      ".aw-agent-meta{flex:1;min-width:0}"+
      ".aw-agent-name{font-size:13px;font-weight:600;color:"+darkText+"}"+
      ".aw-agent-role{font-size:11px;color:#64748b}"+
      ".aw-foot{padding:10px 14px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid "+(cfg.darkMode?'#1f2937':'#eef2f7')+"}"+
      ".aw-foot a{color:inherit;text-decoration:none}"+
      ".aw-close{position:absolute;top:10px;right:12px;background:transparent;border:0;color:#fff;opacity:.85;cursor:pointer;font-size:20px;line-height:1}"+
      ".aw-sticky{position:fixed;left:0;right:0;bottom:0;background:linear-gradient(135deg,"+primary+","+accent+");color:#fff;padding:12px 16px;display:flex;justify-content:center;align-items:center;gap:10px;z-index:2147483000;font-weight:600;cursor:pointer;}";
    var s = document.createElement('style'); s.id = 'aireatro-widget-style'; s.textContent = css;
    document.head.appendChild(s);
    // attach animation class
    if (anim) document.documentElement.style.setProperty('--aw-anim', anim);
  }

  function el(tag, attrs, children){
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      if (k === 'style') Object.assign(n.style, attrs[k]);
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function(c){ if (typeof c === 'string') n.appendChild(document.createTextNode(c)); else if (c) n.appendChild(c); });
    return n;
  }

  function waLink(phone, msg){
    var p = String(phone || '').replace(/[^\d]/g, '');
    return 'https://wa.me/' + p + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  function buildPanel(data){
    var cfg = data.config || {};
    var brand = cfg.brandName || data.name || 'Chat with us';
    var subtitle = cfg.subtitle || 'Typically replies in minutes';
    var greeting = cfg.greeting || "Hi 👋 How can we help you today?";
    var cta = cfg.ctaText || 'Start Chat on WhatsApp';
    var prefilled = cfg.prefilledMessage || 'Hello, I came from your website.';

    var panel = el('div', { class: 'aw-panel' }, [
      el('div', { class: 'aw-header' }, [
        el('button', { class: 'aw-close', 'aria-label': 'Close', onclick: function(){ root.classList.remove('aw-open'); track('close'); } }, ['×']),
        el('div', { class: 'aw-h-row' }, [
          el('div', { class: 'aw-avatar' }, cfg.logoUrl ? [el('img', { src: cfg.logoUrl, alt: '' })] : []),
          el('div', {}, [
            el('div', { class: 'aw-h-name' }, [brand]),
            el('div', { class: 'aw-h-sub' }, [el('span', { class: 'aw-dot' }), subtitle]),
          ])
        ])
      ]),
      el('div', { class: 'aw-body' }, [
        el('div', { class: 'aw-msg' }, [greeting]),
        (cfg.showTyping ? el('div', { class: 'aw-typing', style:{ marginTop:'8px' } }, [el('span'), el('span'), el('span')]) : null),
        renderBody(data, prefilled, cta),
      ]),
      el('div', { class: 'aw-foot' }, cfg.hideBranding ? [] : [el('a', { href: 'https://aireatro.com', target: '_blank', rel: 'noopener' }, ['⚡ Powered by Aireatro'])]),
    ]);
    return panel;
  }

  function renderBody(data, prefilled, ctaText){
    var cfg = data.config || {};
    var wrap = el('div');
    var agents = (data.agents || []);
    if (cfg.type === 'multi-agent' && agents.length) {
      var list = el('div', { class: 'aw-agents' });
      agents.forEach(function(a){
        var item = el('div', { class: 'aw-agent', onclick: function(){ openWa(a.phone_e164, a.prefilled_message || prefilled); } }, [
          el('div', { class: 'aw-avatar' }, a.avatar_url ? [el('img', { src: a.avatar_url, alt: '' })] : []),
          el('div', { class: 'aw-agent-meta' }, [
            el('div', { class: 'aw-agent-name' }, [a.name]),
            el('div', { class: 'aw-agent-role' }, [(a.role || '') + (a.department ? ' • ' + a.department : '')]),
          ]),
          el('div', { style: { color: '#22c55e', fontSize:'11px', fontWeight:'600' } }, ['Chat'])
        ]);
        list.appendChild(item);
      });
      wrap.appendChild(list);
      return wrap;
    }

    if (cfg.collectLead) {
      var form = el('form', { class: 'aw-form', onsubmit: function(e){ e.preventDefault(); submitLead(form, data, prefilled); } });
      if (cfg.fieldName !== false) form.appendChild(el('input', { type:'text', name:'name', placeholder:'Your name', required: cfg.requireName ? 'true' : null }));
      if (cfg.fieldPhone !== false) form.appendChild(el('input', { type:'tel', name:'phone', placeholder:'Phone (with country code)', required: cfg.requirePhone ? 'true' : null }));
      if (cfg.fieldEmail) form.appendChild(el('input', { type:'email', name:'email', placeholder:'Email (optional)' }));
      form.appendChild(el('textarea', { name:'message', placeholder:'How can we help?', rows:'2' }));
      form.appendChild(el('button', { class: 'aw-cta', type:'submit' }, [waIcon(), ctaText]));
      wrap.appendChild(form);
      return wrap;
    }

    var btn = el('button', { class: 'aw-cta', type: 'button', onclick: function(){ track('click'); openWa(data.whatsapp_number, prefilled); } }, [waIcon(), ctaText]);
    wrap.appendChild(btn);
    return wrap;
  }

  function waIcon(){
    var span = document.createElement('span');
    span.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.5 0 .2 5.3.2 11.86a11.7 11.7 0 0 0 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 0 0 5.65 1.44h.01c6.55 0 11.86-5.3 11.86-11.86a11.78 11.78 0 0 0-3.4-8.42zM12.06 21.5h-.01a9.66 9.66 0 0 1-4.92-1.35l-.35-.21-3.8 1 .99-3.7-.23-.38a9.62 9.62 0 0 1-1.49-5.1c0-5.32 4.34-9.65 9.66-9.65 2.58 0 5 1 6.83 2.83a9.6 9.6 0 0 1 2.82 6.83c0 5.32-4.33 9.65-9.65 9.65zm5.59-7.23c-.31-.16-1.81-.89-2.09-.99-.28-.1-.49-.16-.69.16-.21.31-.79.99-.97 1.2-.18.21-.36.23-.67.08-.31-.16-1.31-.48-2.49-1.54-.92-.82-1.54-1.82-1.72-2.13-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.55.15-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.69-1.66-.95-2.27-.25-.6-.5-.51-.69-.52l-.59-.01c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.62 0 1.54 1.13 3.04 1.29 3.25.16.21 2.23 3.4 5.4 4.77.76.33 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.81-.74 2.06-1.45.25-.71.25-1.32.18-1.45-.07-.13-.27-.21-.58-.36z"/></svg>';
    return span;
  }

  function openWa(phone, msg){
    track('click', { phone: String(phone || '').slice(-4) });
    window.open(waLink(phone, msg), '_blank');
  }

  function submitLead(form, data, prefilled){
    var fd = new FormData(form);
    var payload = { id: widgetId, page_url: location.href, device: detectDevice(), session_id: sid,
      name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), message: fd.get('message') || prefilled };
    var btn = form.querySelector('.aw-cta'); if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
    fetch(FN + '/widget-lead', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      .then(function(r){ return r.json(); }).then(function(res){
        if (res && res.whatsapp_url) window.open(res.whatsapp_url, '_blank');
        else openWa(data.whatsapp_number, payload.message);
      }).catch(function(){ openWa(data.whatsapp_number, payload.message); })
      .finally(function(){ if (btn) { btn.disabled = false; btn.style.opacity = '1'; } });
  }

  var root, panel;
  function mount(data){
    var cfg = data.config || {};
    if (!shouldShow(cfg)) return;
    injectStyles(cfg);

    if (cfg.type === 'sticky-bar') {
      var bar = el('div', { class: 'aw-sticky', onclick: function(){ track('click'); openWa(data.whatsapp_number, cfg.prefilledMessage); } }, [waIcon(), cfg.ctaText || 'Chat with us on WhatsApp']);
      document.body.appendChild(bar);
      track('view');
      return;
    }

    root = el('div', { class: 'aw-root' });
    var animClass = ({ pulse: 'aw-pulse', glow: 'aw-glow', bounce: 'aw-bounce', float: 'aw-float' })[cfg.animation || 'pulse'] || '';
    var bubble = el('button', { class: 'aw-bubble ' + animClass, 'aria-label': 'Open chat', onclick: function(){
      var open = root.classList.toggle('aw-open');
      track(open ? 'open' : 'close');
    } }, [waIcon()]);
    bubble.style.position = 'relative';
    root.appendChild(bubble);
    panel = buildPanel(data);
    root.appendChild(panel);
    document.body.appendChild(root);
    track('view');

    var delay = Math.max(0, parseInt(cfg.openDelay || 0, 10));
    if (cfg.autoOpen && delay >= 0) setTimeout(function(){ root.classList.add('aw-open'); track('open'); }, delay * 1000);

    if (cfg.exitIntent) {
      document.addEventListener('mouseleave', function(e){ if (e.clientY <= 0 && !root.classList.contains('aw-open')) { root.classList.add('aw-open'); track('open'); } });
    }
    if (cfg.scrollTrigger) {
      var fired = false;
      window.addEventListener('scroll', function(){
        if (fired) return;
        var pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
        if (pct >= cfg.scrollTrigger) { fired = true; root.classList.add('aw-open'); track('open'); }
      }, { passive: true });
    }
  }

  // Fetch config
  fetch(FN + '/widget-config?id=' + encodeURIComponent(widgetId))
    .then(function(r){ if (!r.ok) throw new Error('config'); return r.json(); })
    .then(function(data){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ mount(data); }); else mount(data); })
    .catch(function(e){ console.warn('[Aireatro] widget load failed', e); });
})();
