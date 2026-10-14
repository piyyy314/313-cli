import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('markdown-renderer', () => {
  it('correctly unescapes HTML entities', () => {
    const input =
      'Use &amp; and &lt;tag&gt; with &quot;quotes&quot;, &#39;single&#39;, and &#96;code&#96;.';
    const result = renderMarkdown(input);

    expect(result).toContain(
      '& and <tag> with "quotes", \'single\', and `code`',
    );
    expect(result).not.toContain('&amp;');
    expect(result).not.toContain('&lt;');
    expect(result).not.toContain('&gt;');
    expect(result).not.toContain('&quot;');
    expect(result).not.toContain('&#39;');
    expect(result).not.toContain('&#96;');
  });

  it('correctly unescapes &#x20; space entity to empty string', () => {
    const input = 'word&#x20;another';
    const result = renderMarkdown(input);

    expect(result).toContain('wordanother');
    expect(result).not.toContain('&#x20;');
  });

  it('renders markdown headers, bold, and code blocks', () => {
    const input = '# Header 1\n\n**bold text** and `code`';
    const result = renderMarkdown(input);

    expect(result).toContain('Header 1');
    expect(result).toContain('bold text');
    expect(result).toContain('code');
  });
});
