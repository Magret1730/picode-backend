import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
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

  await knex('courses').insert(courses).onConflict('slug').merge();

  const htmlCourse = await knex('courses')
    .select('id')
    .where({ slug: 'html-beginner' })
    .first();
  const cssCourse = await knex('courses')
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

  await knex('levels')
    .insert(levels)
    .onConflict(['course_id', 'slug'])
    .merge();
}

