import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import type { CourseResponseDto } from './dto/course-response.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly repo: CoursesRepository) {}

  async listCourses(): Promise<CourseResponseDto[]> {
    return await this.repo.findAll();
  }

  async getCourseBySlug(slug: string): Promise<CourseResponseDto> {
    const course = await this.repo.findBySlug(slug);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}

