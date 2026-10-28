import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('markdown-renderer unescape', () => {
  it('correctly unescapes all supported HTML entities', () => {
    const input = 'Test &amp; &lt; &gt; &quot; &#39; &#96; &#x20;';
    const output = renderMarkdown(input);
    expect(output).toContain('Test & < > " \' `');
  });
});
