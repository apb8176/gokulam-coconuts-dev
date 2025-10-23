import { Injectable } from '@angular/core';
import { 
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable({
  providedIn: 'root'
})
export class Cognito {
  private client: CognitoIdentityProviderClient;

  // === CONFIGURE (replace with your real values) ===
  private readonly region = 'eu-north-1';
  private readonly userPoolId = 'eu-north-1_ddXPh6PWc';
  private readonly clientId = '4amhtskq1d81v936gr5qu2102d';
  private readonly apiEndpoint = 'https://civ0w2cemc.execute-api.eu-north-1.amazonaws.com/dev/getUserType';
  // =================================================

  constructor() {
    this.client = new CognitoIdentityProviderClient({ region: this.region });
  }

  /**
   * 🆕 Sign up user (with custom attributes)
   */
  async signUpUser(formData: any) {
    const { email, password, firstName, lastName, role, phoneNumber } = formData;

    const params: any = {
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'phone_number', Value: phoneNumber },
        { Name: 'custom:first_name', Value: firstName },
        { Name: 'custom:second_name', Value: lastName },
        { Name: 'custom:role', Value: role }
      ]
    };

    const command = new SignUpCommand(params);
    return await this.client.send(command);
  }

  /**
   * ✅ Confirm user with verification code (OTP)
   */
  async confirmUser(username: string, code: string) {
    const params = {
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: code,
    };

    const command = new ConfirmSignUpCommand(params);
    return await this.client.send(command);
  }

  /**
   * 📩 Resend confirmation code
   */
  async resendConfirmation(username: string) {
    const params = {
      ClientId: this.clientId,
      Username: username,
    };

    const command = new ResendConfirmationCodeCommand(params);
    return await this.client.send(command);
  }

  /**
   * 🔐 Sign in (login)
   */
  async signIn(username: string, password: string) {
    const params: any = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await this.client.send(command);

    const idToken = response?.AuthenticationResult?.IdToken;

    if (idToken) {
      try {
        const apiResult = await this.callGetUserTypeApi(username, idToken);
        return { ...response, apiResult };
      } catch (apiError) {
        console.error('API call failed after login:', apiError);
      }
    }

    return response;
  }

  /**
   * 🌐 Call your getUserType API after successful sign-in
   */
  private async callGetUserTypeApi(username: string, idToken: string) {
    const body = JSON.stringify({ username });
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    };

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 🔄 Forgot password (send reset code to email/phone)
   */
  async forgotPassword(username: string) {
    const params = {
      ClientId: this.clientId,
      Username: username,
    };

    const command = new ForgotPasswordCommand(params);
    return await this.client.send(command);
  }

  /**
   * 🔁 Confirm forgot password (submit new password with code)
   */
  async confirmForgotPassword(username: string, code: string, newPassword: string) {
    const params = {
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    };

    const command = new ConfirmForgotPasswordCommand(params);
    return await this.client.send(command);
  }

  // 🚪 LOGOUT (added)
  async logout(accessToken?: string): Promise<void> {
    try {
      // 1️⃣ Attempt global sign-out (if we have accessToken)
      if (accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken,
        });
        await this.client.send(command);
      }

      // 2️⃣ Clear stored tokens from localStorage / sessionStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // 3️⃣ Optionally redirect to home/login
      window.location.href = '/';
      console.log('User logged out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
      // Always clear local state even if Cognito call fails
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/home';
    }
  }
}
