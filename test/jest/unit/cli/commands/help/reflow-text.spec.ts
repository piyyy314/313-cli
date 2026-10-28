import { reflowText } from '../../../../../../src/cli/commands/help/reflow-text';

describe('reflowText', () => {
  it('reflows plain text to given width', () => {
    const text =
      'This is a long paragraph that should be wrapped when rendered.';
    const result = reflowText(text, 20);
    expect(result).toBe(
      'This is a long\nparagraph that should\nbe wrapped when\nrendered.',
    );
  });

  it('handles html break tags and newlines', () => {
    const text =
      'First line<br />Second line<br>Third line<br/>Fourth line\nFifth line';
    const result = reflowText(text, 80);
    expect(result).toBe(
      'First line\nSecond line\nThird line\nFourth line\nFifth line',
    );
  });

  it('handles ANSI escape sequences without counting their length towards width', () => {
    const text = '\u001b[31mRed text\u001b[0m and normal text in a line.';
    const result = reflowText(text, 15);
    expect(result).toContain('\u001b[31mRed text\u001b[0m');
  });
});
