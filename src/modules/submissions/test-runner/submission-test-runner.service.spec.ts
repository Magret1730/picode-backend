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

  it('passes title checks for full HTML document', () => {
    const html = `<!doctype html>
<html>
  <head>
    <title>Here</title>
  </head>
  <body>
    <p>Here</p>
    <p>Just here</p>
  </body>
</html>`;

    const result = runner.run(html, {
      checks: [
        { id: 'has_title', description: 'Has title', selector: 'title' },
        { id: 'has_body', description: 'Has body', selector: 'body' },
        { id: 'body_not_empty', description: 'Body is not empty', rule: 'bodyTextNotEmpty' },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.results.find((r) => r.name === 'Has title')?.passed).toBe(true);
  });

  it('passes h1/p/img/link checks for partial HTML snippet', () => {
    const html = `<h1>Jut</h1>
<img src="/get.png" alt="get" />
<p>get</p>
<a href="./home">home</a>`;

    const result = runner.run(html, {
      checks: [
        { id: 'has_h1', description: 'Has h1', selector: 'h1' },
        { id: 'has_img', description: 'Has img', selector: 'img' },
        { id: 'img_has_alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
        { id: 'has_p', description: 'Has at least one p', rule: 'count', selector: 'p', gte: 1 },
        { id: 'a_has_href', description: 'Link has href', rule: 'attr', selector: 'a', attr: 'href' },
      ],
    });

    expect(result.passed).toBe(true);
  });

  it('fails when h2 exists but is empty', () => {
    const html = `<h1>Ger</h1><h2></h2><p>ok</p>`;
    const result = runner.run(html, {
      checks: [{ id: 'has_h2', description: 'Has at least one h2', selector: 'h2' }],
    });
    expect(result.passed).toBe(false);
  });

  it('fails when paragraphs exist but are empty', () => {
    const html = `<p></p><p> </p>`;
    const result = runner.run(html, {
      checks: [{ id: 'two_p', description: 'Has at least two p tags', rule: 'count', selector: 'p', gte: 2 }],
    });
    expect(result.passed).toBe(false);
  });

  it('fails when title exists but is empty', () => {
    const html = `<!doctype html><html><head><title></title></head><body><p>ok</p></body></html>`;
    const result = runner.run(html, {
      checks: [{ id: 'has_title', description: 'Has title', selector: 'title' }],
    });
    expect(result.passed).toBe(false);
  });

  it('fails when list items exist but are empty', () => {
    const html = `<ul><li></li><li> </li><li>Yay</li></ul>`;
    const result = runner.run(html, {
      checks: [{ id: 'three_li', description: 'Has at least 3 li', rule: 'count', selector: 'li', gte: 3 }],
    });
    expect(result.passed).toBe(false);
  });

  it('fails when image alt text is empty', () => {
    const html = `<img src="/get.png" alt="   " />`;
    const result = runner.run(html, {
      checks: [
        { id: 'has_img', description: 'Has img', selector: 'img' },
        { id: 'img_alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
      ],
    });
    expect(result.passed).toBe(false);
  });

  it('passes when required content is filled', () => {
    const html = `<!doctype html>
<html>
  <head><title>Here</title></head>
  <body>
    <h1>Ger</h1>
    <h2>Small heading</h2>
    <p>Here</p>
    <p>Just here</p>
    <ul><li>One</li><li>Two</li><li>Three</li></ul>
    <img src="/get.png" alt="get" />
    <a href="./home">home</a>
  </body>
</html>`;
    const result = runner.run(html, {
      checks: [
        { id: 'title', description: 'Has title', selector: 'title' },
        { id: 'h1', description: 'Has h1', selector: 'h1' },
        { id: 'h2', description: 'Has at least one h2', selector: 'h2' },
        { id: 'p', description: 'Has at least two p tags', rule: 'count', selector: 'p', gte: 2 },
        { id: 'li', description: 'Has at least 3 li', rule: 'count', selector: 'li', gte: 3 },
        { id: 'img', description: 'Has img', selector: 'img' },
        { id: 'alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
        { id: 'a', description: 'Has a', selector: 'a' },
        { id: 'href', description: 'Link has href', rule: 'attr', selector: 'a', attr: 'href' },
      ],
    });
    expect(result.passed).toBe(true);
  });
});

