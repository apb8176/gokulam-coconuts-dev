import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, BehaviorSubject, firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface CognitoAuthResult {
  AuthenticationResult: {
    AccessToken: string;
    IdToken: string;
    RefreshToken: string;
    ExpiresIn: number;
    TokenType: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TokenManagerService {
  private readonly REFRESH_INTERVAL = 60; // check every 60 sec
  private readonly CLIENT_ID = '4amhtskq1d81v936gr5qu2102d'; // replace with yours
  private readonly COGNITO_DOMAIN =
    'https://your-cognito-domain.auth.eu-north-1.amazoncognito.com'; // replace
  private readonly REFRESH_URL = `https://cognito-idp.eu-north-1.amazonaws.com/`;

  private idToken$ = new BehaviorSubject<string | null>(this.getIdToken());

  constructor(private http: HttpClient) {
    // check regularly for expiration
    interval(this.REFRESH_INTERVAL * 1000).subscribe(() => this.checkToken());
  }

  /** Save tokens to localStorage */
  storeTokens(auth: CognitoAuthResult['AuthenticationResult']): void {
    localStorage.setItem('id_token', auth.IdToken);
    localStorage.setItem('access_token', auth.AccessToken);
    localStorage.setItem('refresh_token', auth.RefreshToken);
    const expiresAt = Date.now() + auth.ExpiresIn * 1000;
    localStorage.setItem('token_expires_at', expiresAt.toString());
    this.idToken$.next(auth.IdToken);
  }

  /** Get ID token (current) */
  getIdToken(): string | null {
    return localStorage.getItem('id_token');
  }

  /** Returns an observable for components that need live token updates */
  idTokenChanges() {
    return this.idToken$.asObservable();
  }

  /** Check if the token is expired and refresh if needed */
  async checkToken(): Promise<void> {
    const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0', 10);
    const now = Date.now();
    const isExpired = now > expiresAt - 60_000; // refresh 1 min early
    if (isExpired) {
      await this.refreshTokens();
    }
  }

  /** Call Cognito to refresh tokens */
  async refreshTokens(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('No refresh token found. User must re-login.');
      return;
    }

    const payload = {
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.CLIENT_ID,
    };

    try {
      const response = await firstValueFrom(
        this.http.post<CognitoAuthResult>(this.REFRESH_URL, payload, {
          headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth' },
        })
      );

      const newAuth = response.AuthenticationResult;
      if (newAuth?.IdToken) {
        console.log('✅ Token refreshed successfully');
        this.storeTokens(newAuth);
      }
    } catch (error) {
      console.error('❌ Token refresh failed', error);
      // optionally clear localStorage and redirect to login
    }
  }

  /** Decode token payload (optional helper) */
  decodeIdToken(): any {
    const token = this.getIdToken();
    return token ? jwtDecode(token) : null;
  }
}
