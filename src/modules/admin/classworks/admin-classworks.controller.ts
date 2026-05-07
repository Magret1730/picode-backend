import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { AdminClassworksService } from './admin-classworks.service';
import { CreateClassworkDto, UpdateClassworkDto } from './classwork.dto';

@Controller('admin/classworks')
@UseGuards(AdminGuard)
export class AdminClassworksController {
  constructor(private readonly classworks: AdminClassworksService) {}

  @Post()
  async create(@Body() body: CreateClassworkDto) {
    return await this.classworks.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateClassworkDto,
  ) {
    return await this.classworks.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.classworks.delete(id);
  }
}

