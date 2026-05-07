import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { LevelsService } from './levels.service';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levels: LevelsService) {}

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.levels.getLevelById(id);
  }
}

