import { PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
              authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ddXPh6PWc',
              redirectUrl:environment.redirectUrl,
              postLogoutRedirectUri: window.location.origin,
              clientId: '4amhtskq1d81v936gr5qu2102d',
              scope: 'email openid phone',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              renewTimeBeforeTokenExpiresInSeconds: 30,
          }
}
