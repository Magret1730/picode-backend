import { BadRequestException, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { ProgressRepository } from './progress.repository';

type ProgressResponse = {
  userId: string;
  xpTotal: number;
  currentCourseSlug: string | null;
  courseSummaries: Array<{
    courseSlug: string;
    courseTitle: string;
    xp: number;
    lessonsCompleted: number;
    assignmentsCompleted: number;
  }>;
  completedLessons: Array<{
    courseSlug: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    xp: number;
    completedAt: string;
  }>;
  completedAssignments: Array<{
    courseSlug: string;
    courseTitle: string;
    assignmentId: string;
    assignmentTitle: string;
    xp: number;
    completedAt: string;
  }>;
};

@Injectable()
export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async getForUser(trx: Knex, userIdOrAlias: string): Promise<ProgressResponse> {
    const userId = await resolveUserId(trx, userIdOrAlias);
    const courseSummaries = await this.repo.courseSummaries(userId);
    const completedLessons = await this.repo.completedLessons(userId);
    const completedAssignments = await this.repo.completedAssignments(userId);

    const xpTotal = courseSummaries.reduce((sum, c) => sum + c.xp, 0);
    const currentCourseSlug = courseSummaries[0]?.course_slug ?? null;

    return {
      userId,
      xpTotal,
      currentCourseSlug,
      courseSummaries: courseSummaries.map((c) => ({
        courseSlug: c.course_slug,
        courseTitle: c.course_title,
        xp: c.xp,
        lessonsCompleted: c.lessons_completed,
        assignmentsCompleted: c.assignments_completed,
      })),
      completedLessons: completedLessons.map((l) => ({
        courseSlug: l.course_slug,
        courseTitle: l.course_title,
        lessonId: l.lesson_id,
        lessonTitle: l.lesson_title,
        xp: l.xp,
        completedAt: l.updated_at,
      })),
      completedAssignments: completedAssignments.map((a) => ({
        courseSlug: a.course_slug,
        courseTitle: a.course_title,
        assignmentId: a.assignment_id,
        assignmentTitle: a.assignment_title,
        xp: a.xp,
        completedAt: a.updated_at,
      })),
    };
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function resolveUserId(trx: Knex, input: string): Promise<string> {
  if (input === 'demo-user') {
    const existing = await trx('users')
      .select('id')
      .where({ email: 'demo@picode.local' })
      .first();
    if (existing?.id) return String(existing.id);

    await trx('users')
      .insert({
        name: 'Demo User',
        email: 'demo@picode.local',
        password_hash: 'demo',
        role: 'student',
        age_group: 'kid',
      })
      .onConflict('email')
      .ignore();

    const created = await trx('users')
      .select('id')
      .where({ email: 'demo@picode.local' })
      .first();
    if (!created?.id) {
      throw new BadRequestException('Could not create demo user');
    }
    return String(created.id);
  }

  if (!isUuid(input)) {
    throw new BadRequestException('userId must be a valid UUID');
  }
  return input;
}

