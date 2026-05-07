import { Body, Controller, Post } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';

type RunTestsBody = {
  userId: string;
  classworkId?: string;
  assignmentId?: string;
  submittedCode: string;
};

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post('run-tests')
  async runTests(@Body() body: RunTestsBody) {
    return await this.submissions.runTestsAndSave(body);
  }
}

