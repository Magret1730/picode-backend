import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';

describe('CoursesService', () => {
  it('lists courses', async () => {
    const repo: Partial<CoursesRepository> = {
      findAll: async () => [
        {
          id: '1',
          title: 'HTML Beginner',
          slug: 'html-beginner',
          description: 'x',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };
    const service = new CoursesService(repo as CoursesRepository);
    const list = await service.listCourses();
    expect(list).toHaveLength(1);
    expect(list[0].slug).toBe('html-beginner');
  });
});

