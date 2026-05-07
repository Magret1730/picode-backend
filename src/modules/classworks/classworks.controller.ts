import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ClassworksService } from './classworks.service';

@Controller('classworks')
export class ClassworksController {
  constructor(private readonly classworks: ClassworksService) {}

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.classworks.getClassworkById(id);
  }
}

