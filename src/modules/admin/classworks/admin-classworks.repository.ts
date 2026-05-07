import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../common/database/knex.provider';
import type { Classwork } from '../../classworks/interfaces/classwork.interface';
import type { CreateClassworkDto, UpdateClassworkDto } from './classwork.dto';

@Injectable()
export class AdminClassworksRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async list(): Promise<Classwork[]> {
    return await this.knex<Classwork>('classworks')
      .select('*')
      .orderBy('updated_at', 'desc')
      .limit(200);
  }

  async findById(id: string): Promise<Classwork | undefined> {
    return await this.knex<Classwork>('classworks')
      .select('*')
      .where({ id })
      .first();
  }

  async create(dto: CreateClassworkDto): Promise<Classwork> {
    const row = {
      lesson_id: dto.lessonId,
      title: dto.title,
      instructions: dto.instructions,
      requirements: dto.requirements ?? [],
      starter_code: dto.starterCode ?? '',
      test_config: dto.testConfig ?? {},
      order_index: dto.orderIndex,
      updated_at: this.knex.fn.now(),
      created_at: this.knex.fn.now(),
    };

    const [created] = await this.knex<Classwork>('classworks')
      .insert(row)
      .returning('*');
    return created as Classwork;
  }

  async update(id: string, dto: UpdateClassworkDto): Promise<Classwork | undefined> {
    const patch: Record<string, unknown> = { updated_at: this.knex.fn.now() };
    if (dto.lessonId !== undefined) patch.lesson_id = dto.lessonId;
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.instructions !== undefined) patch.instructions = dto.instructions;
    if (dto.requirements !== undefined) patch.requirements = dto.requirements;
    if (dto.starterCode !== undefined) patch.starter_code = dto.starterCode;
    if (dto.testConfig !== undefined) patch.test_config = dto.testConfig;
    if (dto.orderIndex !== undefined) patch.order_index = dto.orderIndex;

    const [updated] = await this.knex<Classwork>('classworks')
      .where({ id })
      .update(patch)
      .returning('*');
    return updated as Classwork | undefined;
  }

  async delete(id: string): Promise<boolean> {
    const n = await this.knex('classworks').where({ id }).delete();
    return n > 0;
  }
}

