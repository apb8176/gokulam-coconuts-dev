import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoApi {
  
  private apiUrl = 'https://civ0w2cemc.execute-api.eu-north-1.amazonaws.com/dev/';
  private accessToken = "eyJraWQiOiJEemdUb2JFSlI2cHRrdXNmWGlcL0xaTDdXd0J6TE01WWJhcVhISm56VVlKOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI5MGJjMzliYy1hMGUxLTcwNGQtYzgyOS1hNDU4ZWIyMjgzNDAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtbm9ydGgtMS5hbWF6b25hd3MuY29tXC9ldS1ub3J0aC0xX2RkWFBoNlBXYyIsImNsaWVudF9pZCI6IjRhbWh0c2txMWQ4MXY5MzZncjVxdTIxMDJkIiwib3JpZ2luX2p0aSI6IjU5YzFhY2I4LTJhMTAtNDJiNS1hZGRhLWJjMzI4YWE1OWYxOSIsImV2ZW50X2lkIjoiNWM2Mjg2YjUtNWFhNi00YjIxLTk2NjctZDMzY2Q3OTUxMGRiIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc2MDY0MjQ1MSwiZXhwIjoxNzYwNjQ2MDUxLCJpYXQiOjE3NjA2NDI0NTEsImp0aSI6IjRjY2ZkYTUyLWYwOWItNGYzNS04OGU3LWM2MGIyZmZjMDIyYyIsInVzZXJuYW1lIjoiOTBiYzM5YmMtYTBlMS03MDRkLWM4MjktYTQ1OGViMjI4MzQwIn0.UroVECbQnA5U7TOL57SahOYFuew2SQQJrNOGmT6cvvhHx0FpyL9G8XgNjEeGxz58tRgtGaTXT9luNX-6SqB0kRuv9faSVDVHDH0iEYSw0a3hRsJcG6VP_ksueAqLh6tMVFNgbIGI4-nb6P5ZNiTavTJKVhpXlYBQFNRe2ZfVzNdT40VvO0RrE3SRp_-mwdTNenAGVjpZ0MFN3iG5qqSHDQydIBd1b1ri53jCaAuGd6Tu4CAnk3aoY9HfdJmKAvG31_RGfpU8mzZ_Wv2oD6dKooNMYAZcbjUmGv_SDMcmKEPJlKc_rCLSkK-mcZL4tyaremFHtr5Iujv00sdeHEU4Rg"
  constructor(private http: HttpClient) {}

  postPropertyDetails(propertyData: any): Observable<any> {
    let url = this.apiUrl + 'post_property_details';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    });
    
    return this.http.post(url, propertyData, { headers });
  }
   getPropertyList(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    });
    let url = this.apiUrl + 'getPropertyDetails';
    return this.http.get(url, { headers });
  }


}
