import { Injectable, NotFoundException } from '@nestjs/common';
import { LevelsRepository } from './levels.repository';

@Injectable()
export class LevelsService {
  constructor(private readonly repo: LevelsRepository) {}

  async getLevelById(id: string) {
    const level = await this.repo.findById(id);
    if (!level) throw new NotFoundException('Level not found');
    return level;
  }
}

