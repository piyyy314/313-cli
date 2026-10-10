import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('markdown-renderer', () => {
  it('correctly unescapes HTML entities in markdown', () => {
    const input =
      'This &amp; that &lt;foo&gt; &quot;bar&quot; &#39;baz&#39; &#96;code&#96; space&#x20;here';
    const output = renderMarkdown(input);
    expect(output).toContain(
      'This & that <foo> "bar" \'baz\' `code` spacehere',
    );
  });

  it('renders markdown paragraphs without unescaped entities', () => {
    const input = '# Header\n\nSome text with &amp; entity.';
    const output = renderMarkdown(input);
    expect(output).toContain('Header');
    expect(output).toContain('Some text with & entity.');
  });
});
