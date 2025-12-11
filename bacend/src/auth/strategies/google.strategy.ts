import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  private isConfigured: boolean;

  constructor() {
    // Check if environment variables are set
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Only initialize if credentials are provided
    if (clientID && clientSecret && clientID !== 'your_google_client_id_here' && clientSecret !== 'your_google_client_secret_here') {
      super({
        clientID,
        clientSecret,
        callbackURL: 'http://localhost:3002/auth/google/callback',
        scope: ['email', 'profile'],
      });
      this.isConfigured = true;
      this.logger.log('Google OAuth strategy initialized successfully');
    } else {
      // Initialize with placeholder values to avoid constructor issues
      super({
        clientID: 'placeholder',
        clientSecret: 'placeholder',
        callbackURL: 'http://localhost:3002/auth/google/callback',
        scope: ['email', 'profile'],
      });
      this.isConfigured = false;
      this.logger.warn('Google OAuth credentials not found. Google login will be disabled.');
    }
  }

  // This method is called automatically after Google login
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    // If Google OAuth is not properly configured, reject the request
    if (!this.isConfigured) {
      throw new UnauthorizedException('Google OAuth is not properly configured');
    }
    
    const email = profile.emails && profile.emails[0].value;
    const name = profile.name?.givenName;

    // Return user object to be available in request.user
    return {
      email,
      name,
      accessToken,
    };
  }
}