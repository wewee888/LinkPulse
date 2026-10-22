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
    defaultModel: 'MiniMax-M2',
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
