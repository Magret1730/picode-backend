import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import type { Classwork } from './interfaces/classwork.interface';

@Injectable()
export class ClassworksRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string): Promise<Classwork | undefined> {
    return await this.knex<Classwork>('classworks')
      .select('*')
      .where({ id })
      .first();
  }
}

