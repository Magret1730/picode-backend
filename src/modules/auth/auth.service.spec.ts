import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import type { AuthRepository, DbUser } from './auth.repository';

describe('AuthService', () => {
  const jwt = {
    sign: jest.fn(() => 'jwt-token'),
  } as unknown as JwtService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register success', async () => {
    let createdPasswordHash = '';
    const repo = {
      findByEmail: async () => undefined,
      createUser: async (input: any) => {
        createdPasswordHash = String(input.passwordHash);
        const user: DbUser = {
          id: '00000000-0000-4000-8000-000000000000',
          name: input.name,
          email: input.email,
          password_hash: input.passwordHash,
          role: input.role,
          age_group: input.ageGroup ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return user;
      },
      findById: async () => undefined,
    } as unknown as AuthRepository;

    const service = new AuthService(repo, jwt);
    const res = await service.register({
      name: 'Demo Student',
      email: 'student@example.com',
      password: 'password123',
    });

    expect(res.user.email).toBe('student@example.com');
    expect(res.user.ageGroup).toBeNull();
    expect(res.user.role).toBe('student');
    expect(res.token).toBe('jwt-token');
    expect(createdPasswordHash).toBeTruthy();
    expect(await bcrypt.compare('password123', createdPasswordHash)).toBe(true);
  });

  it('duplicate email fails', async () => {
    const repo = {
      findByEmail: async () =>
        ({
          id: 'id',
          name: 'X',
          email: 'student@example.com',
          password_hash: 'hash',
          role: 'student',
          age_group: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }) as DbUser,
    } as unknown as AuthRepository;

    const service = new AuthService(repo, jwt);
    await expect(
      service.register({
        name: 'Demo Student',
        email: 'student@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('login success', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const repo = {
      findByEmail: async () =>
        ({
          id: '00000000-0000-4000-8000-000000000000',
          name: 'Demo Student',
          email: 'student@example.com',
          password_hash: hash,
          role: 'student',
          age_group: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }) as DbUser,
    } as unknown as AuthRepository;

    const service = new AuthService(repo, jwt);
    const res = await service.login({
      email: 'student@example.com',
      password: 'password123',
    });
    expect(res.user.email).toBe('student@example.com');
    expect(res.token).toBe('jwt-token');
  });

  it('login wrong password fails', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const repo = {
      findByEmail: async () =>
        ({
          id: '00000000-0000-4000-8000-000000000000',
          name: 'Demo Student',
          email: 'student@example.com',
          password_hash: hash,
          role: 'student',
          age_group: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }) as DbUser,
    } as unknown as AuthRepository;

    const service = new AuthService(repo, jwt);
    await expect(
      service.login({
        email: 'student@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

