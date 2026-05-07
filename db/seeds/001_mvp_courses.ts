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
  });
}

