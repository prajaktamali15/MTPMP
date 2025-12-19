import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Email/Password Registration
  async register(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);

    // Check if user already exists (possibly from an invitation)
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user exists but has an empty password, update their information
      if (user.password === '') {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashed,
            name: name || user.name,
            // Keep the role and organization from the invitation
          },
        });
      } else {
        // User already exists with a password
        throw new Error('User already exists');
      }
    } else {
      // Create new user without automatically creating an organization
      user = await this.prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
          role: 'MEMBER',
          organizationId: null,
        },
      });
    }
    
    return { message: 'User registered', userId: user.id };
  }

  // Validate user credentials
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return user;
  }

  // Login or register Google user
  async login(user: any) {
    // Check if user exists
    let dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      // Create new user for Google OAuth without automatically creating an organization
      dbUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: '', // empty for Google
          role: 'MEMBER',
          organizationId: null,
        },
      });
    }

    const payload = { sub: dbUser.id, email: dbUser.email, role: dbUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  generateJwt(user: any) {
    return this.jwtService.sign({ userId: user.id }, { expiresIn: '1d' });
  }
}