import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

interface GraphQLResponse {
  data?: {
    validateToken: Record<string, unknown>;
  };
  errors?: unknown[];
}

@Injectable()
export class ExternalAuthService {
  constructor(private readonly httpService: HttpService) {}

  async validateToken(token: string): Promise<Record<string, unknown>> {
    try {
      const auth_service_url = process.env.AUTH_SERVICE_URL;
      const response: AxiosResponse<GraphQLResponse> = await firstValueFrom(
        this.httpService.post(`${auth_service_url}/graphql`, {
          query: `
              query ValidateToken($token: String!) {
                validateToken(token: $token) {
                  id
                  email
                  createdAt
                  updatedAt
                }
              }
            `,
          variables: { token },
        }),
      );

      const data = response.data;

      if (data.errors) {
        throw new UnauthorizedException('Invalid token');
      }

      return data.data?.validateToken ?? {};
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
