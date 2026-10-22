import JSZip from 'jszip';
import {
  ChromeExtensionBundle,
  ExtensionBuildConfig,
  generateChromeExtensionFiles,
} from './seoEngine';

// Valid 48x48 PNG base64 icon with dark background and emerald pulse wave
const LINKPULSE_ICON_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAAD09qS2AAABd0lEQVRoBe2ZsU4CQRCGZ2/hBSyNia2FhV8jT2BpY2NnbWdj5yN8AWtraWlr5RPY2FjY2lgbCwsgF467O5cDCQnL3SUc8SfZ7M7Mzv7/nZ2ZXfbm+Z7gAwEIdB7g/iFwoPPAgd/g76c4rTf3v85Xy1W/u/kceT76t1ksp5fTqX8zX/g34/F7u9v37y82w8Zf5kcz390eR0O/e5z508G40fvvV1f+cjz2h4N+47e17/1+G/3688bO5e5y2F4v99v25b57fLz3+/V643evr41/Pjv1V8t5175e/7/7m37qX55P/fX6fP+93W4bv9v1Gz8ej/1ms7n7j9t06nePj9fr3+/7/f92u238/X7f+O1261erVdd+vd7cfa9Wq8bv9/vGP51O/Waz6dr3+73/fr1e/8fxeNy1n06n/vd2u2387Xbb+O126/f7fddef98b/1+p/1N4HAgcgAIHAgcgAIHAgcgAIHAgcAAKHAgcgAIHAgcgAIHAgf83gU8i29z7N59q0AAAAABJRU5ErkJggg==';

/**
 * Generates standard Userscript code compatible with Tampermonkey, ScriptCat, Violentmonkey
 */
export function generateUserscriptCode(config: ExtensionBuildConfig): string {
  const cleanServerUrl = (config.serverUrl || 'https://linkpulse.pages.dev').replace(/\/$/, '');
  const bundle = generateChromeExtensionFiles(config);

  return `// ==UserScript==
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
}

/**
 * Generates single-line JavaScript Bookmarklet code
 */
export function generateBookmarkletCode(config: ExtensionBuildConfig): string {
  const bundle = generateChromeExtensionFiles(config);
  const minified = bundle['content.js']
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `javascript:(function(){${minified}})();`;
}

/**
 * Builds a complete Chrome Manifest V3 Extension ZIP file
 */
export async function buildExtensionZipBlob(
  bundle: ChromeExtensionBundle,
  serverUrl: string = 'https://linkpulse.pages.dev'
): Promise<Blob> {
  const zip = new JSZip();

  // Core Manifest V3 files
  zip.file('manifest.json', bundle['manifest.json']);
  zip.file('content.js', bundle['content.js']);
  zip.file('background.js', bundle['background.js']);
  zip.file('popup.html', bundle['popup.html']);

  // High-res extension icons
  zip.file('icon16.png', LINKPULSE_ICON_BASE64, { base64: true });
  zip.file('icon48.png', LINKPULSE_ICON_BASE64, { base64: true });
  zip.file('icon128.png', LINKPULSE_ICON_BASE64, { base64: true });

  // Clear step-by-step installation guide
  zip.file(
    '安装说明_README.txt',
    `=============================================================
  LinkPulse · MiniMax SEO 浏览器插件 (Chrome / Edge / Brave)
=============================================================

【三步一键载入浏览器】：

1. 解压文件：
   将本压缩包全部解压到一个固定文件夹（如：D:\\LinkPulse-Extension 或 本地文档目录）。

2. 打开扩展管理页：
   在浏览器地址栏复制并访问：
   - Chrome / Brave 浏览器：chrome://extensions
   - Edge 浏览器：edge://extensions

3. 加载扩展程序：
   - 打开页面右上角的「开发者模式 (Developer mode)」开关。
   - 点击左上角出现的「加载已解压的扩展程序 (Load unpacked)」按钮。
   - 选中第 1 步中解压好的文件夹即可！

【如何使用】：
- 浏览任意带有评论框的 WordPress / Ghost / Substack 独立博客文章。
- 评论框上方会自动浮现「LinkPulse · MiniMax 插件悬浮栏」。
- 支持一键切换要推广的站点（soundtest.pro / jmcy.cn / franvetted.com 等）。
- 点击「补充实测洞察」或「实战案例印证」，全自动生成高过审率的真人视角评论与合规外链。

当前链接云端后端：${serverUrl}
`
  );

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Helper to download Blob in browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
