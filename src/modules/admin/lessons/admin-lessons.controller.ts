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
import { AdminLessonsService } from './admin-lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';

@Controller('admin/lessons')
@UseGuards(AdminGuard)
export class AdminLessonsController {
  constructor(private readonly lessons: AdminLessonsService) {}

  @Post()
  async create(@Body() body: CreateLessonDto) {
    return await this.lessons.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateLessonDto,
  ) {
    return await this.lessons.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.lessons.delete(id);
  }
}

