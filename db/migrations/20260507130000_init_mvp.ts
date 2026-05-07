import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('create extension if not exists "pgcrypto"');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('role', 16).notNullable().defaultTo('student');
    t.string('age_group', 32).notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.raw(`
    alter table users
    add constraint users_role_check
    check (role in ('student', 'admin'))
  `);

  await knex.schema.createTable('courses', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('title', 255).notNullable();
    t.string('slug', 64).notNullable().unique();
    t.text('description').notNullable().defaultTo('');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('levels', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.string('slug', 64).notNullable();
    t.integer('order_index').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.unique(['course_id', 'order_index']);
    t.unique(['course_id', 'slug']);
  });

  await knex.schema.createTable('lessons', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('level_id')
      .notNullable()
      .references('id')
      .inTable('levels')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.string('slug', 64).notNullable();
    t.text('goal').notNullable().defaultTo('');
    t.text('explanation').notNullable().defaultTo('');
    t.text('example_code').notNullable().defaultTo('');
    t.integer('order_index').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.unique(['level_id', 'order_index']);
    t.unique(['level_id', 'slug']);
  });

  await knex.schema.createTable('classworks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lesson_id')
      .notNullable()
      .references('id')
      .inTable('lessons')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('instructions').notNullable();
    t.jsonb('requirements').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
    t.text('starter_code').notNullable().defaultTo('');
    t.jsonb('test_config').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
    t.integer('order_index').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.unique(['lesson_id', 'order_index']);
  });

  await knex.schema.createTable('assignments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('level_id')
      .notNullable()
      .references('id')
      .inTable('levels')
      .onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('instructions').notNullable();
    t.jsonb('requirements').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
    t.text('starter_code').notNullable().defaultTo('');
    t.jsonb('test_config').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
    t.integer('order_index').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.unique(['level_id', 'order_index']);
  });

  await knex.schema.createTable('submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    t.uuid('classwork_id')
      .nullable()
      .references('id')
      .inTable('classworks')
      .onDelete('SET NULL');
    t.uuid('assignment_id')
      .nullable()
      .references('id')
      .inTable('assignments')
      .onDelete('SET NULL');
    t.text('submitted_code').notNullable();
    t.jsonb('test_results').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
    t.boolean('passed').notNullable().defaultTo(false);
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.index(['user_id', 'classwork_id']);
    t.index(['user_id', 'assignment_id']);
  });

  await knex.schema.createTable('progress', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    t.uuid('course_id')
      .notNullable()
      .references('id')
      .inTable('courses')
      .onDelete('CASCADE');
    t.uuid('level_id')
      .notNullable()
      .references('id')
      .inTable('levels')
      .onDelete('CASCADE');
    t.uuid('lesson_id')
      .nullable()
      .references('id')
      .inTable('lessons')
      .onDelete('SET NULL');
    t.string('status', 32).notNullable();
    t.integer('xp').notNullable().defaultTo(0);
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.index(['user_id', 'course_id']);
    t.index(['user_id', 'level_id']);
    t.index(['user_id', 'lesson_id']);
  });

  await knex.raw(`
    alter table submissions
    add constraint submissions_one_target_check
    check (
      (case when classwork_id is null then 0 else 1 end) +
      (case when assignment_id is null then 0 else 1 end)
      = 1
    )
  `);
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

