import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../../common/database/knex.provider';
import { SubmissionTestRunnerService } from './test-runner/submission-test-runner.service';
import type { FriendlyResult, TestConfig } from './test-runner/types';

type RunTestsBody = {
  userId: string;
  classworkId?: string;
  assignmentId?: string;
  submittedCode: string;
};

type RunTestsResponse = {
  passed: boolean;
  results: FriendlyResult[];
};

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly runner: SubmissionTestRunnerService,
  ) {}

  async runTestsAndSave(body: RunTestsBody): Promise<RunTestsResponse> {
    const { userId, classworkId, assignmentId, submittedCode } = body;

    if (!userId || !submittedCode) {
      throw new BadRequestException('userId and submittedCode are required');
    }
    if ((classworkId ? 1 : 0) + (assignmentId ? 1 : 0) !== 1) {
      throw new BadRequestException(
        'Provide exactly one of classworkId or assignmentId',
      );
    }
    if (classworkId && !isUuid(classworkId)) {
      throw new BadRequestException('classworkId must be a valid UUID');
    }
    if (assignmentId && !isUuid(assignmentId)) {
      throw new BadRequestException('assignmentId must be a valid UUID');
    }

    return await this.knex.transaction(async (trx) => {
      const resolvedUserId = await resolveUserId(trx, userId);
      const target = classworkId
        ? await trx('classworks')
            .select('id', 'lesson_id', 'test_config')
            .where({ id: classworkId })
            .first()
        : await trx('assignments')
            .select('id', 'level_id', 'test_config')
            .where({ id: assignmentId })
            .first();

      if (!target) {
        throw new BadRequestException('classwork/assignment not found');
      }

      const testConfig = (target.test_config ?? {}) as TestConfig;
      const { passed, results } = this.runner.run(submittedCode, testConfig);

      await trx('submissions').insert({
        user_id: resolvedUserId,
        classwork_id: classworkId ?? null,
        assignment_id: assignmentId ?? null,
        submitted_code: submittedCode,
        test_results: { results },
        passed,
      });

      if (passed) {
        await this.upsertProgress(trx, {
          userId: resolvedUserId,
          classworkId,
          assignmentId,
        });
      }

      return { passed, results };
    });
  }

  private async upsertProgress(
    trx: Knex,
    input: {
      userId: string;
      classworkId?: string;
      assignmentId?: string;
    },
  ): Promise<void> {
    // Find course/level/lesson context
    if (input.classworkId) {
      const row = await trx('classworks')
        .join('lessons', 'classworks.lesson_id', 'lessons.id')
        .join('levels', 'lessons.level_id', 'levels.id')
        .join('courses', 'levels.course_id', 'courses.id')
        .select({
          lesson_id: 'lessons.id',
          level_id: 'levels.id',
          course_id: 'courses.id',
        })
        .where('classworks.id', input.classworkId)
        .first();
      if (!row) return;

      await upsertProgressRow(trx, {
        user_id: input.userId,
        course_id: row.course_id,
        level_id: row.level_id,
        lesson_id: row.lesson_id,
      });
      return;
    }

    if (input.assignmentId) {
      const row = await trx('assignments')
        .join('levels', 'assignments.level_id', 'levels.id')
        .join('courses', 'levels.course_id', 'courses.id')
        .select({
          level_id: 'levels.id',
          course_id: 'courses.id',
        })
        .where('assignments.id', input.assignmentId)
        .first();
      if (!row) return;

      await upsertProgressRow(trx, {
        user_id: input.userId,
        course_id: row.course_id,
        level_id: row.level_id,
        lesson_id: null,
      });
    }
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

async function upsertProgressRow(
  trx: Knex,
  row: {
    user_id: string;
    course_id: string;
    level_id: string;
    lesson_id: string | null;
  },
): Promise<void> {
  const existing = await trx('progress')
    .select('id', 'xp')
    .where({
      user_id: row.user_id,
      course_id: row.course_id,
      level_id: row.level_id,
      lesson_id: row.lesson_id,
    })
    .first();

  const now = trx.fn.now();
  const xpEarned = 10;

  if (!existing?.id) {
    await trx('progress').insert({
      ...row,
      status: 'passed',
      xp: xpEarned,
      created_at: now,
      updated_at: now,
    });
    return;
  }

  await trx('progress')
    .where({ id: existing.id })
    .update({
      status: 'passed',
      xp: Number(existing.xp ?? 0) + xpEarned,
      updated_at: now,
    });
}

