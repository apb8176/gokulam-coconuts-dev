import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
              authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_M6dp7rfAC',
              redirectUrl:'http://localhost:4200',
              postLogoutRedirectUri: window.location.origin,
              clientId: '1e3316k9pmltncrvkgps2is19m',
              scope: 'email openid phone',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              renewTimeBeforeTokenExpiresInSeconds: 30,
          }
}
