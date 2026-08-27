import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('markdown-renderer', () => {
  it('should unescape HTML entities correctly', () => {
    const markdown =
      'Test &amp; &lt;tag&gt; &quot;quote&quot; &#39;single&#39; &#96;code&#96; &#x20;';
    const result = renderMarkdown(markdown);
    expect(result).toContain('Test & <tag> "quote" \'single\' `code`');
  });

  it('should render headers and bold text', () => {
    const markdown = '# Header 1\n\n**bold text**';
    const result = renderMarkdown(markdown);
    expect(result).toContain('Header 1');
    expect(result).toContain('bold text');
  });
});
