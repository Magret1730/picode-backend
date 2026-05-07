import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionTestRunnerService } from './test-runner/submission-test-runner.service';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionTestRunnerService],
})
export class SubmissionsModule {}

