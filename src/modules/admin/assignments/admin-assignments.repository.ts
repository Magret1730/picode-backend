import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../../common/database/knex.provider';
import type { Assignment } from '../../assignments/interfaces/assignment.interface';
import type { CreateAssignmentDto, UpdateAssignmentDto } from './assignment.dto';

@Injectable()
export class AdminAssignmentsRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(dto: CreateAssignmentDto): Promise<Assignment> {
    const row = {
      level_id: dto.levelId,
      title: dto.title,
      instructions: dto.instructions,
      requirements: dto.requirements ?? [],
      starter_code: dto.starterCode ?? '',
      test_config: dto.testConfig ?? {},
      order_index: dto.orderIndex,
      updated_at: this.knex.fn.now(),
      created_at: this.knex.fn.now(),
    };

    const [created] = await this.knex<Assignment>('assignments')
      .insert(row)
      .returning('*');
    return created as Assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment | undefined> {
    const patch: Record<string, unknown> = { updated_at: this.knex.fn.now() };
    if (dto.levelId !== undefined) patch.level_id = dto.levelId;
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.instructions !== undefined) patch.instructions = dto.instructions;
    if (dto.requirements !== undefined) patch.requirements = dto.requirements;
    if (dto.starterCode !== undefined) patch.starter_code = dto.starterCode;
    if (dto.testConfig !== undefined) patch.test_config = dto.testConfig;
    if (dto.orderIndex !== undefined) patch.order_index = dto.orderIndex;

    const [updated] = await this.knex<Assignment>('assignments')
      .where({ id })
      .update(patch)
      .returning('*');
    return updated as Assignment | undefined;
  }

  async delete(id: string): Promise<boolean> {
    const n = await this.knex('assignments').where({ id }).delete();
    return n > 0;
  }
}

