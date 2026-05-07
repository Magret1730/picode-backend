import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import type { Course } from './interfaces/course.interface';

@Injectable()
export class CoursesRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findAll(): Promise<Course[]> {
    return await this.knex<Course>('courses')
      .select('*')
      .orderBy('created_at', 'asc');
  }

  async findBySlug(slug: string): Promise<Course | undefined> {
    return await this.knex<Course>('courses').select('*').where({ slug }).first();
  }
}

