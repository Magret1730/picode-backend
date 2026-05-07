import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentsRepository } from './assignments.repository';

@Injectable()
export class AssignmentsService {
  constructor(private readonly repo: AssignmentsRepository) {}

  async getAssignmentById(id: string) {
    const assignment = await this.repo.findById(id);
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }
}

