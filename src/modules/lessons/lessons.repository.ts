import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import type { Lesson } from './interfaces/lesson.interface';

export type LessonWithClassworkId = Lesson & {
  classwork_id: string | null;
  course_slug: string;
};

@Injectable()
export class LessonsRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string): Promise<Lesson | undefined> {
    return await this.knex<Lesson>('lessons').select('*').where({ id }).first();
  }

  async findByIdWithClasswork(id: string): Promise<LessonWithClassworkId | undefined> {
    const first = this.knex.raw('?', [1]);
    return await this.knex('lessons')
      .join('levels', 'lessons.level_id', 'levels.id')
      .join('courses', 'levels.course_id', 'courses.id')
      .leftJoin('classworks', function join() {
        this.on('classworks.lesson_id', '=', 'lessons.id').andOn(
          'classworks.order_index',
          '=',
          first,
        );
      })
      .select('lessons.*', { classwork_id: 'classworks.id' }, { course_slug: 'courses.slug' })
      .where('lessons.id', id)
      .first();
  }

  async listForCourseSlug(courseSlug: string): Promise<LessonWithClassworkId[]> {
    const first = this.knex.raw('?', [1]);
    return await this.knex('lessons')
      .join('levels', 'lessons.level_id', 'levels.id')
      .join('courses', 'levels.course_id', 'courses.id')
      .leftJoin('classworks', function join() {
        this.on('classworks.lesson_id', '=', 'lessons.id').andOn(
          'classworks.order_index',
          '=',
          first,
        );
      })
      .select('lessons.*', { classwork_id: 'classworks.id' }, { course_slug: 'courses.slug' })
      .where('courses.slug', courseSlug)
      .orderBy('levels.order_index', 'asc')
      .orderBy('lessons.order_index', 'asc');
  }
}

