import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    const courses = [
      {
        slug: 'html-beginner',
        title: 'HTML Beginner',
        description: 'Learn the fundamentals of HTML and build your first pages.',
      },
      {
        slug: 'css-beginner',
        title: 'CSS Beginner',
        description: 'Learn CSS basics and start styling beautiful web pages.',
      },
    ];

    await trx('courses').insert(courses).onConflict('slug').merge();

    const htmlCourse = await trx('courses')
      .select('id')
      .where({ slug: 'html-beginner' })
      .first();
    const cssCourse = await trx('courses')
      .select('id')
      .where({ slug: 'css-beginner' })
      .first();

    if (!htmlCourse?.id || !cssCourse?.id) return;

    const levels = [
      {
        course_id: htmlCourse.id,
        title: 'Getting Started',
        slug: 'getting-started',
        order_index: 1,
      },
      {
        course_id: htmlCourse.id,
        title: 'Tags & Structure',
        slug: 'tags-and-structure',
        order_index: 2,
      },
      {
        course_id: cssCourse.id,
        title: 'Getting Started',
        slug: 'getting-started',
        order_index: 1,
      },
      {
        course_id: cssCourse.id,
        title: 'Selectors',
        slug: 'selectors',
        order_index: 2,
      },
    ];

    await trx('levels').insert(levels).onConflict(['course_id', 'slug']).merge();

    // HTML Beginner content (MVP)
    const htmlLevel1 = await trx('levels')
      .select('id')
      .where({ course_id: htmlCourse.id, slug: 'getting-started' })
      .first();
    const htmlLevel2 = await trx('levels')
      .select('id')
      .where({ course_id: htmlCourse.id, slug: 'tags-and-structure' })
      .first();

    if (!htmlLevel1?.id || !htmlLevel2?.id) return;

    const lessons = [
      {
        level_id: htmlLevel1.id,
        title: 'What Is HTML?',
        slug: 'what-is-html',
        goal: 'Understand what HTML is and how a basic webpage is structured.',
        explanation:
          'HTML (HyperText Markup Language) is the standard language for creating webpages. A webpage is a document your browser can read and display. Most HTML pages start with the same structure: html, head (with title), and body.',
        example_code: `<!doctype html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    Hello!
  </body>
</html>`,
        order_index: 1,
      },
      {
        level_id: htmlLevel1.id,
        title: 'Headings and Paragraphs',
        slug: 'headings-and-paragraphs',
        goal: 'Use headings and paragraphs to structure page content.',
        explanation:
          'Headings (h1, h2, etc.) help organize content. Paragraphs (p) are used for blocks of text. A clear structure makes your webpage easier to read.',
        example_code: `<h1>About Me</h1>
<h2>My Hobbies</h2>
<p>I like learning new things.</p>
<p>I enjoy building websites.</p>`,
        order_index: 2,
      },
      {
        level_id: htmlLevel1.id,
        title: 'Images and Links',
        slug: 'images-and-links',
        goal: 'Add images and links to a webpage.',
        explanation:
          'Use img to show an image. The src attribute points to the image file, and alt describes the image for accessibility. Use a to create links with href.',
        example_code: `<h1>My Favorite Animal</h1>
<img src="animal.jpg" alt="A cute animal" />
<p>This is my favorite animal.</p>
<a href="https://example.com">Learn more</a>`,
        order_index: 3,
      },
      {
        level_id: htmlLevel1.id,
        title: 'Lists',
        slug: 'lists',
        goal: 'Create ordered and unordered lists.',
        explanation:
          'Unordered lists (ul) are great for bullet points. Ordered lists (ol) are used when order matters. List items go inside li.',
        example_code: `<h1>My Favorites</h1>
<ul>
  <li>Pizza</li>
  <li>Tacos</li>
  <li>Ice cream</li>
</ul>
<ol>
  <li>Wake up</li>
  <li>Brush teeth</li>
  <li>Eat breakfast</li>
</ol>`,
        order_index: 4,
      },
      {
        level_id: htmlLevel1.id,
        title: 'Building a Simple Webpage',
        slug: 'building-a-simple-webpage',
        goal: 'Combine HTML basics into one mini profile page.',
        explanation:
          'A real webpage usually combines several elements: a title, headings, paragraphs, images, lists, and links. Practice putting them together into a single page.',
        example_code: `<!doctype html>
<html>
  <head>
    <title>Mini Profile</title>
  </head>
  <body>
    <h1>Your Name</h1>
    <p>Something about you.</p>
    <img src="me.jpg" alt="A photo of me" />
    <ul>
      <li>Hobby 1</li>
      <li>Hobby 2</li>
      <li>Hobby 3</li>
    </ul>
    <a href="https://example.com">My favorite website</a>
  </body>
</html>`,
        order_index: 5,
      },
    ];

    await trx('lessons')
      .insert(lessons)
      .onConflict(['level_id', 'slug'])
      .merge();

    const lessonRows = await trx('lessons')
      .select('id', 'slug')
      .where({ level_id: htmlLevel1.id })
      .whereIn('slug', [
        'what-is-html',
        'headings-and-paragraphs',
        'images-and-links',
        'lists',
        'building-a-simple-webpage',
      ]);

    const lessonIdBySlug = new Map(lessonRows.map((r) => [r.slug, r.id]));

    const classworks = [
      {
        lesson_slug: 'what-is-html',
        title: 'Create your first webpage.',
        instructions:
          'Create a basic HTML page with a title and some text in the body.',
        requirements: {
          items: [
            'Add a page title',
            'Add your name inside the body',
            'Add one sentence about yourself',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_html', description: 'Has html', selector: 'html' },
            { id: 'has_head', description: 'Has head', selector: 'head' },
            { id: 'has_title', description: 'Has title', selector: 'title' },
            { id: 'has_body', description: 'Has body', selector: 'body' },
            {
              id: 'body_not_empty',
              description: 'Body is not empty',
              rule: 'bodyTextNotEmpty',
            },
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title></title>
  </head>
  <body>
  </body>
</html>`,
        order_index: 1,
      },
      {
        lesson_slug: 'headings-and-paragraphs',
        title: 'Create an About Me page.',
        instructions:
          'Use headings and paragraphs to write a simple About Me page.',
        requirements: {
          items: [
            'Add one main heading',
            'Add one smaller heading',
            'Add two paragraphs about yourself',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'one_h1', description: 'Has one h1', rule: 'count', selector: 'h1', equals: 1 },
            { id: 'has_h2', description: 'Has at least one h2', rule: 'count', selector: 'h2', gte: 1 },
            { id: 'two_p', description: 'Has at least two p tags', rule: 'count', selector: 'p', gte: 2 },
            { id: 'text_not_empty', description: 'Text content is not empty', rule: 'textNotEmpty' },
          ],
        },
        starter_code: `<h1></h1>
<h2></h2>
<p></p>
<p></p>`,
        order_index: 1,
      },
      {
        lesson_slug: 'images-and-links',
        title: 'Create a favorite animal page.',
        instructions:
          'Create a page with a heading, an image, some text, and a link.',
        requirements: {
          items: [
            'Add a heading',
            'Add an image',
            'Add image alt text',
            'Add a paragraph',
            'Add a link',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            { id: 'has_img', description: 'Has img', selector: 'img' },
            { id: 'img_has_src', description: 'Image has src', rule: 'attr', selector: 'img', attr: 'src' },
            { id: 'img_has_alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
            { id: 'has_a', description: 'Has a', selector: 'a' },
            { id: 'a_has_href', description: 'Link has href', rule: 'attr', selector: 'a', attr: 'href' },
          ],
        },
        starter_code: `<h1></h1>
<img src="" alt="" />
<p></p>
<a href=""></a>`,
        order_index: 1,
      },
      {
        lesson_slug: 'lists',
        title: 'Create a My Favorites page.',
        instructions:
          'Create a page with an unordered list and an ordered list.',
        requirements: {
          items: [
            'Add a heading',
            'Add an unordered list of 3 favorite foods',
            'Add an ordered list of 3 things you do in the morning',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            { id: 'one_ul', description: 'Has one ul', rule: 'count', selector: 'ul', equals: 1 },
            { id: 'one_ol', description: 'Has one ol', rule: 'count', selector: 'ol', equals: 1 },
            { id: 'six_li', description: 'Has at least 6 li items', rule: 'count', selector: 'li', gte: 6 },
          ],
        },
        starter_code: `<h1></h1>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>`,
        order_index: 1,
      },
      {
        lesson_slug: 'building-a-simple-webpage',
        title: 'Build a mini profile page.',
        instructions:
          'Build a mini profile page that combines the HTML elements you learned.',
        requirements: {
          items: [
            'Add a title',
            'Add your name as the main heading',
            'Add a paragraph about yourself',
            'Add an image',
            'Add a list of 3 hobbies',
            'Add a link to your favorite website',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_title', description: 'Has title', selector: 'title' },
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            { id: 'has_p', description: 'Has at least one p', rule: 'count', selector: 'p', gte: 1 },
            { id: 'has_img', description: 'Has img', selector: 'img' },
            { id: 'img_has_alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
            { id: 'has_list', description: 'Has ul or ol', rule: 'any', selectors: ['ul', 'ol'] },
            { id: 'three_li', description: 'Has at least 3 li', rule: 'count', selector: 'li', gte: 3 },
            { id: 'has_a', description: 'Has a', selector: 'a' },
            { id: 'a_has_href', description: 'Link has href', rule: 'attr', selector: 'a', attr: 'href' },
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title></title>
  </head>
  <body>
    <h1></h1>
    <p></p>
    <img src="" alt="" />
    <ul>
      <li></li>
      <li></li>
      <li></li>
    </ul>
    <a href=""></a>
  </body>
</html>`,
        order_index: 1,
      },
    ];

    const classworkRows = classworks
      .map((c) => {
        const lessonId = lessonIdBySlug.get(c.lesson_slug);
        if (!lessonId) return null;
        const { lesson_slug: _lesson_slug, ...rest } = c;
        return { lesson_id: lessonId, ...rest };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    await trx('classworks')
      .insert(classworkRows)
      .onConflict(['lesson_id', 'order_index'])
      .merge();

    const assignments = [
      {
        level_id: htmlLevel2.id,
        title: 'My Favorite Animal Page',
        instructions:
          'Create a webpage about your favorite animal. Include a heading, an image with alt text, and a link to learn more.',
        requirements: {
          items: [
            'Add a main heading',
            'Add an image with alt text',
            'Add at least one paragraph',
            'Add a link (href) to an external site',
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>My Favorite Animal</title>
  </head>
  <body>
  </body>
</html>`,
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            { id: 'has_img', description: 'Has img', selector: 'img' },
            { id: 'img_has_alt', description: 'Image has alt', rule: 'attr', selector: 'img', attr: 'alt' },
            { id: 'has_a', description: 'Has a', selector: 'a' },
            { id: 'a_has_href', description: 'Link has href', rule: 'attr', selector: 'a', attr: 'href' },
          ],
        },
        order_index: 1,
      },
      {
        level_id: htmlLevel2.id,
        title: 'All About Me Page',
        instructions:
          'Create an About Me webpage using headings and paragraphs. Add at least one smaller heading and multiple paragraphs.',
        requirements: {
          items: [
            'Add one main heading (h1)',
            'Add at least one smaller heading (h2)',
            'Add at least two paragraphs',
          ],
        },
        starter_code: `<h1>About Me</h1>
<h2>My Story</h2>
<p></p>
<p></p>`,
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'one_h1', description: 'Has one h1', rule: 'count', selector: 'h1', equals: 1 },
            { id: 'has_h2', description: 'Has at least one h2', rule: 'count', selector: 'h2', gte: 1 },
            { id: 'two_p', description: 'Has at least two p tags', rule: 'count', selector: 'p', gte: 2 },
            { id: 'text_not_empty', description: 'Text content is not empty', rule: 'textNotEmpty' },
          ],
        },
        order_index: 2,
      },
    ];

    await trx('assignments')
      .insert(assignments)
      .onConflict(['level_id', 'order_index'])
      .merge();

    // CSS Beginner content (MVP)
    const cssLevel1 = await trx('levels')
      .select('id')
      .where({ course_id: cssCourse.id, slug: 'getting-started' })
      .first();
    const cssLevel2 = await trx('levels')
      .select('id')
      .where({ course_id: cssCourse.id, slug: 'selectors' })
      .first();

    if (!cssLevel1?.id || !cssLevel2?.id) return;

    const cssLessons = [
      {
        level_id: cssLevel1.id,
        title: 'What Is CSS?',
        slug: 'what-is-css',
        goal: 'Understand what CSS is and how it styles HTML.',
        explanation:
          'CSS (Cascading Style Sheets) controls how HTML looks—colors, spacing, fonts, and layout. You can style elements using inline styles, a style tag, or an external stylesheet.',
        example_code: `<h1 style="color: teal;">Hello CSS!</h1>
<p style="background-color: #ffeaa7;">This paragraph has a background.</p>`,
        order_index: 1,
      },
      {
        level_id: cssLevel1.id,
        title: 'Fonts and Text Styling',
        slug: 'fonts-and-text-styling',
        goal: 'Style text with font size, alignment, color, and font family.',
        explanation:
          'You can style text using properties like font-size, text-align, color, and font-family. These help make your page look clean and readable.',
        example_code: `<h1 style="font-size: 40px; text-align: center;">About Me</h1>
<p style="color: #2d3436; font-family: Arial, sans-serif;">Text can be styled!</p>`,
        order_index: 2,
      },
      {
        level_id: cssLevel1.id,
        title: 'Borders and Spacing',
        slug: 'borders-and-spacing',
        goal: 'Use borders, padding, margin, and width to shape layouts.',
        explanation:
          'Borders show outlines. Padding adds space inside an element. Margin adds space outside. Width controls how wide an element is.',
        example_code: `<div style="border: 2px solid #0984e3; padding: 16px; margin: 16px; width: 300px;">
  Profile card content
</div>`,
        order_index: 3,
      },
      {
        level_id: cssLevel1.id,
        title: 'Backgrounds and Images',
        slug: 'backgrounds-and-images',
        goal: 'Add backgrounds and style images with width and rounded corners.',
        explanation:
          'Background colors make sections stand out. Images can be styled too—change width and use border-radius to round the corners.',
        example_code: `<div style="background-color: #dfe6e9; padding: 16px;">
  <img src="animal.jpg" alt="Animal" style="width: 200px; border-radius: 12px;" />
</div>`,
        order_index: 4,
      },
      {
        level_id: cssLevel1.id,
        title: 'Building a Simple Styled Webpage',
        slug: 'building-a-simple-styled-webpage',
        goal: 'Combine CSS basics to create a mini profile webpage.',
        explanation:
          'A polished webpage uses multiple styles together: text styling, spacing, borders, background colors, and image styling. Practice combining everything into one page.',
        example_code: `<!doctype html>
<html>
  <head>
    <title>Styled Profile</title>
  </head>
  <body style="background-color: #f1f2f6;">
    <div style="border: 2px solid #2d3436; padding: 16px; margin: 24px; background-color: white; width: 360px;">
      <h1 style="text-align: center; color: #6c5ce7;">Your Name</h1>
      <p style="color: #2d3436; font-family: Arial, sans-serif;">A little about me.</p>
      <img src="me.jpg" alt="Me" style="width: 200px; border-radius: 12px;" />
    </div>
  </body>
</html>`,
        order_index: 5,
      },
    ];

    await trx('lessons')
      .insert(cssLessons)
      .onConflict(['level_id', 'slug'])
      .merge();

    const cssLessonRows = await trx('lessons')
      .select('id', 'slug')
      .where({ level_id: cssLevel1.id })
      .whereIn('slug', [
        'what-is-css',
        'fonts-and-text-styling',
        'borders-and-spacing',
        'backgrounds-and-images',
        'building-a-simple-styled-webpage',
      ]);

    const cssLessonIdBySlug = new Map(cssLessonRows.map((r) => [r.slug, r.id]));

    const cssClassworks = [
      {
        lesson_slug: 'what-is-css',
        title: 'Create a colorful webpage.',
        instructions:
          'Create an HTML page and add inline CSS styles to make it colorful.',
        requirements: {
          items: [
            'Add a heading',
            'Change the heading color',
            'Add a paragraph',
            'Change the paragraph background color',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            { id: 'has_p', description: 'Has p', selector: 'p' },
            {
              id: 'h1_has_color',
              description: 'Heading has color styling',
              rule: 'style',
              selector: 'h1',
              property: 'color',
            },
            {
              id: 'p_has_bg',
              description: 'Paragraph has background-color styling',
              rule: 'style',
              selector: 'p',
              property: 'background-color',
            },
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>Colorful Page</title>
  </head>
  <body>
    <h1 style=""></h1>
    <p style=""></p>
  </body>
</html>`,
        order_index: 1,
      },
      {
        lesson_slug: 'fonts-and-text-styling',
        title: 'Style an About Me page.',
        instructions:
          'Add a heading and paragraph and style them using CSS text properties.',
        requirements: {
          items: [
            'Add a heading',
            'Change the font size',
            'Center the heading',
            'Change paragraph text color',
            'Use a different font family',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            {
              id: 'h1_font_size',
              description: 'Heading has font-size',
              rule: 'style',
              selector: 'h1',
              property: 'font-size',
            },
            {
              id: 'h1_text_align',
              description: 'Heading uses text-align',
              rule: 'style',
              selector: 'h1',
              property: 'text-align',
            },
            {
              id: 'p_color',
              description: 'Paragraph uses color',
              rule: 'style',
              selector: 'p',
              property: 'color',
            },
            {
              id: 'p_font_family',
              description: 'Paragraph uses font-family',
              rule: 'style',
              selector: 'p',
              property: 'font-family',
            },
          ],
        },
        starter_code: `<h1 style=""></h1>
<p style=""></p>`,
        order_index: 1,
      },
      {
        lesson_slug: 'borders-and-spacing',
        title: 'Create a profile card.',
        instructions:
          'Create a card container and style it using border, padding, margin, and width.',
        requirements: {
          items: ['Add a border', 'Add padding', 'Add margin', 'Set a width'],
        },
        test_config: {
          runner: 'jest',
          checks: [
            {
              id: 'border',
              description: 'Element has border',
              rule: 'style',
              selector: '.card, #card, div',
              property: 'border',
            },
            {
              id: 'padding',
              description: 'Element has padding',
              rule: 'style',
              selector: '.card, #card, div',
              property: 'padding',
            },
            {
              id: 'margin',
              description: 'Element has margin',
              rule: 'style',
              selector: '.card, #card, div',
              property: 'margin',
            },
            {
              id: 'width',
              description: 'Element has width',
              rule: 'style',
              selector: '.card, #card, div',
              property: 'width',
            },
          ],
        },
        starter_code: `<div class="card" style="">
  <h1></h1>
  <p></p>
</div>`,
        order_index: 1,
      },
      {
        lesson_slug: 'backgrounds-and-images',
        title: 'Style a favorite animal page.',
        instructions:
          'Add a background color and style an image with width and rounded corners.',
        requirements: {
          items: [
            'Add a background color',
            'Style an image',
            'Add rounded corners to image',
            'Change image width',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            {
              id: 'bg',
              description: 'Has background-color',
              rule: 'style',
              selector: 'body, .container, div',
              property: 'background-color',
            },
            {
              id: 'img_width',
              description: 'Image has width styling',
              rule: 'style',
              selector: 'img',
              property: 'width',
            },
            {
              id: 'img_radius',
              description: 'Image has border-radius',
              rule: 'style',
              selector: 'img',
              property: 'border-radius',
            },
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>Favorite Animal</title>
  </head>
  <body style="">
    <h1></h1>
    <img src="" alt="" style="" />
    <p></p>
  </body>
</html>`,
        order_index: 1,
      },
      {
        lesson_slug: 'building-a-simple-styled-webpage',
        title: 'Build a mini profile webpage.',
        instructions:
          'Build a mini profile webpage with multiple CSS styles: spacing, border, background color, and styled content.',
        requirements: {
          items: [
            'Styled heading',
            'Styled paragraph',
            'Styled image',
            'Border around content',
            'Background color',
            'Proper spacing',
          ],
        },
        test_config: {
          runner: 'jest',
          checks: [
            {
              id: 'h1_styling',
              description: 'Heading has styling',
              rule: 'hasStyleAttributeOrRule',
              selector: 'h1',
            },
            {
              id: 'p_styling',
              description: 'Paragraph has styling',
              rule: 'hasStyleAttributeOrRule',
              selector: 'p',
            },
            {
              id: 'img_styling',
              description: 'Image has styling',
              rule: 'hasStyleAttributeOrRule',
              selector: 'img',
            },
            {
              id: 'border_exists',
              description: 'Border exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'border',
            },
            {
              id: 'padding_exists',
              description: 'Padding exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'padding',
            },
            {
              id: 'bg_exists',
              description: 'Background color exists',
              rule: 'style',
              selector: 'body, .container, #container, div',
              property: 'background-color',
            },
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>Mini Profile</title>
  </head>
  <body style="">
    <div class="container" style="">
      <h1 style=""></h1>
      <p style=""></p>
      <img src="" alt="" style="" />
    </div>
  </body>
</html>`,
        order_index: 1,
      },
    ];

    const cssClassworkRows = cssClassworks
      .map((c) => {
        const lessonId = cssLessonIdBySlug.get(c.lesson_slug);
        if (!lessonId) return null;
        const { lesson_slug: _lesson_slug, ...rest } = c;
        return { lesson_id: lessonId, ...rest };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    await trx('classworks')
      .insert(cssClassworkRows)
      .onConflict(['lesson_id', 'order_index'])
      .merge();

    const cssAssignments = [
      {
        level_id: cssLevel2.id,
        title: 'Superhero Profile Page',
        instructions:
          'Create a superhero profile page and style it with CSS (text styling, spacing, and a bordered container).',
        requirements: {
          items: [
            'Add a main heading',
            'Style the heading (color/size/alignment)',
            'Add at least one paragraph and style it',
            'Add a bordered container with padding',
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>Superhero Profile</title>
  </head>
  <body>
  </body>
</html>`,
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            {
              id: 'h1_styling',
              description: 'Heading has styling',
              rule: 'hasStyleAttributeOrRule',
              selector: 'h1',
            },
            {
              id: 'container_border',
              description: 'Border exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'border',
            },
            {
              id: 'container_padding',
              description: 'Padding exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'padding',
            },
          ],
        },
        order_index: 1,
      },
      {
        level_id: cssLevel2.id,
        title: 'My Dream Bedroom',
        instructions:
          'Create a webpage describing your dream bedroom and style it with background colors, borders, and spacing.',
        requirements: {
          items: [
            'Add a heading and paragraph',
            'Use at least one background color',
            'Add a border around content',
            'Add spacing with padding and margin',
          ],
        },
        starter_code: `<!doctype html>
<html>
  <head>
    <title>My Dream Bedroom</title>
  </head>
  <body>
  </body>
</html>`,
        test_config: {
          runner: 'jest',
          checks: [
            { id: 'has_h1', description: 'Has h1', selector: 'h1' },
            {
              id: 'bg_exists',
              description: 'Background color exists',
              rule: 'style',
              selector: 'body, .container, #container, div',
              property: 'background-color',
            },
            {
              id: 'border_exists',
              description: 'Border exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'border',
            },
            {
              id: 'padding_exists',
              description: 'Padding exists',
              rule: 'style',
              selector: '.container, #container, div',
              property: 'padding',
            },
          ],
        },
        order_index: 2,
      },
    ];

    await trx('assignments')
      .insert(cssAssignments)
      .onConflict(['level_id', 'order_index'])
      .merge();
  });
}

