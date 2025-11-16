import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenManagerService } from '../../../services/token-manager';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  // ISO string. The API is expected to return receivedAt in ISO format.
  receivedAt: string;
  read: boolean;
  // optional extra fields
  metadata?: any;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // TODO: replace with your real API base URL or inject via environment
  private baseUrl = 'https://civ0w2cemc.execute-api.eu-north-1.amazonaws.com/dev/notifications';

  constructor(private http: HttpClient,private tokenManager : TokenManagerService) {
    
  }

  // Get all notifications (API should send them in the desired order)

  getNotifications(): Observable<any> {
    const token = this.tokenManager.getIdToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // ✅ Send businessId as query parameter
    const url = `${this.baseUrl}`;

    return this.http.get(url, { headers });
  }

  // Mark single notification as read
  markAsRead(id: string): Observable<any> {
    // POST /api/notifications/mark-read  { id: "..."}
    // or use PUT/PATCH depending on your API design
    return this.http.post(`${this.baseUrl}/mark-read`, { id });
  }
}
