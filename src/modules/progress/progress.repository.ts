import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';

export type ProgressRow = {
  id: string;
  user_id: string;
  course_id: string;
  level_id: string;
  lesson_id: string | null;
  status: 'passed' | 'in_progress';
  xp: number;
  created_at: string;
  updated_at: string;
};

export type ProgressLessonItem = {
  course_slug: string;
  course_title: string;
  lesson_id: string;
  lesson_title: string;
  xp: number;
  updated_at: string;
};

export type ProgressAssignmentItem = {
  course_slug: string;
  course_title: string;
  assignment_id: string;
  assignment_title: string;
  xp: number;
  updated_at: string;
};

export type ProgressCourseSummary = {
  course_id: string;
  course_slug: string;
  course_title: string;
  xp: number;
  lessons_completed: number;
  assignments_completed: number;
};

@Injectable()
export class ProgressRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async courseSummaries(userId: string): Promise<ProgressCourseSummary[]> {
    const rows = await this.knex('progress')
      .join('courses', 'progress.course_id', 'courses.id')
      .select({
        course_id: 'courses.id',
        course_slug: 'courses.slug',
        course_title: 'courses.title',
      })
      .sum({ xp: 'progress.xp' })
      .sum({
        lessons_completed: this.knex.raw(
          `case when progress.lesson_id is null then 0 else 1 end`,
        ),
      })
      .sum({
        assignments_completed: this.knex.raw(
          `case when progress.lesson_id is null then 1 else 0 end`,
        ),
      })
      .where('progress.user_id', userId)
      .andWhere('progress.status', 'passed')
      .groupBy('courses.id', 'courses.slug', 'courses.title')
      .orderBy('courses.title', 'asc');

    return rows.map((r: any) => ({
      course_id: String(r.course_id),
      course_slug: String(r.course_slug),
      course_title: String(r.course_title),
      xp: Number(r.xp ?? 0),
      lessons_completed: Number(r.lessons_completed ?? 0),
      assignments_completed: Number(r.assignments_completed ?? 0),
    }));
  }

  async completedLessons(userId: string): Promise<ProgressLessonItem[]> {
    const rows = await this.knex('progress')
      .join('courses', 'progress.course_id', 'courses.id')
      .join('lessons', 'progress.lesson_id', 'lessons.id')
      .select({
        course_slug: 'courses.slug',
        course_title: 'courses.title',
        lesson_id: 'lessons.id',
        lesson_title: 'lessons.title',
        xp: 'progress.xp',
        updated_at: 'progress.updated_at',
      })
      .where('progress.user_id', userId)
      .andWhere('progress.status', 'passed')
      .whereNotNull('progress.lesson_id')
      .orderBy('progress.updated_at', 'desc')
      .limit(50);

    return rows.map((r: any) => ({
      course_slug: String(r.course_slug),
      course_title: String(r.course_title),
      lesson_id: String(r.lesson_id),
      lesson_title: String(r.lesson_title),
      xp: Number(r.xp ?? 0),
      updated_at: String(r.updated_at),
    }));
  }

  async completedAssignments(userId: string): Promise<ProgressAssignmentItem[]> {
    // Assignment progress rows store lesson_id = null. We infer assignment title via latest passed submission.
    const rows = await this.knex('submissions')
      .join('assignments', 'submissions.assignment_id', 'assignments.id')
      .join('levels', 'assignments.level_id', 'levels.id')
      .join('courses', 'levels.course_id', 'courses.id')
      .select({
        course_slug: 'courses.slug',
        course_title: 'courses.title',
        assignment_id: 'assignments.id',
        assignment_title: 'assignments.title',
        updated_at: 'submissions.updated_at',
      })
      .where('submissions.user_id', userId)
      .andWhere('submissions.passed', true)
      .whereNotNull('submissions.assignment_id')
      .orderBy('submissions.updated_at', 'desc')
      .limit(20);

    // XP is tracked in progress table; for MVP we can show 10 per completed assignment.
    return rows.map((r: any) => ({
      course_slug: String(r.course_slug),
      course_title: String(r.course_title),
      assignment_id: String(r.assignment_id),
      assignment_title: String(r.assignment_title),
      xp: 10,
      updated_at: String(r.updated_at),
    }));
  }
}

