import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../common/database/knex.provider';
import type { Lesson } from '../../lessons/interfaces/lesson.interface';
import type { CreateLessonDto, UpdateLessonDto } from './lesson.dto';

@Injectable()
export class AdminLessonsRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async list(): Promise<Lesson[]> {
    return await this.knex<Lesson>('lessons')
      .select('*')
      .orderBy('updated_at', 'desc')
      .limit(200);
  }

  async findById(id: string): Promise<Lesson | undefined> {
    return await this.knex<Lesson>('lessons').select('*').where({ id }).first();
  }

  async create(dto: CreateLessonDto): Promise<Lesson> {
    const row = {
      level_id: dto.levelId,
      title: dto.title,
      slug: dto.slug,
      goal: dto.goal,
      explanation: dto.explanation,
      example_code: dto.exampleCode ?? '',
      order_index: dto.orderIndex,
      updated_at: this.knex.fn.now(),
      created_at: this.knex.fn.now(),
    };

    const [created] = await this.knex<Lesson>('lessons').insert(row).returning('*');
    return created as Lesson;
  }

  async update(id: string, dto: UpdateLessonDto): Promise<Lesson | undefined> {
    const patch: Record<string, unknown> = {
      updated_at: this.knex.fn.now(),
    };
    if (dto.levelId !== undefined) patch.level_id = dto.levelId;
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.slug !== undefined) patch.slug = dto.slug;
    if (dto.goal !== undefined) patch.goal = dto.goal;
    if (dto.explanation !== undefined) patch.explanation = dto.explanation;
    if (dto.exampleCode !== undefined) patch.example_code = dto.exampleCode;
    if (dto.orderIndex !== undefined) patch.order_index = dto.orderIndex;

    const [updated] = await this.knex<Lesson>('lessons')
      .where({ id })
      .update(patch)
      .returning('*');
    return updated as Lesson | undefined;
  }

  async delete(id: string): Promise<boolean> {
    const n = await this.knex('lessons').where({ id }).delete();
    return n > 0;
  }
}

