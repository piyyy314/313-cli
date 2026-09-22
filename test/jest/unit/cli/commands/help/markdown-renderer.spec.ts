import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('renderMarkdown', () => {
  it('unescapes HTML entities correctly in single-pass', () => {
    const input =
      'This &amp; that &lt;foo&gt; &quot;bar&quot; &#39;baz&#39; &#96;code&#96; &#x20;';
    const output = renderMarkdown(input);

    expect(output).toContain('This & that <foo> "bar" \'baz\' `code` ');
    expect(output).not.toContain('&amp;');
    expect(output).not.toContain('&lt;');
    expect(output).not.toContain('&gt;');
    expect(output).not.toContain('&quot;');
    expect(output).not.toContain('&#39;');
    expect(output).not.toContain('&#96;');
    expect(output).not.toContain('&#x20;');
  });

  it('renders markdown headers, lists, and links properly', () => {
    const input = '# Title\n\n- item 1\n- item 2\n\n[Snyk](https://snyk.io)';
    const output = renderMarkdown(input);

    expect(output).toContain('Title');
    expect(output).toContain('item 1');
    expect(output).toContain('item 2');
    expect(output).toContain('https://snyk.io');
  });
});
