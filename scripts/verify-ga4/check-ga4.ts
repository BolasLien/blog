import { parse } from 'node-html-parser';

export const GA4_MEASUREMENT_ID = 'G-SG50KRG586';

// 只接受瀏覽器會在主執行緒直接執行的 script type；
// text/partytown 之類的 type 會讓瀏覽器略過，事件就不會送出
function isExecutableType(type: string | undefined): boolean {
  if (!type) return true;
  const t = type.trim().toLowerCase();
  return t === '' || t === 'text/javascript' || t === 'module';
}

export function checkGa4(html: string, measurementId = GA4_MEASUREMENT_ID): string[] {
  const root = parse(html);
  const scripts = root.querySelectorAll('script');
  const problems: string[] = [];

  const partytown = scripts.filter((s) => s.getAttribute('type')?.toLowerCase().includes('partytown'));
  if (partytown.length > 0) {
    problems.push(`有 ${partytown.length} 個 text/partytown script（GA4 不可交給 Partytown）`);
  }

  const loaderSrc = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  const loaders = scripts.filter((s) => s.getAttribute('src') === loaderSrc);
  if (loaders.length !== 1) {
    problems.push(`gtag.js loader 應出現 1 次，實際 ${loaders.length} 次`);
  } else {
    const loader = loaders[0];
    if (!isExecutableType(loader.getAttribute('type'))) {
      problems.push(`gtag.js loader 的 type="${loader.getAttribute('type')}" 不會被瀏覽器執行`);
    }
    if (!loader.hasAttribute('async')) {
      problems.push('gtag.js loader 缺少 async');
    }
  }

  const configPattern = new RegExp(`gtag\\(\\s*['"]config['"]\\s*,\\s*['"]${measurementId}['"]`);
  const configs = scripts.filter((s) => !s.getAttribute('src') && configPattern.test(s.textContent));
  if (configs.length !== 1) {
    problems.push(`gtag('config', '${measurementId}') 應出現 1 次，實際 ${configs.length} 次`);
  } else if (!isExecutableType(configs[0].getAttribute('type'))) {
    problems.push(`gtag config script 的 type="${configs[0].getAttribute('type')}" 不會被瀏覽器執行`);
  }

  return problems;
}
