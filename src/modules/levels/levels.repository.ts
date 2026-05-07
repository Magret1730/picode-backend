import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import type { Level } from './interfaces/level.interface';

@Injectable()
export class LevelsRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async findById(id: string): Promise<Level | undefined> {
    return await this.knex<Level>('levels').select('*').where({ id }).first();
  }
}

