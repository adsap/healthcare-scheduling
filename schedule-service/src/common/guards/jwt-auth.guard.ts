import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ExternalAuthService } from '../../auth/external-auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly externalAuthService: ExternalAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{
      req: { headers: { authorization?: string }; user?: unknown };
    }>().req;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.warn('No authorization header found in request');
      throw new UnauthorizedException('Authorization header required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid authorization header format');
      throw new UnauthorizedException(
        'Invalid authorization header format. Expected: "Bearer <token>"',
      );
    }

    const token = authHeader.substring(7);
    if (!token) {
      this.logger.warn('Empty token provided');
      throw new UnauthorizedException('Token required');
    }

    try {
      const user = await this.externalAuthService.validateToken(token);

      if (!user || !user.id) {
        this.logger.warn('Invalid user data returned from auth service');
        throw new UnauthorizedException('Invalid authentication credentials');
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(
        `Token validation failed: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }
}
