import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin';
  age_group: string;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  ageGroup: string;
};

@Injectable()
export class AuthRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findByEmail(email: string): Promise<DbUser | undefined> {
    return await this.knex<DbUser>('users')
      .select('*')
      .whereRaw('lower(email) = lower(?)', [email])
      .first();
  }

  async findById(id: string): Promise<DbUser | undefined> {
    return await this.knex<DbUser>('users').select('*').where({ id }).first();
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: 'student' | 'admin';
    ageGroup: string;
  }): Promise<DbUser> {
    const row = {
      name: input.name,
      email: input.email,
      password_hash: input.passwordHash,
      role: input.role,
      age_group: input.ageGroup,
      created_at: this.knex.fn.now(),
      updated_at: this.knex.fn.now(),
    };
    const [created] = await this.knex<DbUser>('users').insert(row).returning('*');
    return created as DbUser;
  }
}

export function toPublicUser(u: DbUser): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    ageGroup: u.age_group,
  };
}

