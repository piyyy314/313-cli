import { renderMarkdown } from '../../../../../../src/cli/commands/help/markdown-renderer';

describe('renderMarkdown', () => {
  it('renders markdown text correctly', () => {
    const input = '# Heading\n\nThis is **bold** and *italic* text.';
    const output = renderMarkdown(input);

    expect(output).toContain('Heading');
    expect(output).toContain('bold');
    expect(output).toContain('italic');
  });

  it('correctly unescapes HTML entities', () => {
    const input = 'snyk &lt;command&gt; &amp; &quot;test&#39;s&#96; &#x20;';
    const output = renderMarkdown(input);

    expect(output).toContain('snyk <command> & "test\'s`');
    expect(output).not.toContain('&lt;');
    expect(output).not.toContain('&gt;');
    expect(output).not.toContain('&amp;');
    expect(output).not.toContain('&quot;');
    expect(output).not.toContain('&#39;');
    expect(output).not.toContain('&#96;');
    expect(output).not.toContain('&#x20;');
  });
});
