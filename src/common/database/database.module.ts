import { Global, Module } from '@nestjs/common';
import { knexProvider } from './knex.provider';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [knexProvider, DatabaseService],
  exports: [knexProvider, DatabaseService],
})
export class DatabaseModule {}

