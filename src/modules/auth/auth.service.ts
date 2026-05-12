import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository, type PublicUser, toPublicUser } from './auth.repository';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

export type AuthResponse = { user: PublicUser; token: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.repo.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: 'student',
    });

    const user = toPublicUser(created);
    const token = this.signToken({ sub: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const pub = toPublicUser(user);
    const token = this.signToken({ sub: pub.id, email: pub.email, role: pub.role });
    return { user: pub, token };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return toPublicUser(user);
  }

  private signToken(payload: JwtPayload): string {
    try {
      return this.jwt.sign(payload);
    } catch {
      throw new BadRequestException('Could not generate token');
    }
  }
}

