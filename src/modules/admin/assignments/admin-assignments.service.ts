import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminAssignmentsRepository } from './admin-assignments.repository';
import type { CreateAssignmentDto, UpdateAssignmentDto } from './assignment.dto';

@Injectable()
export class AdminAssignmentsService {
  constructor(private readonly repo: AdminAssignmentsRepository) {}

  async list() {
    return await this.repo.list();
  }

  async getById(id: string) {
    const a = await this.repo.findById(id);
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  async create(dto: CreateAssignmentDto) {
    return await this.repo.create(dto);
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Assignment not found');
    return updated;
  }

  async delete(id: string) {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Assignment not found');
    return { ok: true };
  }
}

