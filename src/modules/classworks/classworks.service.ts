import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassworksRepository } from './classworks.repository';

@Injectable()
export class ClassworksService {
  constructor(private readonly repo: ClassworksRepository) {}

  async getClassworkById(id: string) {
    const classwork = await this.repo.findById(id);
    if (!classwork) throw new NotFoundException('Classwork not found');
    return classwork;
  }
}

