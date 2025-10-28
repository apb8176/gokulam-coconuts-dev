import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RazorpayService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Payload can include amount, currency, receipt id, notes etc.
  createOrder(payload: { amount: number; currency?: string; receipt?: string; notes?: any }) {
    return firstValueFrom(this.http.post<{ id: string; amount: number; currency: string }>(`${this.base}/create-order`, payload));
  }

  // Optional: server endpoint to verify signature (if you want client to call verify)
  verifyPayment(body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return firstValueFrom(this.http.post<{ valid: boolean }>(`${this.base}/verify`, body));
  }
}
