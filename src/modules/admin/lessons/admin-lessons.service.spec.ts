import { NotFoundException } from '@nestjs/common';
import { AdminLessonsService } from './admin-lessons.service';
import type { AdminLessonsRepository } from './admin-lessons.repository';

describe('AdminLessonsService', () => {
  it('creates a lesson', async () => {
    const repo = {
      create: async (dto: any) => ({ id: 'id', ...dto }),
    } as unknown as AdminLessonsRepository;
    const service = new AdminLessonsService(repo);

    const created = await service.create({
      levelId: '00000000-0000-4000-8000-000000000000',
      title: 'T',
      slug: 't',
      goal: 'g',
      explanation: 'e',
      orderIndex: 1,
    });
    expect(created).toHaveProperty('id');
  });

  it('throws NotFound on update when missing', async () => {
    const repo = {
      update: async () => undefined,
    } as unknown as AdminLessonsRepository;
    const service = new AdminLessonsService(repo);

    await expect(
      service.update('00000000-0000-4000-8000-000000000000', { title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFound on delete when missing', async () => {
    const repo = {
      delete: async () => false,
    } as unknown as AdminLessonsRepository;
    const service = new AdminLessonsService(repo);

    await expect(
      service.delete('00000000-0000-4000-8000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

