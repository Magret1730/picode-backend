import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { DatabaseModule } from './common/database/database.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LevelsModule } from './modules/levels/levels.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ClassworksModule } from './modules/classworks/classworks.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ProgressModule } from './modules/progress/progress.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      expandVariables: true,
    }),
    DatabaseModule,
    HealthModule,
    SubmissionsModule,
    UsersModule,
    CoursesModule,
    LevelsModule,
    LessonsModule,
    ClassworksModule,
    AssignmentsModule,
    ProgressModule,
  ],
})
export class AppModule {}
