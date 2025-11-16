import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cognito } from '../../../services/cognito.service';
import { NotificationService } from '../../../services/notification-service';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../../services/payment.service';
import { environment } from '../../../../environments/environment';
declare const Razorpay: any; 
@Component({
  selector: 'app-confirm-code-popup',
  standalone: false,
  templateUrl: './confirm-code-popup.html',
  styleUrls: ['./confirm-code-popup.scss']
})
export class ConfirmCodePopup implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() data: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any>();

  confirmForm!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private fb: FormBuilder, private cognitoService: Cognito,
       private notify: NotificationService,
           private paymentService: PaymentService,) {}
  razorpayLoaded = false;

  // Put your frontend/public key in environment and/or pass from backend to avoid hardcoding. Example uses window var.
  RAZORPAY_KEY_ID = environment.razorpayKeyId || 'rzp_test_xxx';
  ngOnInit(): void {
    this.confirmForm = this.fb.group({
      username: ['', Validators.required],
      code: ['', [Validators.required, Validators.minLength(4)]],
    });
    if (this.data && this.data.email) {
      this.confirmForm.patchValue({
        username: this.data.email
      });
    }
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
     
        //this.notify.showSuccess('Signup Successfull', 'Signin with your credentials');
       
      //  let createOrderReq = {
      //   userId: username,
      //   amountPaise: 0 // amount in paise (Razorpay uses smallest currency unit)
      //  };
      //   const orderResp: any = await firstValueFrom(this.paymentService.createOrder(createOrderReq));
      //   console.log('Order created:', orderResp);
      //   await this.loadRazorpayScript();
        
      //         const options: any = {
      //           key: this.RAZORPAY_KEY_ID,
      //           amount: orderResp.amount, // paise
      //           currency: orderResp.currency || 'INR',
      //           name: 'Your App / Company Name',
      //           description: 'Registration fee',
      //           order_id: orderResp.orderId,
      //           prefill: {
      //             name: `${ 'Archana'} ${'P'}`.trim(),
      //             email: `archanapbabu11@gmail.com`,
      //             contact: `+917025911972`
      //           },
      //           notes: {
      //             userId:  '',
      //             role:  ''
      //           },
      //           theme: {
      //             color: '#F2D479'
      //           },
      //           handler: async (response: any) => {
      //             // Successful payment — verify with backend
      //             try {
      //               this.loading = true;
      //               const verifyPayload :any= {
      //                 razorpay_payment_id: response.razorpay_payment_id,
      //                 razorpay_order_id: response.razorpay_order_id,
      //                 razorpay_signature: response.razorpay_signature,
      //                 userId:'id2',
      //                 role:'property-owner',
      //                 amount: 2
      //               };
      //               const verifyResp: any = await firstValueFrom(this.paymentService.verifyPayment(verifyPayload));
      //               console.log('Payment verified (backend):', verifyResp);
        
      //               if (verifyResp?.valid) {
      //                 // optionally call your backend to mark user as paid/active
      //                 try {
      //                  // await firstValueFrom(this.http.post('/api/users/post-signup', { userId, role, paid: true }));
      //                 } catch (postSignupErr) {
      //                   console.warn('post-signup backend call failed', postSignupErr);
      //                 }
      //                 this.notify?.showInfo('Success !','Payment successful — registration complete');
      //                 this.closePopup();
      //               } else {
      //                 this.errorMessage = 'Payment verification failed. Please contact support.';
      //               }
      //             } catch (verifyErr: any) {
      //               console.error('Payment verification failed:', verifyErr);
      //               this.errorMessage = 'Payment succeeded but verification failed. Contact support.';
      //             } finally {
      //               this.loading = false;
      //             }
      //           },
      //           modal: {
      //             ondismiss: () => {
      //               console.log('Razorpay modal dismissed');
      //             }
      //           }
      //         };
        
      //         const rzp = new Razorpay(options);
        
      //         rzp.on('payment.failed', (response: any) => {
      //           console.error('Payment failed:', response);
      //           this.errorMessage = response?.error?.description || 'Payment failed. Try again.';
      //           this.notify?.showInfo('Success !','Payment failed. Please retry.');
      //         });
        
      //         rzp.open();
            



      } 
      catch (error: any) {
        console.error('Confirmation failed:', error);
        this.errorMessage = error.message || 'Confirmation failed. Please try again.';
      }
    } 
  }



  
// loadRazorpayScript(): Promise<void> {
//   if (this.razorpayLoaded) return Promise.resolve();

//   return new Promise((resolve, reject) => {
//     // avoid adding script twice
//     const existing = document.getElementById('razorpay-checkout-js');
//     if (existing) {
//       this.razorpayLoaded = true;
//       resolve();
//       return;
//     }

//     const script = document.createElement('script');
//     script.id = 'razorpay-checkout-js';
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => {
//       this.razorpayLoaded = true;
//       resolve();
//     };
//     script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
//     document.body.appendChild(script);
//   });
// }
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
