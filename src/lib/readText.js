/** Collects the visible text of any element, line by line, skipping hidden parts and speech controls. */

const BASE_SKIP = '[data-speak-skip], script, style, svg, noscript, [aria-hidden="true"]';

const BLOCK_TAGS = /^(P|DIV|LI|H1|H2|H3|H4|H5|H6|SECTION|ARTICLE|DD|DT|TR|TD|TH|UL|OL|LABEL|BUTTON|A|BLOCKQUOTE|FIGURE|HEADER|FOOTER|ASIDE|NAV|FORM)$/;

function isHidden(element) {
  const style = window.getComputedStyle(element);
  return style.display === 'none' || style.visibility === 'hidden';
}

export function collectReadableText(root, { includeControls = false } = {}) {
  if (!root) return '';
  const parts = [];

  const walk = (node) => {
    if (node.nodeType === 3) {
      const value = node.nodeValue.replace(/\s+/g, ' ').trim();
      if (value) parts.push(value);
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.matches?.(BASE_SKIP) || isHidden(node)) return;
    if (!includeControls && node.tagName === 'BUTTON') return;

    const isBlock = BLOCK_TAGS.test(node.tagName);
    if (isBlock && parts.length) parts.push('\n');
    node.childNodes.forEach(walk);
    if (isBlock) parts.push('\n');
  };

  walk(root);
  return parts.join(' ').replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{2,}/g, '\n').trim();
}