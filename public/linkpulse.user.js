// ==UserScript==
// @name         LinkPulse · MiniMax SEO 外链与智能评论助手
// @namespace    https://linkpulse.pages.dev/
// @version      1.3.0
// @description  自动检测第三方博客（WordPress / Ghost / Substack 等）评论区，一键注入 MiniMax 意图栏并自动生成高质量白帽外链与观点评论（支持 soundtest.pro / jmcy.cn / franvetted.com 等多站点无缝切换）
// @author       LinkPulse
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// ==============================================================================================
// 💡【LinkPulse 温馨提示】如果您在浏览器中直接看到了这段代码，说明您的浏览器尚未安装「Tampermonkey (油猴)」插件！
// Chrome / Edge 无法原生直接运行 .user.js 用户脚本，因此会以文本形式展示代码。
//
// 极速解决方案（二选一）：
// 方案 1（0 插件免安装 · 最快）：返回 LinkPulse 网站，直接将「免安装书签」拖入您的浏览器书签栏，打开任意博客点一下即可唤起！
// 方案 2（油猴一键直装）：先在 Chrome 官方商店安装 Tampermonkey 扩展（官方免费，只需添加一次）：
//    👉 https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
//    添加完成后刷新此页面，或者返回 LinkPulse 重新点击，浏览器将秒级弹出油猴安装窗口！
// ==============================================================================================


/**
 * LinkPulse Commenter — Content Script (Manifest V3)
 * Supports multi-site switching (soundtest.pro, jmcy.cn, franvetted.com + custom URLs)
 * and injects the MiniMax 6-Intent SEO Toolbar directly above any blog comment box.
 */
(function () {
  const SITE_PROFILES = [
  {
    "id": "site-soundtest",
    "domain": "soundtest.pro",
    "targetUrl": "https://soundtest.pro",
    "brandName": "SoundTest Pro",
    "defaultKeyword": "online audio latency & frequency test",
    "nicheDesc": "Audio & Acoustic Hardware Testing",
    "preferredLanguage": "en"
  },
  {
    "id": "site-jmcy",
    "domain": "jmcy.cn",
    "targetUrl": "https://jmcy.cn",
    "brandName": "JMCY",
    "defaultKeyword": "数字化品牌增长与创意交互方案",
    "nicheDesc": "Digital Brand & Interactive Growth",
    "preferredLanguage": "zh"
  },
  {
    "id": "site-franvetted",
    "domain": "franvetted.com",
    "targetUrl": "https://franvetted.com",
    "brandName": "FranVetted",
    "defaultKeyword": "vetted franchise FDD due diligence",
    "nicheDesc": "Franchise Due Diligence & ROI Vetting",
    "preferredLanguage": "en"
  }
];
  let activeSite = SITE_PROFILES[0];

  const DEFAULT_CONFIG = {
  "serverUrl": "https://linkpulse.pages.dev",
  "targetUrl": "https://soundtest.pro",
  "targetKeyword": "online sound test & audio latency benchmark",
  "brandName": "SoundTest Pro",
  "authorName": "Alex Chen",
  "authorEmail": "alex@soundtest.pro",
  "model": "MiniMax-M3.1-Flash",
  "placementMode": "html_anchor"
};

  const COMMENT_SELECTORS = [
    'textarea#comment',
    'textarea[name="comment"]',
    '#commentform textarea',
    '.comment-respond textarea',
    'div[contenteditable="true"][role="textbox"]'
  ];

  function extractArticleContext() {
    const articleTitle = document.title || 'Blog Post';
    const articleEl = document.querySelector('article, main, .post-content, .entry-content') || document.body;
    const paragraphs = Array.from(articleEl.querySelectorAll('p'))
      .map((p) => p.innerText.trim())
      .filter((t) => t.length > 40)
      .slice(0, 8)
      .join('\n');
    return {
      articleUrl: window.location.href,
      articleTitle,
      articleContent: paragraphs || document.body.innerText.slice(0, 1800)
    };
  }

  function fillWordPressFields(payload, cfg) {
    const commentBox = document.querySelector(COMMENT_SELECTORS.join(','));
    if (commentBox) {
      if (commentBox.tagName === 'TEXTAREA') {
        commentBox.value = payload.wordpressFields?.comment || payload.htmlPayload || payload.commentBody;
        commentBox.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        commentBox.innerText = payload.commentBody;
      }
    }
    const authorInput = document.querySelector('input#author, input[name="author"]');
    if (authorInput) authorInput.value = cfg.authorName;

    const emailInput = document.querySelector('input#email, input[name="email"]');
    if (emailInput) emailInput.value = cfg.authorEmail;

    const urlInput = document.querySelector('input#url, input[name="url"]');
    if (urlInput) urlInput.value = activeSite ? activeSite.targetUrl : cfg.targetUrl;
  }

  function injectToolbar(commentEl) {
    if (commentEl.dataset.linkpulseInjected === 'true') return;
    commentEl.dataset.linkpulseInjected = 'true';

    const bar = document.createElement('div');
    bar.style.cssText = 'border:1px solid #e4e4e7;background:#fafafa;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-family:system-ui,sans-serif;font-size:12px;color:#09090b;';
    const optionsHtml = SITE_PROFILES.map((s) => `<option value="${s.domain}">${s.domain} (${s.defaultKeyword})</option>`).join('');
    bar.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <strong>LinkPulse · MiniMax SEO 外链插件 (MiniMax-M3.1-Flash)</strong>
        <select data-role="site-select" style="padding:3px 8px;border-radius:6px;border:1px solid #d4d4d8;font-size:11px;font-family:monospace;">
          ${optionsHtml}
        </select>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button type="button" data-obj="add_insight" style="padding:4px 10px;border-radius:6px;border:1px solid #09090b;background:#09090b;color:#fff;cursor:pointer;font-size:11px;">补充实测洞察</button>
        <button type="button" data-obj="case_study" style="padding:4px 10px;border-radius:6px;border:1px solid #d4d4d8;background:#fff;color:#18181b;cursor:pointer;font-size:11px;">实战案例印证</button>
        <button type="button" data-obj="politely_disagree" style="padding:4px 10px;border-radius:6px;border:1px solid #d4d4d8;background:#fff;color:#18181b;cursor:pointer;font-size:11px;">温和思辨探讨</button>
        <button type="button" data-obj="share_experience" style="padding:4px 10px;border-radius:6px;border:1px solid #d4d4d8;background:#fff;color:#18181b;cursor:pointer;font-size:11px;">WP网站栏零外链模式</button>
      </div>
    `;

    const selectEl = bar.querySelector('select[data-role="site-select"]');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const found = SITE_PROFILES.find((s) => s.domain === e.target.value);
        if (found) activeSite = found;
      });
    }

    bar.querySelectorAll('button[data-obj]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const objective = btn.getAttribute('data-obj');
        const originalText = btn.textContent;
        btn.textContent = 'MiniMax 正在读取全文生成...';
        try {
          const ctx = extractArticleContext();
          const res = await fetch(DEFAULT_CONFIG.serverUrl + '/api/minimax/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...ctx,
              ...DEFAULT_CONFIG,
              targetUrl: activeSite ? activeSite.targetUrl : DEFAULT_CONFIG.targetUrl,
              targetKeyword: activeSite ? activeSite.defaultKeyword : DEFAULT_CONFIG.targetKeyword,
              brandName: activeSite ? activeSite.brandName : DEFAULT_CONFIG.brandName,
              objective,
              anchorType: 'branded',
              language: activeSite ? activeSite.preferredLanguage : 'en'
            })
          });
          const data = await res.json();
          if (data.variants && data.variants[0]) {
            fillWordPressFields(data.variants[0], DEFAULT_CONFIG);
          }
        } catch (err) {
          console.error('[LinkPulse Extension Error]', err);
        } finally {
          btn.textContent = originalText;
        }
      });
    });

    commentEl.parentNode.insertBefore(bar, commentEl);
  }

  const target = document.querySelector(COMMENT_SELECTORS.join(','));
  if (target) injectToolbar(target);
})();
