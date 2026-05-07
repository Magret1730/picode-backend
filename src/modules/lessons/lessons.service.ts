import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsRepository } from './lessons.repository';

@Injectable()
export class LessonsService {
  constructor(private readonly repo: LessonsRepository) {}

  async getLessonById(id: string) {
    const lesson = await this.repo.findByIdWithClasswork(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async listLessonsForCourseSlug(courseSlug: string) {
    return await this.repo.listForCourseSlug(courseSlug);
  }
}

