import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { TokenManagerService } from '../../../services/token-manager';

@Component({
  selector: 'app-signin-popup',
  standalone: false,
  templateUrl: './signin-popup.html',
  styleUrls: ['./signin-popup.scss']
})
export class SigninPopup implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<any>();
  @Output() signin = new EventEmitter<any>();

  signinForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private cognitoService: Cognito, private tokenManager: TokenManagerService) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  get f() {
    return this.signinForm.controls;
  }

  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
    this.signinForm.reset();
    this.errorMessage = '';
    Object.keys(this.signinForm.controls).forEach(key => {
      this.signinForm.controls[key].setErrors(null);
    });
  }

  async onSubmit(): Promise<void> {
  this.errorMessage = '';
  this.signinForm.markAllAsTouched();

  if (this.signinForm.valid) {
    const { username, password } = this.signinForm.value;

    try {
      let result:any = {};
      result = await this.cognitoService.signIn(username, password);
     
      console.log('Signed in successfully:', result);

      // ✅ Store tokens immediately
      if (result?.AuthenticationResult) {
        this.tokenManager.storeTokens(result.AuthenticationResult);
      }

      // (optional) decode for debugging
      // console.log(this.tokenManager.decodeIdToken());

      this.signin.emit(result);
      this.closePopup();

    } catch (error: any) {
      console.error('Sign-in failed:', error);
      this.errorMessage = error.message || 'Sign-in failed. Please try again.';
    }
  } else {
    const invalidFields: string[] = [];
    if (this.f['username'].invalid) invalidFields.push('Username');
    if (this.f['password'].invalid) invalidFields.push('Password');
    this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
  }
}

}
