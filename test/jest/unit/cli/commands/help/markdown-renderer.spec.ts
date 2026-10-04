import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('renderMarkdown', () => {
  it('unescapes HTML entities correctly', () => {
    const markdown =
      'Test &amp; &lt;tag&gt; &quot;quote&quot; &#39;single&#39; &#96;code&#96; &#x20;space';
    const result = renderMarkdown(markdown);
    expect(result).toContain('Test & <tag> "quote" \'single\' `code` space');
  });

  it('renders markdown headers and text correctly', () => {
    const markdown = '# Heading 1\nSome **bold** text';
    const result = renderMarkdown(markdown);
    expect(result).toContain('Heading 1');
    expect(result).toContain('bold');
  });
});
