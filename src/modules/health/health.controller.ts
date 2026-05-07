import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async health() {
    const startedAt = Date.now();
    try {
      await this.db.ping();
      return { ok: true, db: 'up', durationMs: Date.now() - startedAt };
    } catch {
      return { ok: false, db: 'down', durationMs: Date.now() - startedAt };
    }
  }
}

