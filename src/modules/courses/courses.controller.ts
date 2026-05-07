import { Controller, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { LessonsService } from '../lessons/lessons.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly lessons: LessonsService,
  ) {}

  @Get()
  async list() {
    return await this.courses.listCourses();
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return await this.courses.getCourseBySlug(slug);
  }

  @Get(':slug/lessons')
  async listLessons(@Param('slug') slug: string) {
    return await this.lessons.listLessonsForCourseSlug(slug);
  }
}

