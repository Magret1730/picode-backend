import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminLessonsService } from './admin-lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';

@Controller('admin/lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminLessonsController {
  constructor(private readonly lessons: AdminLessonsService) {}

  @Get()
  async list() {
    return await this.lessons.list();
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.lessons.getById(id);
  }

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

