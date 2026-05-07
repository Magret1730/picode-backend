import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('courses')
    .insert([
      { slug: 'html-beginner', title: 'HTML Beginner' },
      { slug: 'css-beginner', title: 'CSS Beginner' },
    ])
    .onConflict('slug')
    .merge();
}

