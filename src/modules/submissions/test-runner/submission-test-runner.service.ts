import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import type { Check, FriendlyResult, TestConfig } from './types';

type RunResult = {
  passed: boolean;
  results: FriendlyResult[];
};

@Injectable()
export class SubmissionTestRunnerService {
  run(submittedCode: string, testConfig: TestConfig): RunResult {
    const safeHtml = sanitizeSubmittedHtml(normalizeHtmlForParsing(submittedCode));
    const dom = new JSDOM(safeHtml, {
      runScripts: 'outside-only',
      resources: 'usable',
      pretendToBeVisual: false,
      url: 'https://picode.local',
    });

    const document = dom.window.document;

    // Build a super-simple style index from <style> tags.
    const cssText = Array.from(
      document.querySelectorAll('style'),
    )
      .map((s) => (s as HTMLStyleElement).textContent ?? '')
      .join('\n');
    const styleIndex = buildStyleIndex(cssText);

    const checks = testConfig?.checks ?? [];
    const results = checks.map((c) =>
      this.runOneCheck(c, document, styleIndex),
    );
    const passed = results.every((r) => r.passed);
    return { passed, results };
  }

  private runOneCheck(
    check: Check,
    document: Document,
    styleIndex: StyleIndex,
  ): FriendlyResult {
    const name = check.description;

    // Basic "exists" check when no explicit rule is provided.
    if (!('rule' in check) || !check.rule) {
      const selector = check.selector ?? '';
      const exists = selector ? Boolean(document.querySelector(selector)) : false;

      const contentAware = evaluateContentAwareExistence(selector, document);
      const passed = contentAware?.passed ?? exists;
      const message =
        contentAware?.message ??
        (exists
          ? kidSuccess(name)
          : kidTryAgain(
              name,
              selector
                ? `I couldn't find a \`${selector}\` element.`
                : "I couldn't find what I was looking for.",
            ));
      return {
        name,
        passed,
        message,
      };
    }

    switch (check.rule) {
      case 'attr': {
        const el = document.querySelector(check.selector);
        const ok = Boolean(el?.getAttribute(check.attr)?.trim());

        // Extra quality: images must have meaningful alt text.
        if (check.selector === 'img' && check.attr === 'alt') {
          const alt = el?.getAttribute('alt') ?? '';
          const meaningful = alt.trim().length > 0;
          return {
            name,
            passed: meaningful,
            message: meaningful
              ? kidSuccess(name)
              : kidTryAgain(name, 'Almost there! Describe your image using alt text.'),
          };
        }

        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(name, `Add \`${check.attr}\` to \`${check.selector}\`.`),
        };
      }

      case 'count': {
        const nodes = Array.from(document.querySelectorAll(check.selector));
        const count = nodes.length;
        const ok =
          typeof check.equals === 'number'
            ? count === check.equals
            : typeof check.gte === 'number'
              ? count >= check.gte
              : count > 0;

        // Content quality: for text elements, ensure the required count is non-empty.
        if (ok && (check.selector === 'p' || check.selector === 'li')) {
          const required =
            typeof check.equals === 'number'
              ? check.equals
              : typeof check.gte === 'number'
                ? check.gte
                : 1;
          const nonEmptyCount = nodes.filter((n) =>
            (n.textContent ?? '').trim().length > 0,
          ).length;
          const contentOk = nonEmptyCount >= required;
          const hint =
            check.selector === 'p'
              ? 'Almost there! Add a sentence inside your paragraph.'
              : 'Almost there! Add words inside your list item.';
          return {
            name,
            passed: contentOk,
            message: contentOk ? kidSuccess(name) : kidTryAgain(name, hint),
          };
        }

        const target =
          typeof check.equals === 'number'
            ? `exactly ${check.equals}`
            : typeof check.gte === 'number'
              ? `at least ${check.gte}`
              : 'some';
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(
                name,
                `Try adding ${target} \`${check.selector}\` element(s).`,
              ),
        };
      }

      case 'any': {
        const ok = check.selectors.some((s) => Boolean(document.querySelector(s)));
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(
                name,
                `Add one of these: ${check.selectors.map((s) => `\`${s}\``).join(', ')}.`,
              ),
        };
      }

      case 'bodyTextNotEmpty': {
        const bodyText = (document.body?.textContent ?? '').trim();
        const ok = bodyText.length > 0;
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(name, 'Add some text inside your page body.'),
        };
      }

      case 'textNotEmpty': {
        const txt = (document.body?.textContent ?? '').replace(/\s+/g, ' ').trim();
        const ok = txt.length > 0;
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(name, 'Add some words to your page.'),
        };
      }

      case 'style': {
        const el = document.querySelector(check.selector);
        const ok = elementHasStyle(el, check.property, styleIndex);
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(
                name,
                `Add \`${check.property}\` styling to \`${check.selector}\`.`,
              ),
        };
      }

      case 'hasStyleAttributeOrRule': {
        const el = document.querySelector(check.selector);
        const ok = Boolean(el && elementHasAnyStyle(el, styleIndex));
        return {
          name,
          passed: ok,
          message: ok
            ? kidSuccess(name)
            : kidTryAgain(name, `Add some styling to \`${check.selector}\`.`),
        };
      }
    }
  }
}

function evaluateContentAwareExistence(
  selector: string,
  document: Document,
): { passed: boolean; message: string } | null {
  if (!selector) return null;

  if (selector === 'title') {
    const hasTitleEl = Boolean(document.querySelector('title'));
    const ok = document.title.trim().length > 0;
    if (!hasTitleEl) {
      return { passed: false, message: 'Almost there! Add a page title.' };
    }
    return {
      passed: ok,
      message: ok
        ? 'Great! Your page has a title.'
        : 'Almost there! Add a page title.',
    };
  }

  if (selector === 'h1' || selector === 'h2') {
    const el = document.querySelector(selector);
    const ok = Boolean(el && (el.textContent ?? '').trim().length > 0);
    const hint =
      selector === 'h1'
        ? 'Almost there! Add words inside your main heading.'
        : 'Almost there! Add words inside your smaller heading.';
    return { passed: ok, message: ok ? 'Great! Your heading has words.' : hint };
  }

  if (selector === 'p') {
    const el = document.querySelector('p');
    const ok = Boolean(el && (el.textContent ?? '').trim().length > 0);
    return {
      passed: ok,
      message: ok
        ? 'Great! Your paragraph has words.'
        : 'Almost there! Add a sentence inside your paragraph.',
    };
  }

  if (selector === 'li') {
    const el = document.querySelector('li');
    const ok = Boolean(el && (el.textContent ?? '').trim().length > 0);
    return {
      passed: ok,
      message: ok
        ? 'Great! Your list item has words.'
        : 'Almost there! Add words inside your list item.',
    };
  }

  if (selector === 'a') {
    const el = document.querySelector('a');
    const hrefOk = Boolean(el?.getAttribute('href')?.trim());
    const textOk = Boolean((el?.textContent ?? '').trim().length > 0);
    const ok = Boolean(el && hrefOk && textOk);
    return {
      passed: ok,
      message: ok
        ? 'Great! Your link looks good.'
        : 'Almost there! Add link text and make sure it has an href.',
    };
  }

  if (selector === 'img') {
    const el = document.querySelector('img');
    const srcOk = Boolean(el?.getAttribute('src')?.trim());
    const alt = el?.getAttribute('alt') ?? '';
    const altOk = alt.trim().length > 0;
    const ok = Boolean(el && srcOk && altOk);
    return {
      passed: ok,
      message: ok
        ? 'Great! Your image has src and alt text.'
        : !el
          ? 'Almost there! Add an image.'
          : !srcOk
            ? 'Almost there! Add a src to your image.'
            : 'Almost there! Describe your image using alt text.',
    };
  }

  return null;
}

function sanitizeSubmittedHtml(html: string): string {
  // Safety: remove scripts + event handler attributes; we only parse DOM.
  const withoutScripts = html.replace(
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    '',
  );
  // Remove inline event handlers like onclick="..."
  return withoutScripts.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
}

function normalizeHtmlForParsing(input: string): string {
  const trimmed = input.trim();
  const looksLikeFullDoc =
    /<html[\s>]/i.test(trimmed) ||
    /<!doctype[\s>]/i.test(trimmed) ||
    /<head[\s>]/i.test(trimmed) ||
    /<body[\s>]/i.test(trimmed);

  if (looksLikeFullDoc) return trimmed;

  // Wrap partial snippets so selectors still work consistently.
  return `<!doctype html><html><head></head><body>${trimmed}</body></html>`;
}

type StyleIndex = Map<string, Map<string, string>>;

function buildStyleIndex(cssText: string): StyleIndex {
  const index: StyleIndex = new Map();
  // Very small CSS parser for MVP: "selector { prop: value; ... }"
  const blocks = cssText.match(/[^{}]+\{[^}]*\}/g) ?? [];
  for (const block of blocks) {
    const m = block.match(/([^{}]+)\{([^}]*)\}/);
    if (!m) continue;
    const selector = m[1].trim();
    const decls = parseStyleDeclarations(m[2]);
    if (!index.has(selector)) index.set(selector, new Map());
    const map = index.get(selector)!;
    for (const [k, v] of decls) map.set(k, v);
  }
  return index;
}

function parseStyleDeclarations(input: string): Map<string, string> {
  const out = new Map<string, string>();
  const parts = input
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
  for (const p of parts) {
    const idx = p.indexOf(':');
    if (idx === -1) continue;
    const key = p.slice(0, idx).trim().toLowerCase();
    const value = p.slice(idx + 1).trim();
    if (key) out.set(key, value);
  }
  return out;
}

function elementHasStyle(
  el: Element | null,
  property: string,
  styleIndex: StyleIndex,
): boolean {
  if (!el) return false;
  const prop = property.toLowerCase();

  // Inline style
  const inline = el.getAttribute('style');
  if (inline) {
    const decls = parseStyleDeclarations(inline);
    if (decls.has(prop) && String(decls.get(prop)).trim().length > 0) return true;
  }

  // Style tag rules (best-effort; only matches simple selectors from our index)
  for (const [selector, decls] of styleIndex.entries()) {
    try {
      if (el.matches(selector) && decls.has(prop) && String(decls.get(prop)).trim()) {
        return true;
      }
    } catch {
      // ignore invalid selectors
    }
  }
  return false;
}

function elementHasAnyStyle(el: Element, styleIndex: StyleIndex): boolean {
  const inline = (el.getAttribute('style') ?? '').trim();
  if (inline.length > 0) return true;
  for (const [selector, decls] of styleIndex.entries()) {
    try {
      if (el.matches(selector) && decls.size > 0) return true;
    } catch {
      // ignore invalid selectors
    }
  }
  return false;
}

function kidSuccess(name: string): string {
  return `Great job! ${name}.`;
}

function kidTryAgain(name: string, hint: string): string {
  return `Almost there! ${hint}`;
}

