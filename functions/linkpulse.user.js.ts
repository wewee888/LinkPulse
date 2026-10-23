import { generateChromeExtensionFiles } from '../src/utils/seoEngine';

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const serverUrl = url.origin;

  const bundle = generateChromeExtensionFiles({
    serverUrl,
    defaultTargetUrl: 'https://soundtest.pro',
    defaultKeyword: 'online sound test & audio latency benchmark',
    defaultBrandName: 'SoundTest Pro',
    defaultAuthorName: 'Alex Chen',
    defaultAuthorEmail: 'alex@soundtest.pro',
    defaultModel: 'MiniMax-M3.1-Flash',
    defaultPlacementMode: 'html_anchor',
  });

  const userscript = `// ==UserScript==
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


${bundle['content.js']}
`;

  return new Response(userscript, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Content-Disposition': 'inline; filename="linkpulse.user.js"',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
