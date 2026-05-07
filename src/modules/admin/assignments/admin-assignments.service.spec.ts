import { NotFoundException } from '@nestjs/common';
import { AdminAssignmentsService } from './admin-assignments.service';
import type { AdminAssignmentsRepository } from './admin-assignments.repository';

describe('AdminAssignmentsService', () => {
  it('creates an assignment', async () => {
    const repo = {
      create: async (dto: any) => ({ id: 'id', ...dto }),
    } as unknown as AdminAssignmentsRepository;
    const service = new AdminAssignmentsService(repo);

    const created = await service.create({
      levelId: '00000000-0000-4000-8000-000000000000',
      title: 'T',
      instructions: 'i',
      orderIndex: 1,
    });
    expect(created).toHaveProperty('id');
  });

  it('throws NotFound on update when missing', async () => {
    const repo = {
      update: async () => undefined,
    } as unknown as AdminAssignmentsRepository;
    const service = new AdminAssignmentsService(repo);

    await expect(
      service.update('00000000-0000-4000-8000-000000000000', { title: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFound on delete when missing', async () => {
    const repo = {
      delete: async () => false,
    } as unknown as AdminAssignmentsRepository;
    const service = new AdminAssignmentsService(repo);

    await expect(
      service.delete('00000000-0000-4000-8000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

