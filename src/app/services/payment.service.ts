import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CreateOrderReq {
  userId: string;
  amountPaise: number; // amount in paise (Razorpay uses smallest currency unit)
  currency?: string;
  receipt?: string;
  metadata?: any;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  // Call your backend to create a Razorpay order (server uses Razorpay secret)
  createOrder(req: CreateOrderReq): Observable<any> {
    return this.http.post('/api/payments/create-order', req);
  }

  // After successful checkout, send payment details to backend to verify and store invoice
  verifyPayment(payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    userId: string;
    role?: string;
    amountPaise?: number;
  }) {
    return this.http.post('/api/payments/verify-payment', payload);
  }
}
