import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';

describe('LessonsService', () => {
  it('throws NotFound when lesson missing', async () => {
    const repo: Partial<LessonsRepository> = {
      findByIdWithClasswork: async () => undefined,
    };
    const service = new LessonsService(repo as LessonsRepository);
    await expect(service.getLessonById('missing')).rejects.toThrow('Lesson not found');
  });
});

