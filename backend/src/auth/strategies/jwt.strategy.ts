import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JwtUser } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'replace-this-in-production-with-a-long-secret',
      ),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName ?? null,
    };
  }
}
