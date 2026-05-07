import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
    const header =
      (req.headers?.['x-admin-key'] as string | undefined) ??
      (req.headers?.['X-Admin-Key'] as string | undefined);

    const expected = this.config.get<string>('ADMIN_KEY') ?? 'dev-admin';
    if (header && header === expected) return true;

    throw new UnauthorizedException(
      'Admin access required. Provide X-Admin-Key header.',
    );
  }
}

