import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from './knex.provider';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async ping(): Promise<boolean> {
    await this.knex.raw('select 1 as ok');
    return true;
  }

  async onModuleDestroy() {
    await this.knex.destroy();
  }
}

