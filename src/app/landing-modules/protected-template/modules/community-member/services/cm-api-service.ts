import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenManagerService } from '../../../../../services/token-manager';

@Injectable({
  providedIn: 'root'
})
export class CmApiService {
    private apiUrl = 'https://civ0w2cemc.execute-api.eu-north-1.amazonaws.com/dev/';
  //private accessToken ='eyJraWQiOiIzc0ZaelB1RTREVFV4QTlZYkFhK0pYYXo2THdZTXdHYm9IMHVtckFwT0JvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5MGJjMzliYy1hMGUxLTcwNGQtYzgyOS1hNDU4ZWIyMjgzNDAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbVwvZXUtbm9ydGgtMV9kZFhQaDZQV2MiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiOTBiYzM5YmMtYTBlMS03MDRkLWM4MjktYTQ1OGViMjI4MzQwIiwiY3VzdG9tOnNlY29uZF9uYW1lIjoiQmFidSIsIm9yaWdpbl9qdGkiOiI2ZGQ1NGFjYi1mOGI2LTQwZmQtYTkxYi0xODQ0NGM2YmFiMmMiLCJhdWQiOiI0YW1odHNrcTFkODF2OTM2Z3I1cXUyMTAyZCIsImV2ZW50X2lkIjoiYTRiYmYwOTQtNTI0OS00MWNmLTlmOGEtY2M0YTg5NmFjZjU0IiwiY3VzdG9tOmZpcnN0X25hbWUiOiJBcmNoYW5hIFAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc2MDg2NTM5OSwicGhvbmVfbnVtYmVyIjoiKzkxNzAyNTkxMTk3MiIsImV4cCI6MTc2MDg2ODk5OSwiY3VzdG9tOnJvbGUiOiJwcm9wZXJ0eS1vd25lciIsImlhdCI6MTc2MDg2NTM5OSwianRpIjoiMGU1ODVkNmItYjE4OS00YjYxLWI0NGUtZTQxY2Q0ZDk3ZjM0IiwiZW1haWwiOiJhcmNoYW5hcGJhYnUxMUBnbWFpbC5jb20ifQ.sex6tQVL_33XIIq-cXvdi1W1cyN4GZsNae4g9N7bJhdaApRXevO17SuI2oiDVGzeY0Og3kSNimvAyCL7njIM2cYEUu-m-o68fGwtcbube8lU5_IzHTTRqVR8OHV8MSrLl4xsMCK2GoKCAgv0evFYKu9YZngJws777GogEqqRao2wwDNiHrTIR-25CB7kF2403bW260Ie5bwjMVnXY8QNgQUlGBoujubM0flAXrdCdzWhxCUc4NoP8VRCb_wCZmK8JdwVZaVEJhrkb2fGLZJVcKpRag30OuCDKyiXn2VbppTDJQkLx5Uw7oCO8BFzebP3lbXCJ1hNQhsUEclqcgux0Q'
  constructor(private http: HttpClient, private tokenManager : TokenManagerService) {}

     getProfile(): Observable<any> {
     const token = this.tokenManager.getIdToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json',Authorization: `Bearer ${token}` });
  
   
    let url = this.apiUrl + 'profile';
    return this.http.get(url, { headers });
  }

  putClassifieds(data: any): Observable<any> {


    const token = this.tokenManager.getIdToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json',Authorization: `Bearer ${token}` });
    let url = this.apiUrl + 'community-member/post';
    
    
    return this.http.put(url, data, { headers });
  }

   postClassifieds(data: any): Observable<any> {


    const token = this.tokenManager.getIdToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json',Authorization: `Bearer ${token}` });
    let url = this.apiUrl + 'community-member/post';
    
    
    return this.http.post(url, data, { headers });
  }

}
