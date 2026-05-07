import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('create extension if not exists "pgcrypto"');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('display_name', 255).notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('courses', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('slug', 64).notNullable().unique();
    t.string('title', 255).notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('levels', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.integer('position').notNullable();
    t.timestamps(true, true);
    t.unique(['course_id', 'position']);
  });

  await knex.schema.createTable('lessons', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('level_id')
      .notNullable()
      .references('id')
      .inTable('levels')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.integer('position').notNullable();
    t.text('content').nullable();
    t.timestamps(true, true);
    t.unique(['level_id', 'position']);
  });

  await knex.schema.createTable('classworks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('prompt').notNullable();
    t.integer('position').notNullable();
    t.timestamps(true, true);
    t.unique(['lesson_id', 'position']);
  });

  await knex.schema.createTable('assignments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('prompt').notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE');
    t.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    t.text('content').notNullable();
    t.string('status', 32).notNullable().defaultTo('submitted');
    t.integer('score').nullable();
    t.timestamp('submitted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamps(true, true);
    t.index(['assignment_id', 'user_id']);
  });

  await knex.schema.createTable('progress', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    t.uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    t.string('status', 32).notNullable().defaultTo('not_started');
    t.timestamp('completed_at', { useTz: true }).nullable();
    t.timestamps(true, true);
    t.unique(['user_id', 'lesson_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('progress');
  await knex.schema.dropTableIfExists('submissions');
  await knex.schema.dropTableIfExists('assignments');
  await knex.schema.dropTableIfExists('classworks');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('levels');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('users');
}

