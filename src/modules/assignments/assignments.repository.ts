import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import type { Assignment } from './interfaces/assignment.interface';

@Injectable()
export class AssignmentsRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string): Promise<Assignment | undefined> {
    return await this.knex<Assignment>('assignments')
      .select('*')
      .where({ id })
      .first();
  }
}

