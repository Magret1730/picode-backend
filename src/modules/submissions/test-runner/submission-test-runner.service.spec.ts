import { SubmissionTestRunnerService } from './submission-test-runner.service';

describe('SubmissionTestRunnerService', () => {
  const runner = new SubmissionTestRunnerService();

  it('passes basic existence checks', () => {
    const html = `<!doctype html><html><head><title>t</title></head><body><h1>Hello</h1></body></html>`;
    const result = runner.run(html, {
      checks: [
        { id: 'has_html', description: 'Has html', selector: 'html' },
        { id: 'has_head', description: 'Has head', selector: 'head' },
        { id: 'has_title', description: 'Has title', selector: 'title' },
        { id: 'has_body', description: 'Has body', selector: 'body' },
        { id: 'body_not_empty', description: 'Body is not empty', rule: 'bodyTextNotEmpty' },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.results.every((r) => r.passed)).toBe(true);
  });

  it('fails attribute check when missing', () => {
    const html = `<html><body><img src="cat.png"></body></html>`;
    const result = runner.run(html, {
      checks: [
        {
          id: 'img_has_alt',
          description: 'Image has alt',
          rule: 'attr',
          selector: 'img',
          attr: 'alt',
        },
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it('detects inline style properties safely', () => {
    const html = `<html><body><h1 style="color: red;">Hi</h1><p style="background-color: yellow;">p</p></body></html>`;
    const result = runner.run(html, {
      checks: [
        {
          id: 'h1_color',
          description: 'Heading has color styling',
          rule: 'style',
          selector: 'h1',
          property: 'color',
        },
        {
          id: 'p_bg',
          description: 'Paragraph has background-color styling',
          rule: 'style',
          selector: 'p',
          property: 'background-color',
        },
      ],
    });

    expect(result.passed).toBe(true);
  });

  it('does not execute student scripts', () => {
    const html = `<html><body>
      <script>window.__HACKED__ = true;</script>
      <h1>Hello</h1>
    </body></html>`;
    const result = runner.run(html, {
      checks: [{ id: 'has_h1', description: 'Has h1', selector: 'h1' }],
    });

    expect(result.passed).toBe(true);
  });
});

