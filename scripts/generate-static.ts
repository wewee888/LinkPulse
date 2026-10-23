import fs from 'fs';
import { generateUserscriptCode } from '../src/utils/extensionPacker';

const code = generateUserscriptCode({
  serverUrl: 'https://linkpulse.pages.dev',
  defaultTargetUrl: 'https://soundtest.pro',
  defaultKeyword: 'online sound test & audio latency benchmark',
  defaultBrandName: 'SoundTest Pro',
  defaultAuthorName: 'Alex Chen',
  defaultAuthorEmail: 'alex@soundtest.pro',
  defaultModel: 'MiniMax-M3.1-Flash',
  defaultPlacementMode: 'html_anchor',
});

fs.writeFileSync('public/linkpulse.user.js', code, 'utf8');
console.log('Generated public/linkpulse.user.js, size:', code.length);
