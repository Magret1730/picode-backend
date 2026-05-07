import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { knexProvider } from './knex.provider';

@Global()
@Module({
  providers: [knexProvider, DatabaseService],
  exports: [knexProvider, DatabaseService],
})
export class DatabaseModule {}

