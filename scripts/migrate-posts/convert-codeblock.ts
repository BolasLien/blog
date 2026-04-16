import type { MigratedPost } from './types.ts';

const CODEBLOCK_RE = /\{%\s*codeblock(?:\s+([^%]*?))?\s+lang:([a-zA-Z0-9_+-]+)\s*%\}\n([\s\S]*?)\n\{%\s*endcodeblock\s*%\}/g;

export function convertCodeblock(post: MigratedPost): MigratedPost {
  const warnings: string[] = [...post.warnings];
  const body = post.body.replace(CODEBLOCK_RE, (_match, title, lang, code) => {
    const trimmedTitle = title?.trim();
    if (trimmedTitle) {
      warnings.push(`[convert-codeblock] ${post.slug}: 丟掉 codeblock title "${trimmedTitle}"（Shiki 不支援）`);
    }
    return `\`\`\`${lang}\n${code}\n\`\`\``;
  });

  return { ...post, body, warnings };
}
