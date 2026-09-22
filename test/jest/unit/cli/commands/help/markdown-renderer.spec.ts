import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('renderMarkdown', () => {
  it('correctly unescapes HTML entities', () => {
    const input =
      'This &amp; that &lt;foo&gt; &quot;quote&quot; &#39;single&#39; &#96;code&#96; space&#x20;here';
    const output = renderMarkdown(input);
    expect(output).toContain(
      'This & that <foo> "quote" \'single\' `code` spacehere',
    );
  });

  it('renders markdown headers, bold, and code', () => {
    const markdown = '# Heading 1\n\n**bold text**\n\n`code text`';
    const output = renderMarkdown(markdown);
    expect(output).toContain('Heading 1');
    expect(output).toContain('bold text');
    expect(output).toContain('code text');
  });
});
