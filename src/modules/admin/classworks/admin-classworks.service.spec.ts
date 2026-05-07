import { NotFoundException } from '@nestjs/common';
import { AdminClassworksService } from './admin-classworks.service';
import type { AdminClassworksRepository } from './admin-classworks.repository';

describe('AdminClassworksService', () => {
  it('creates a classwork', async () => {
    const repo = {
      create: async (dto: any) => ({ id: 'id', ...dto }),
    } as unknown as AdminClassworksRepository;
    const service = new AdminClassworksService(repo);

    const created = await service.create({
      lessonId: '00000000-0000-4000-8000-000000000000',
      title: 'T',
      instructions: 'i',
      orderIndex: 1,
    });
    expect(created).toHaveProperty('id');
  });

  it('throws NotFound on update when missing', async () => {
    const repo = {
      update: async () => undefined,
    } as unknown as AdminClassworksRepository;
    const service = new AdminClassworksService(repo);

    await expect(
      service.update('00000000-0000-4000-8000-000000000000', { title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFound on delete when missing', async () => {
    const repo = {
      delete: async () => false,
    } as unknown as AdminClassworksRepository;
    const service = new AdminClassworksService(repo);

    await expect(
      service.delete('00000000-0000-4000-8000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

