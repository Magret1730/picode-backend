import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminClassworksRepository } from './admin-classworks.repository';
import type { CreateClassworkDto, UpdateClassworkDto } from './classwork.dto';

@Injectable()
export class AdminClassworksService {
  constructor(private readonly repo: AdminClassworksRepository) {}

  async list() {
    return await this.repo.list();
  }

  async getById(id: string) {
    const cw = await this.repo.findById(id);
    if (!cw) throw new NotFoundException('Classwork not found');
    return cw;
  }

  async create(dto: CreateClassworkDto) {
    return await this.repo.create(dto);
  }

  async update(id: string, dto: UpdateClassworkDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Classwork not found');
    return updated;
  }

  async delete(id: string) {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Classwork not found');
    return { ok: true };
  }
}

