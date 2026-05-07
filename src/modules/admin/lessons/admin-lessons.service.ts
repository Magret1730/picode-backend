import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminLessonsRepository } from './admin-lessons.repository';
import type { CreateLessonDto, UpdateLessonDto } from './lesson.dto';

@Injectable()
export class AdminLessonsService {
  constructor(private readonly repo: AdminLessonsRepository) {}

  async create(dto: CreateLessonDto) {
    return await this.repo.create(dto);
  }

  async update(id: string, dto: UpdateLessonDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Lesson not found');
    return updated;
  }

  async delete(id: string) {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Lesson not found');
    return { ok: true };
  }
}

