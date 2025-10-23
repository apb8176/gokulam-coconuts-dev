import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { TokenManagerService } from '../../../services/token-manager';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-popup',
  standalone: false,
  templateUrl: './signin-popup.html',
  styleUrls: ['./signin-popup.scss'],
})
export class SigninPopup implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<any>();
  @Output() signin = new EventEmitter<any>();

  signinForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  errorMessage: string = '';
  infoMessage: string = '';
  forgotPasswordMode: boolean = false;
  codeSent: boolean = false;

  // Loading flags
  isLoadingSignIn = false;
  isLoadingForgot = false;
  isLoadingConfirm = false;

  // Prevent rapid toggle clicks
  toggleDisabled = false;

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private cognitoService: Cognito,
    private tokenManager: TokenManagerService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.forgotPasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f() {
    return this.signinForm.controls;
  }

  // convenience check if any loader active
  isAnyLoading(): boolean {
    return this.isLoadingSignIn || this.isLoadingForgot || this.isLoadingConfirm;
  }

  closePopup(): void {
    if (this.isAnyLoading()) return; // avoid closing mid-action
    this.isVisible = false;
    this.close.emit();
    this.resetAllForms();
  }

  private resetAllForms() {
    this.signinForm.reset();
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
    this.errorMessage = '';
    this.infoMessage = '';
    this.forgotPasswordMode = false;
    this.codeSent = false;
    this.isLoadingSignIn = false;
    this.isLoadingForgot = false;
    this.isLoadingConfirm = false;
    this.toggleDisabled = false;
  }

  // Updated onSubmit (sign in)
  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.signinForm.markAllAsTouched();

    if (!this.signinForm.valid) {
      const invalidFields: string[] = [];
      if (this.f['username'].invalid) invalidFields.push('Username');
      if (this.f['password'].invalid) invalidFields.push('Password');
      this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
      return;
    }

    if (this.isAnyLoading()) return; // avoid duplicate submissions

    this.isLoadingSignIn = true;
    try {
      const { username, password } = this.signinForm.value;
      const result: any = await this.cognitoService.signIn(username, password);
      console.log('Signed in successfully:', result);
      
      if (result?.AuthenticationResult) {
        this.authService.saveUser(result.apiResult?.item);
        this.tokenManager.storeTokens(result.AuthenticationResult);
         this.isLoadingSignIn = false;
        
      }

      this.signin.emit(result);
      // Determine redirect path by user type or role
    const currentUser = this.authService.getUser() || result.apiResult?.item || {};
    const role = currentUser.user_type || currentUser.role || currentUser.userRole || '';

    // Map roles -> route segments (adjust keys as your backend returns them)
    const roleToRoute: Record<string, string> = {
       'admin': 'admin',
      'property-owner': 'property-owner',
      'property_owner': 'property-owner',
      'propertyOwner': 'property-owner',
      'busines-owner': 'busines-owner',
      'business-owner': 'busines-owner',
      'business_owner': 'busines-owner',
      'community-member': 'community-member',
      'community_member': 'community-member',
      'communityMember': 'community-member',
      'yoga-studio': 'yoga-studio',
      'yoga_studio': 'yoga-studio',
      'yogaStudio': 'yoga-studio',
      'scout': 'scout',
      'scouter': 'scout',
     
    };

    // Normalize role key (lowercase, trim)
    const normalizedRole = (role || '').toString().trim().toLowerCase();
    let targetSegment = roleToRoute[normalizedRole];
    console.log('Rote',targetSegment);
    
    // If not found, try to infer from user.roles array (if you have multi-roles)
    if (!targetSegment && Array.isArray(currentUser.roles)) {
      for (const r of currentUser.roles) {
        const key = (r || '').toString().trim().toLowerCase();
        if (roleToRoute[key]) {
          targetSegment = roleToRoute[key];
          break;
        }
      }
    }

    // fallback default
    if (!targetSegment) targetSegment = 'property-owner';

    // Navigate to protected area. Adjust '/protected' if your parent route differs
    await this.router.navigate(['/landing', targetSegment]);

      this.closePopup();
    } catch (error: any) {
      this.isLoadingSignIn = false;
      // Provide friendly messages for common scenarios
      this.handleApiError(error, 'Sign-in failed. Please try again.');
      // If user not confirmed, optionally prompt to resend confirmation (example)
      if (
        (error?.code === 'UserNotConfirmedException' ||
          error?.name === 'UserNotConfirmedException') &&
        this.signinForm.value.username
      ) {
        this.infoMessage =
          'Your account is not confirmed. Check your email or request a new confirmation code.';
        // Optional: you could expose a "Resend confirmation" button here that calls cognitoService.resendConfirmation
      }

    } finally {
      this.cdr.detectChanges()
      this.isLoadingSignIn = false;
      
    }
  }

  // 🧩 Step 1: Request password reset code
  // Updated onForgotPasswordRequest (send reset code)
  async onForgotPasswordRequest(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.isAnyLoading()) return;

    this.forgotPasswordForm.markAllAsTouched();
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const { username } = this.forgotPasswordForm.value;

    this.isLoadingForgot = true;
    try {
      const res = await this.cognitoService.forgotPassword(username);
      console.log('Reset code sent:', res);
      this.infoMessage = 'A verification code has been sent to your email.';
      this.codeSent = true;
      this.resetPasswordForm.patchValue({ username });
    } catch (err: any) {
       this.isLoadingForgot = false;
      // Specific handling for user not found vs other errors
      if (err?.code === 'UserNotFoundException' || err?.name === 'UserNotFoundException') {
        // For security, some apps show a generic message; but you asked to explicitly handle non-existing accounts
        this.errorMessage = 'No account exists with this email address. Would you like to sign up?';
        // Optionally provide an action/link to go to signup flow
      } else {
        this.handleApiError(err, 'Failed to send reset code. Please try again.');
      }
    } finally {
      this.cdr.detectChanges();
      this.isLoadingForgot = false;
    }
  }

  // 🧩 Step 2: Confirm new password with code
  // Updated onConfirmNewPassword (confirm code + set new password)
  async onConfirmNewPassword(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.isAnyLoading()) return;

    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    const { username, code, newPassword } = this.resetPasswordForm.value;

    this.isLoadingConfirm = true;
    try {
      const res = await this.cognitoService.confirmForgotPassword(username, code, newPassword);
      console.log('Password reset success:', res);
      this.infoMessage = 'Your password has been reset successfully. You can now sign in.';
      // reset state to show sign-in form
      this.codeSent = false;
      this.forgotPasswordMode = false;
      this.resetPasswordForm.reset();
    } catch (err: any) {
      this.isLoadingConfirm = true;
      // Map code errors specifically
      if (err?.code === 'CodeMismatchException' || err?.name === 'CodeMismatchException') {
        this.errorMessage = 'The code you entered is incorrect. Please verify and try again.';
      } else if (err?.code === 'ExpiredCodeException' || err?.name === 'ExpiredCodeException') {
        this.errorMessage = 'This code has expired. Request a new code and try again.';
      } else if (err?.code === 'UserNotFoundException' || err?.name === 'UserNotFoundException') {
        // Unlikely here because code was sent earlier, but handle gracefully
        this.errorMessage = 'No account found for this email. Please sign up.';
      } else {
        this.handleApiError(err, 'Failed to reset password. Please try again.');
      }
    } finally {
      this.cdr.detectChanges();
      this.isLoadingConfirm = false;
    }
  }

  toggleForgotPassword(): void {
    // Block toggle while any action is running or if toggling is disabled temporarily
    if (this.isAnyLoading() || this.toggleDisabled) return;

    // Prevent super-fast toggles: disable for a short time to avoid race between clicks
    this.toggleDisabled = true;
    setTimeout(() => (this.toggleDisabled = false), 350);

    // Toggle deterministic behavior:
    if (!this.forgotPasswordMode) {
      // switching to forgot password request mode
      this.forgotPasswordMode = true;
      this.codeSent = false;
      this.errorMessage = '';
      this.infoMessage = '';
      // clear and focus: ensure forgot form is fresh
      this.forgotPasswordForm.reset();
      this.resetPasswordForm.reset();
      this.cdr.detectChanges();
    } else {
      // currently inside forgot flow: clicking Back -> go to sign-in and clear states
      this.forgotPasswordMode = false;
      this.codeSent = false;
      this.errorMessage = '';
      this.infoMessage = '';
      // reset forms
      this.forgotPasswordForm.reset();
      this.resetPasswordForm.reset();
      this.cdr.detectChanges();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // add this helper inside the component class
  private handleApiError(err: any, fallback = 'Something went wrong. Please try again.'): void {
    console.error('API error:', err);

    // AWS Cognito style errors may come with .code or .name or message strings
    const code = err?.code || err?.name || '';
    const message = err?.message || String(err) || '';

    // Default
    this.errorMessage = fallback;

    // Map common Cognito errors to friendly messages
    switch (code) {
      case 'UserNotFoundException':
      case 'UserNotFound':
        this.errorMessage = 'No account found for this email/username. Would you like to sign up?';
        break;

      case 'NotAuthorizedException':{
        if (message.toLowerCase().includes('incorrect')) {
          this.errorMessage = 'Incorrect username or password.';
        } else if (
          message.toLowerCase().includes('disabled') ||
          message.toLowerCase().includes('user is disabled')
        ) {
          this.errorMessage = 'This account is disabled. Please contact support.';
        } else {
          this.errorMessage = 'Authentication failed. Please check your credentials.';
        }
        break;}
      case 'NotAuthorized':{
        // wrong password or disabled user
        // Some libs return message like "Incorrect username or password."
        if (message.toLowerCase().includes('incorrect')) {
          this.errorMessage = 'Incorrect username or password.';
        } else if (
          message.toLowerCase().includes('disabled') ||
          message.toLowerCase().includes('user is disabled')
        ) {
          this.errorMessage = 'This account is disabled. Please contact support.';
        } else {
          this.errorMessage = 'Authentication failed. Please check your credentials.';
        }
        break;}

      case 'UserNotConfirmedException':
      case 'UserNotConfirmed':{
        this.errorMessage =
          'Your account is not confirmed. Please check your email for a confirmation link. ' +
          'You can request a new confirmation code from the registration flow.';
        break;}

      case 'CodeMismatchException':
        this.errorMessage = 'Invalid verification code. Please check the code and try again.';
        break;

      case 'ExpiredCodeException':
        this.errorMessage = 'The verification code has expired. Request a new code and try again.';
        break;

      case 'LimitExceededException':
      case 'TooManyRequestsException':
        this.errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        break;

      case 'NetworkError':
      case 'TimeoutError':
        this.errorMessage = 'Network error. Please check your connection and try again.';
        break;

      default:
        // Try to surface helpful server message if available
        if (message) {
          // Some messages from backend are descriptive — use them but avoid leaking raw errors
          this.errorMessage = message;
        } else {
          this.errorMessage = fallback;
        }
    }
  }
}
