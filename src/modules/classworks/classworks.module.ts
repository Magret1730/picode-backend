import { Module } from '@nestjs/common';
import { ClassworksController } from './classworks.controller';
import { ClassworksService } from './classworks.service';
import { ClassworksRepository } from './classworks.repository';

@Module({
  controllers: [ClassworksController],
  providers: [ClassworksService, ClassworksRepository],
  exports: [ClassworksService, ClassworksRepository],
})
export class ClassworksModule {}

