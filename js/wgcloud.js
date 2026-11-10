




















(function () {
  'use strict';

  
  var CLOUD_CFG = {
    endpoint: 'https://your-app.example.com',
    publishableKey: '<PUBLISHABLE_KEY>',
    oauthRelayBaseUrl: 'https://your-tenant.example.com/oauth'
  };
  var SDK_URL = '<CLOUD_SDK_URL>';
  var TABLE = 'wargames';

  


  var q = new URLSearchParams(location.search);
  var active = location.hostname === 'your-app.example.com'
    && q.get('cloud') !== '0';

  var clientP = null;   

  function init() {
    if (clientP) return clientP;
    clientP = new Promise(function (resolve) {
      if (!active || !window.CloudSDK) {
        if (active) console.warn('[wgcloud] CloudSDK 全局缺失');
        resolve(null); return;
      }
      try {
        var cloud = window.CloudSDK.createCloudSDK({
          endpoint: CLOUD_CFG.endpoint,
          oauthRelayBaseUrl: CLOUD_CFG.oauthRelayBaseUrl,
          publishableKey: CLOUD_CFG.publishableKey
        });
        resolve(cloud);
      } catch (e) {
        console.warn('[wgcloud] init 失败', e && e.message);
        resolve(null);
      }
    });
    return clientP;
  }

  var sdkP = null;      
  function loadSdk() {
    if (sdkP) return sdkP;
    sdkP = new Promise(function (resolve) {
      if (window.CloudSDK) { resolve(); return; }
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = function () { resolve(); };
      s.onerror = function () {
        console.warn('[wgcloud] SDK 加载失败（CDN 不可达？），云端落盘停用');
        resolve();               
      };
      document.head.appendChild(s);
    });
    return sdkP;
  }

  function ready() {
    if (!active) return Promise.resolve(null);
    return loadSdk().then(init);
  }

  

  function saveWg(body) {
    return ready().then(function (cloud) {
      if (!cloud || !body || !body.id) return { ok: false };
      return cloud.database.from(TABLE)
        .upsert({
          gid: String(body.id).slice(0, 64),
          title: body.title || null,
          created: body.created || null,
          brains: body.brains || null,
          outcome: body.outcome || null,
          data: body
        }, { onConflict: 'gid' })
        .then(function (r) {
          if (r && r.error) {
            console.warn('[wgcloud] upsert 失败', r.error.message || r.error);
            return { ok: false };
          }
          return { ok: true };
        });
    }).catch(function (e) {
      console.warn('[wgcloud] saveWg 异常', e && e.message);
      return { ok: false };
    });
  }

  
  function loadWg(gid) {
    return ready().then(function (cloud) {
      if (!cloud || !gid) return null;
      return cloud.database.from(TABLE)
        .select('data')
        .eq('gid', String(gid).slice(0, 64))
        .maybeSingle()
        .then(function (r) {
          if (r && r.error) { console.warn('[wgcloud] load 失败', r.error.message || r.error); return null; }
          return (r && r.data && r.data.data) || null;
        });
    }).catch(function (e) {
      console.warn('[wgcloud] loadWg 异常', e && e.message);
      return null;
    });
  }

  
  function listWg(limit) {
    return ready().then(function (cloud) {
      if (!cloud) return null;
      return cloud.database.from(TABLE)
        .select('gid,title,created')
        .order('updated_at', { ascending: false })
        .limit(limit || 50)
        .then(function (r) {
          if (r && r.error) { console.warn('[wgcloud] list 失败', r.error.message || r.error); return null; }
          return (r && r.data || []).map(function (row) {
            return { id: row.gid, title: row.title || '(未命名)', created: row.created || '' };
          });
        });
    }).catch(function (e) {
      console.warn('[wgcloud] listWg 异常', e && e.message);
      return null;
    });
  }

  window.WGCLOUD = { active: active, ready: ready, saveWg: saveWg, loadWg: loadWg, listWg: listWg };
})();
