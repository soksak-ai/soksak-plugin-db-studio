// Masking render proof (plan §3.3 made visible). The sidecar redacts sensitive values to
// "<redacted:col>" before results leave it; mapQueryResult derives which columns are masked from
// that, and QueryPanel must render masked cells as the glyph — never the redacted marker, never
// plaintext — with select-none so a native copy skips them. This is the security-visible behavior
// the live UI can't be socket-driven to show (the plugin view is a child webview), so it is
// pinned here deterministically.
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryPanel } from './QueryPanel';
import { mapQueryResult } from './db-containers';

// The exact envelope the sidecar's query-run emits (columns carry no flag; values are redacted).
const SIDECAR_OUT = {
  ok: true,
  columns: [{ name: 'id' }, { name: 'email' }, { name: 'password' }],
  rows: [
    [1, 'ada@example.com', '<redacted:password>'],
    [2, 'grace@example.com', '<redacted:password>'],
  ],
  rowCount: 2,
  truncated: false,
};

describe('QueryPanel masking', () => {
  it('mapQueryResult marks only the redacted column masked', () => {
    const r = mapQueryResult(SIDECAR_OUT);
    expect(r.columns.map((c) => c.masked)).toEqual([false, false, true]);
    expect(r.rows.length).toBe(2);
  });

  it('renders masked cells as the glyph — never the redacted marker or plaintext', () => {
    const result = mapQueryResult(SIDECAR_OUT);
    const html = renderToStaticMarkup(
      createElement(QueryPanel, {
        onRun: () => {},
        result,
        profile: { id: 'p', name: 'shop.db', dialect: 'sqlite' as const },
      }),
    );
    // The masked column shows the glyph, not the sidecar's redaction marker.
    expect(html).toContain('●●●●');
    expect(html).not.toContain('<redacted:password>');
    expect(html).not.toContain('&lt;redacted:password&gt;');
    // Non-masked plaintext still renders.
    expect(html).toContain('ada@example.com');
    // The masked header carries the exposed marker node, and masked cells are unselectable.
    expect(html).toContain('query-mask-icon/password');
    expect(html).toContain('select-none');
  });
});
