// plugins/rehype-table-wrap.mjs
// --------------------------------------------------------------------
// Wrap every <table> in markdown-rendered HTML with
// <div class="table-wrap">…</div>, so the post stylesheet can attach
// horizontal-scroll behaviour + framing on a single hook.
//
// Idempotent: if a table is already inside a .table-wrap, leave it.
// --------------------------------------------------------------------

import { visit } from 'unist-util-visit';

const WRAP_CLASS = 'table-wrap';

function hasClass(node, name) {
  const cls = node?.properties?.className;
  if (!cls) return false;
  if (Array.isArray(cls)) return cls.includes(name);
  return String(cls).split(/\s+/).includes(name);
}

export default function rehypeTableWrap() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table') return;
      if (!parent || typeof index !== 'number') return;

      if (parent.tagName === 'div' && hasClass(parent, WRAP_CLASS)) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: [WRAP_CLASS] },
        children: [node],
      };
    });
  };
}
