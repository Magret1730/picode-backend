import { Module } from '@nestjs/common';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { LevelsRepository } from './levels.repository';

@Module({
  controllers: [LevelsController],
  providers: [LevelsService, LevelsRepository],
  exports: [LevelsService, LevelsRepository],
})
export class LevelsModule {}

