import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(
    private readonly db: DatabaseService,
    private readonly progress: ProgressService,
  ) {}

  @Get(':userId')
  async getForUser(@Param('userId') userId: string) {
    return await this.db.client.transaction(async (trx) => {
      return await this.progress.getForUser(trx, userId);
    });
  }
}

