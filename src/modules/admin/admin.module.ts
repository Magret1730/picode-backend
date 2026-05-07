import { Module } from '@nestjs/common';
import { AdminLessonsController } from './lessons/admin-lessons.controller';
import { AdminLessonsService } from './lessons/admin-lessons.service';
import { AdminLessonsRepository } from './lessons/admin-lessons.repository';
import { AdminClassworksController } from './classworks/admin-classworks.controller';
import { AdminClassworksService } from './classworks/admin-classworks.service';
import { AdminClassworksRepository } from './classworks/admin-classworks.repository';
import { AdminAssignmentsController } from './assignments/admin-assignments.controller';
import { AdminAssignmentsService } from './assignments/admin-assignments.service';
import { AdminAssignmentsRepository } from './assignments/admin-assignments.repository';

@Module({
  controllers: [
    AdminLessonsController,
    AdminClassworksController,
    AdminAssignmentsController,
  ],
  providers: [
    AdminLessonsService,
    AdminLessonsRepository,
    AdminClassworksService,
    AdminClassworksRepository,
    AdminAssignmentsService,
    AdminAssignmentsRepository,
  ],
})
export class AdminModule {}

