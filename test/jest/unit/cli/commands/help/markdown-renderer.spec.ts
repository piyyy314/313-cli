import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('renderMarkdown', () => {
  it('unescapes HTML entities correctly', () => {
    const input =
      'Test &amp; &lt;foo&gt; &quot;bar&quot; &#39;baz&#39; &#96;code&#96; &#x20;';
    const output = renderMarkdown(input);
    expect(output).toContain('&');
    expect(output).toContain('<foo>');
    expect(output).toContain('"bar"');
    expect(output).toContain("'baz'");
    expect(output).toContain('`code`');
    expect(output).not.toContain('&amp;');
    expect(output).not.toContain('&lt;');
    expect(output).not.toContain('&gt;');
    expect(output).not.toContain('&quot;');
    expect(output).not.toContain('&#39;');
    expect(output).not.toContain('&#96;');
    expect(output).not.toContain('&#x20;');
  });
});
