import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { PaymentService } from '../../../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification-service';
import { firstValueFrom } from 'rxjs';

declare const Razorpay: any; // loader will put this on window

@Component({
  selector: 'app-signup-popup',
  standalone: false,
  templateUrl: './signup-popup-component.html',
  styleUrls: ['./signup-popup-component.scss']
})
export class SignupPopupComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() signup = new EventEmitter<any>();

  signupForm!: FormGroup;
  roles: any = [
    { key: 'property-owner', value: 'Property Owner' },
    { key: 'business-owner', value: 'Business Owner' },
    { key: 'yoga-studio', value: 'Yoga Studio Owner' },
    { key: 'community-member', value: 'Community Member' },
    { key: 'scouter', value: 'Scouter' }
  ];

  errorMessage: string = '';
  loading: boolean = false; // disables submit during processing
  razorpayLoaded = false;

  // Put your frontend/public key in environment and/or pass from backend to avoid hardcoding. Example uses window var.
  RAZORPAY_KEY_ID = (window as any)['RAZORPAY_KEY_ID'] || 'rzp_test_xxx';

  constructor(
    private fb: FormBuilder,
    private cognitoService: Cognito,
    private paymentService: PaymentService,
    private http: HttpClient,
     private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.minLength(2)],
      lastName: ['', Validators.minLength(2)],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?\d{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)]],
      role: ['', Validators.required]
    });
  }

  get f() { return this.signupForm.controls; }

  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
    this.signupForm.reset();
    this.errorMessage = '';
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.controls[key].setErrors(null);
    });
  }

  private amountForRole(role: string): number /* paise */ {
    // Return amount in paise. ₹1 = 100 paise
    const paidRoles = ['property-owner', 'business-owner', 'yoga-studio'];
    if (paidRoles.includes(role)) return 100; // ₹1 -> 100 paise
    return 0; // free for others
  }


// --- updated onSubmit (replace your existing onSubmit) ---
async onSubmit(): Promise<void> {
  this.errorMessage = '';
  this.signupForm.markAllAsTouched();
  if (!this.signupForm.valid) {
    const invalidFields: string[] = [];
    if (this.f['email'].invalid) invalidFields.push('Email');
    if (this.f['password'].invalid) invalidFields.push('Password');
    if (this.f['role'].invalid) invalidFields.push('Role');
    this.errorMessage = `Please provide valid: ${invalidFields.join(', ')}.`;
    return;
  }

  const formValue = { ...this.signupForm.value };
  this.loading = true;

  try {
    // normalize phone
    if (formValue.phoneNumber) {
      formValue.phoneNumber = formValue.phoneNumber.startsWith('+')
        ? formValue.phoneNumber
        : `+91${formValue.phoneNumber}`;
    }

    // 1) Sign up user with Cognito (expects Observable)
   const signupResult: any = await this.cognitoService.signUpUser(formValue);
    console.log('Cognito signup success:', signupResult);

    // emit for parent components
    this.signup.emit({input:formValue,result:signupResult});

    // determine amount for role (paise)
    const role: string = this.signupForm.value.role;
    const amountPaise = this.amountForRole(role);

    const userId = this.extractUserIdFromCognitoResponse(signupResult);

    if (amountPaise > 0) {
      // 2) Create order via PaymentService (backend)
      // const createOrderReq :any= {
      //   userId,
      //   amount: amountPaise,
      //   currency: 'INR',
      //   receipt: `signup_${Date.now()}`,
      //   metadata: { role }
      // };

      // const orderResp: any = await firstValueFrom(this.paymentService.createOrder(createOrderReq));
      // console.log('Order created:', orderResp);

      // // 3) load SDK and open checkout
      // await this.loadRazorpayScript();

      // const options: any = {
      //   key: this.RAZORPAY_KEY_ID,
      //   amount: orderResp.amount, // paise
      //   currency: orderResp.currency || 'INR',
      //   name: 'Your App / Company Name',
      //   description: 'Registration fee',
      //   order_id: orderResp.orderId,
      //   prefill: {
      //     name: `${this.signupForm.value.firstName || ''} ${this.signupForm.value.lastName || ''}`.trim(),
      //     email: this.signupForm.value.email,
      //     contact: this.signupForm.value.phoneNumber || ''
      //   },
      //   notes: {
      //     userId: userId || '',
      //     role
      //   },
      //   theme: {
      //     color: '#F2D479'
      //   },
      //   handler: async (response: any) => {
      //     // Successful payment — verify with backend
      //     try {
      //       this.loading = true;
      //       const verifyPayload :any= {
      //         razorpay_payment_id: response.razorpay_payment_id,
      //         razorpay_order_id: response.razorpay_order_id,
      //         razorpay_signature: response.razorpay_signature,
      //         userId,
      //         role,
      //         amount: amountPaise
      //       };
      //       const verifyResp: any = await firstValueFrom(this.paymentService.verifyPayment(verifyPayload));
      //       console.log('Payment verified (backend):', verifyResp);

      //       if (verifyResp?.valid) {
      //         // optionally call your backend to mark user as paid/active
      //         try {
      //           await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: true }));
      //         } catch (postSignupErr) {
      //           console.warn('post-signup backend call failed', postSignupErr);
      //         }
      //         this.notify?.showInfo('Success !','Payment successful — registration complete');
      //         this.closePopup();
      //       } else {
      //         this.errorMessage = 'Payment verification failed. Please contact support.';
      //       }
      //     } catch (verifyErr: any) {
      //       console.error('Payment verification failed:', verifyErr);
      //       this.errorMessage = 'Payment succeeded but verification failed. Contact support.';
      //     } finally {
      //       this.loading = false;
      //     }
      //   },
      //   modal: {
      //     ondismiss: () => {
      //       console.log('Razorpay modal dismissed');
      //     }
      //   }
      // };

      // const rzp = new Razorpay(options);

      // rzp.on('payment.failed', (response: any) => {
      //   console.error('Payment failed:', response);
      //   this.errorMessage = response?.error?.description || 'Payment failed. Try again.';
      //   this.notify?.showInfo('Success !','Payment failed. Please retry.');
      // });

      // rzp.open();
    } else {
      // Free registration: notify backend if needed
      try {
        await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: false }));
      } catch (e) {
        console.warn('post-signup backend call failed', e);
      }
      this.notify?.showInfo('Success !','Registration successful');
      this.closePopup();
    }
  } catch (error: any) {
    console.error('Signup or payment flow error:', error);
    this.errorMessage = error?.message || 'Signup failed. Please try again.';
  } finally {
    this.loading = false;
  }
}

  private loadRazorpayScript(): Promise<void> {
  if (this.razorpayLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // avoid adding script twice
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      this.razorpayLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      this.razorpayLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

private extractUserIdFromCognitoResponse(signupResult: any): string | null {
  return signupResult?.userSub || signupResult?.Username || signupResult?.user?.sub || null;
}
}
