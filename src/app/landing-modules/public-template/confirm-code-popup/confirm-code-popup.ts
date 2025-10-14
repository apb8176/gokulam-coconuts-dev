import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';

@Component({
  selector: 'app-confirm-code-popup',
  standalone: false,
  templateUrl: './confirm-code-popup.html',
  styleUrls: ['./confirm-code-popup.scss']
})
export class ConfirmCodePopup implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any>();

  confirmForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private cognitoService: Cognito) {}

  ngOnInit(): void {
    this.confirmForm = this.fb.group({
      username: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  get f() {
    return this.confirmForm.controls;
  }

  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
    this.confirmForm.reset();
    this.errorMessage = '';
    Object.keys(this.confirmForm.controls).forEach(key => {
      this.confirmForm.controls[key].setErrors(null);
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.confirmForm.markAllAsTouched();

    if (this.confirmForm.valid) {
      const { username, code } = this.confirmForm.value;
      try {
        const result = await this.cognitoService.confirmUser(username, code);
        console.log('Account confirmed:', result);
        this.confirm.emit(result);
        this.closePopup();
      } catch (error: any) {
        console.error('Confirmation failed:', error);
        this.errorMessage = error.message || 'Confirmation failed. Please try again.';
      }
    } else {
      const invalidFields: string[] = [];
      if (this.f['username'].invalid) invalidFields.push('Username');
      if (this.f['code'].invalid) invalidFields.push('Code');
      this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
    }
  }

  async resendCode(): Promise<void> {
    const username = this.confirmForm.get('username')?.value;
    if (!username) {
      this.errorMessage = 'Please enter your username to resend code.';
      return;
    }

    try {
      await this.cognitoService.resendConfirmation(username);
      console.log('Verification code resent.');
    } catch (error: any) {
      console.error('Resend failed:', error);
      this.errorMessage = error.message || 'Failed to resend code.';
    }
  }
}
