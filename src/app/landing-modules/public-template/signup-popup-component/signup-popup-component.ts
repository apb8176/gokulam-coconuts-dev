import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';



@Component({
  selector: 'app-signup-popup',
  standalone : false,
  templateUrl: './signup-popup-component.html',
  styleUrls: ['./signup-popup-component.scss'] // You might not need this if using only Tailwind
})
export class SignupPopupComponent implements OnInit {
  @Input() isVisible: boolean = false; // Controls visibility of the popup
  @Output() close = new EventEmitter<void>(); // Emits when the popup should be closed
  @Output() signup = new EventEmitter<any>(); // Emits form data on successful signup

  signupForm!: FormGroup;
  roles :any = [
  { key: 'property-owner', value: 'Property Owner' },
  { key: 'business-owner', value: 'Business Owner' },
  { key: 'yoga-studio-owner', value: 'Yoga Studio Owner' },
  { key: 'community-member', value: 'Community Member' },
  { key: 'scouter', value: 'Scouter' }
];

//  roles: string[] = ['Admin', 'Editor', 'Viewer']; // Example roles
  errorMessage: string = '';

  constructor(private fb: FormBuilder,private cognitoService: Cognito) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      // Username field removed
      firstName: ['', Validators.minLength(2)],
      lastName: ['', Validators.minLength(2)],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?\d{10,15}$/)]], // Optional: International phone number pattern
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)]],
      role: ['', Validators.required]
    });
  }

  // Helper to get form controls for easier template access
  get f() { return this.signupForm.controls; }

  // Method to close the popup
  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
    this.signupForm.reset(); // Reset form when closing
    this.errorMessage = ''; // Clear error message
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.controls[key].setErrors(null) // Clear validation errors
    });
  }

async confirmSignup() {
  try {
  //  const result = await this.cognitoService.confirmUser(this.email, this.verificationCode);
 //   console.log('User confirmed:', result);
  } catch (error) {
    console.error('Confirmation failed:', error);
  }
}

async onSubmit(): Promise<void> {
  this.errorMessage = '';
  this.signupForm.markAllAsTouched();

  if (this.signupForm.valid) {
    try {
      const result = await this.cognitoService.signUpUser(this.signupForm.value);
      console.log('Cognito signup success:', result);
      this.signup.emit(result);
      this.closePopup();
    } catch (error: any) {
      console.error('Cognito signup error:', error);
      this.errorMessage = error.message || 'Signup failed. Please try again.';
    }
  } else {
    const invalidFields: string[] = [];
    if (this.f['email'].invalid) invalidFields.push('Email');
    if (this.f['password'].invalid) invalidFields.push('Password');
    if (this.f['role'].invalid) invalidFields.push('Role');
    this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
  }
}
  // Method to handle form submission

}