import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.string('age_group', 32).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').whereNull('age_group').update({ age_group: 'unknown' });
  await knex.schema.alterTable('users', (t) => {
    t.string('age_group', 32).notNullable().alter();
  });
}
