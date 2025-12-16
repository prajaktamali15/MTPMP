import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    this.logger.log(`Registration attempt for email: ${dto.email}`);
    this.logger.log(`Raw request body: ${JSON.stringify(req.body)}`);
    this.logger.log(`DTO received: ${JSON.stringify(dto)}`);

    // Validate that required fields are present
    if (!dto.email || !dto.password) {
      this.logger.error(
        `Missing required fields. Email: ${!!dto.email}, Password: ${!!dto.password}`,
      );
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      this.logger.error(`Invalid email format: ${dto.email}`);
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    // Validate password length
    if (dto.password.length < 6) {
      this.logger.error(
        `Password too short: ${dto.password.length} characters`,
      );
      throw new HttpException(
        'Password must be at least 6 characters long',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.authService.register(
        dto.email,
        dto.password,
        dto.name,
      );
      this.logger.log(`Registration successful for email: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Registration failed for email: ${dto.email}`,
        error.stack,
      );
      if (error.code === 'P2002') {
        // Unique constraint violation
        return { error: 'User with this email already exists' };
      }
      return { error: 'Registration failed' };
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`);
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      if (!user) {
        this.logger.warn(`Invalid credentials for email: ${dto.email}`);
        return { error: 'Invalid credentials' };
      }
      const tokens = await this.authService.login(user);
      this.logger.log(`Login successful for email: ${dto.email}`);
      return tokens;
    } catch (error) {
      this.logger.error(`Login failed for email: ${dto.email}`, error.stack);
      return { error: 'Login failed' };
    }
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    // Log environment variables for debugging
    this.logger.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID}`);
    this.logger.log(
      `GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '[SET]' : '[NOT SET]'}`,
    );

    // Check if Google OAuth is properly configured
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (
      !clientID ||
      !clientSecret ||
      clientID === 'your_google_client_id_here' ||
      clientSecret === 'your_google_client_secret_here'
    ) {
      this.logger.warn('Google OAuth not configured properly');
      return res
        .status(400)
        .json({ error: 'Google OAuth not configured properly' });
    }

    // If configured, redirect to Google OAuth
    // Note: This will automatically redirect to Google's OAuth endpoint
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=http://localhost:3002/auth/google/callback&response_type=code&scope=email profile`,
    );
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Check if Google OAuth is properly configured
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (
      !clientID ||
      !clientSecret ||
      clientID === 'your_google_client_id_here' ||
      clientSecret === 'your_google_client_secret_here'
    ) {
      return res
        .status(400)
        .json({ error: 'Google OAuth not configured properly' });
    }

    try {
      const tokens = await this.authService.login(req.user);
      res.redirect(
        `http://localhost:3000/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
      );
    } catch (error) {
      res.redirect('http://localhost:3000/auth/login?error=google_auth_failed');
    }
  }
}
