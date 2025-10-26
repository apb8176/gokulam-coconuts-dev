import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, BehaviorSubject, firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service'; // adjust path if different
import { NotificationService } from './notification-service'; // adjust path if different
import { Router } from '@angular/router';

interface CognitoAuthResult {
  AuthenticationResult?: {
    AccessToken?: string;
    IdToken?: string;
    RefreshToken?: string;
    ExpiresIn?: number;
    TokenType?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TokenManagerService {
  private readonly REFRESH_INTERVAL = 60; // check every 60 sec
  private readonly CLIENT_ID = '4amhtskq1d81v936gr5qu2102d'; // replace with yours
  // We call AWS 'InitiateAuth' via cognito-idp endpoint
  private readonly REFRESH_URL = `https://cognito-idp.eu-north-1.amazonaws.com/`;

  private idToken$ = new BehaviorSubject<string | null>(this.getIdToken());

  // guard to prevent parallel refresh attempts
  private refreshPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private auth?: AuthService,
    private notify?: NotificationService,
    private router?: Router
  ) {
    // check regularly for expiration
    interval(this.REFRESH_INTERVAL * 1000).subscribe(() => {
      // don't await here — silent background check
      this.checkToken().catch((e) => console.warn('Token check failed', e));
    });
  }

  /** Save tokens to localStorage */
  storeTokens(auth: CognitoAuthResult['AuthenticationResult']): void {
    if (!auth) return;
    if (auth.IdToken) localStorage.setItem('id_token', auth.IdToken);
    if (auth.AccessToken) localStorage.setItem('access_token', auth.AccessToken);
    // Only overwrite refresh_token if Cognito returned a new one (usually not returned on REFRESH)
    if (auth.RefreshToken) localStorage.setItem('refresh_token', auth.RefreshToken);

    if (auth.ExpiresIn) {
      const expiresAt = Date.now() + auth.ExpiresIn * 1000;
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }

    this.idToken$.next(auth.IdToken || this.getIdToken());
  }

  /** Get ID token (current) */
  getIdToken(): string | null {
    return localStorage.getItem('id_token');
  }

  /** Get access token */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Get refresh token */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Returns an observable for components that need live token updates */
  idTokenChanges() {
    return this.idToken$.asObservable();
  }

  /** Clear stored tokens deterministically */
  clearTokens(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    this.idToken$.next(null);
  }

  /** Check if the token is expired and refresh if needed */
  async checkToken(): Promise<void> {
    try {
      const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0', 10);
      const now = Date.now();
      const shouldRefresh = !expiresAt || now > expiresAt - 60_000; // refresh 1 min early
      if (shouldRefresh) {
        await this.refreshTokens();
      }
    } catch (e) {
      console.error('checkToken error', e);
    }
  }

  /**
   * Call Cognito to refresh tokens (single inflight promise)
   * Uses REST InitiateAuth call to AWS Cognito IDP (same shape as AWS SDK)
   */
  async refreshTokens(): Promise<void> {
    // If a refresh is already in progress, return the same promise
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.warn('No refresh token found. User must re-login.');
        // optional: force logout
        await this.handleInvalidRefresh('No refresh token present');
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
            headers: {
              'Content-Type': 'application/x-amz-json-1.1',
              'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
            },
            // It's possible you need credentials here depending on CORS and AWS setup
          })
        );

        const newAuth = response?.AuthenticationResult;
        if (newAuth && (newAuth.AccessToken || newAuth.IdToken)) {
          console.log('✅ Token refreshed successfully');
          this.storeTokens(newAuth);
          return;
        }

        // If no AuthenticationResult returned, treat as failure
        console.warn('No AuthenticationResult in refresh response', response);
        await this.handleInvalidRefresh('Empty AuthenticationResult');
      } catch (err: any) {
        console.error('❌ Token refresh failed', err);

        // detect AWS NotAuthorizedException / Invalid Refresh Token
        const awsType = err?.error?.__type || err?.name || err?.__type;
        const awsMessage = (err?.error && err.error.message) || err?.message || '';

        const isInvalidRefresh =
          awsType === 'NotAuthorizedException' ||
          (typeof awsType === 'string' && awsType.includes('NotAuthorizedException')) ||
          (typeof awsMessage === 'string' && awsMessage.toLowerCase().includes('invalid refresh token')) ||
          (String(awsMessage).toLowerCase().includes('invalid refresh token'));

        if (isInvalidRefresh) {
          await this.handleInvalidRefresh(awsMessage || 'Invalid Refresh Token');
        } else {
          // for other errors you might want to retry later; for now, log and clear if repeated failure
          console.warn('Refresh failed (non NotAuthorized). Clearing tokens to be safe.');
          await this.handleInvalidRefresh(awsMessage || 'Refresh failed');
        }
      } finally {
        // reset inflight promise
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Handle invalid refresh token flow:
   * - Show message "Logging out due to inactivity"
   * - Clear tokens
   * - Call AuthService.logout()
   * - Redirect to /home
   */
  private async handleInvalidRefresh(reason?: string): Promise<void> {
    console.warn('Handling invalid refresh token:', reason);

    // Clear local tokens immediately to avoid further use
    this.clearTokens();

    // Show a friendly notification to the user about inactivity logout.
    try {
      const message = 'Logging out due to inactivity. Please sign in again.';
      if (this.notify && typeof (this.notify as any).showInfo === 'function') {
        // await so user sees the message before redirect (showInfo returns a promise in our NotificationService impl)
        await (this.notify as any).showInfo('Session expired', message);
      } else if (this.notify && typeof (this.notify as any).confirm === 'function') {
        // if only confirm exists, show it but don't require confirmation
        try { await (this.notify as any).confirm('Session expired', message, 'OK'); } catch {}
      } else {
        // fallback
        try { window.alert(message); } catch {}
      }
    } catch (e) {
      console.warn('Notification failed', e);
    }

    // Attempt to logout via AuthService if available, otherwise just navigate
    try {
      if (this.auth && typeof (this.auth as any).logout === 'function') {
        const res = (this.auth as any).logout();
        if (res && typeof (res as Promise<any>).then === 'function') {
          await res;
        }
      }
    } catch (e) {
      console.warn('AuthService.logout failed', e);
    }

    // Finally redirect to /home
    try {
      if (this.router) {
        await this.router.navigate(['/home']);
      } else {
        // last resort
        window.location.href = '/home';
      }
    } catch (e) {
      console.warn('Redirect to /home failed', e);
      try { window.location.href = '/home'; } catch {}
    }
  }

  /** Decode token payload (optional helper) */
  decodeIdToken(): any {
    const token = this.getIdToken();
    try {
      return token ? (jwtDecode(token) as any) : null;
    } catch (e) {
      console.warn('Failed to decode id token', e);
      return null;
    }
  }
}
