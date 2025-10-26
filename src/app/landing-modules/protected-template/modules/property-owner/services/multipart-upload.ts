import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenManagerService } from '../../../../../services/token-manager';

@Injectable({ providedIn: 'root' })
export class MultipartUpload {
  private API_BASE = 'https://civ0w2cemc.execute-api.eu-north-1.amazonaws.com/dev';
  private ID_TOKEN =
    'eyJraWQiOiIzc0ZaelB1RTREVFV4QTlZYkFhK0pYYXo2THdZTXdHYm9IMHVtckFwT0JvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5MGJjMzliYy1hMGUxLTcwNGQtYzgyOS1hNDU4ZWIyMjgzNDAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbVwvZXUtbm9ydGgtMV9kZFhQaDZQV2MiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiOTBiYzM5YmMtYTBlMS03MDRkLWM4MjktYTQ1OGViMjI4MzQwIiwiY3VzdG9tOnNlY29uZF9uYW1lIjoiQmFidSIsIm9yaWdpbl9qdGkiOiI2ZGQ1NGFjYi1mOGI2LTQwZmQtYTkxYi0xODQ0NGM2YmFiMmMiLCJhdWQiOiI0YW1odHNrcTFkODF2OTM2Z3I1cXUyMTAyZCIsImV2ZW50X2lkIjoiYTRiYmYwOTQtNTI0OS00MWNmLTlmOGEtY2M0YTg5NmFjZjU0IiwiY3VzdG9tOmZpcnN0X25hbWUiOiJBcmNoYW5hIFAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc2MDg2NTM5OSwicGhvbmVfbnVtYmVyIjoiKzkxNzAyNTkxMTk3MiIsImV4cCI6MTc2MDg2ODk5OSwiY3VzdG9tOnJvbGUiOiJwcm9wZXJ0eS1vd25lciIsImlhdCI6MTc2MDg2NTM5OSwianRpIjoiMGU1ODVkNmItYjE4OS00YjYxLWI0NGUtZTQxY2Q0ZDk3ZjM0IiwiZW1haWwiOiJhcmNoYW5hcGJhYnUxMUBnbWFpbC5jb20ifQ.sex6tQVL_33XIIq-cXvdi1W1cyN4GZsNae4g9N7bJhdaApRXevO17SuI2oiDVGzeY0Og3kSNimvAyCL7njIM2cYEUu-m-o68fGwtcbube8lU5_IzHTTRqVR8OHV8MSrLl4xsMCK2GoKCAgv0evFYKu9YZngJws777GogEqqRao2wwDNiHrTIR-25CB7kF2403bW260Ie5bwjMVnXY8QNgQUlGBoujubM0flAXrdCdzWhxCUc4NoP8VRCb_wCZmK8JdwVZaVEJhrkb2fGLZJVcKpRag30OuCDKyiXn2VbppTDJQkLx5Uw7oCO8BFzebP3lbXCJ1hNQhsUEclqcgux0Q'; // keep safe
  private PART_SIZE = 15 * 1024 * 1024; // 15 MB
  private CONCURRENCY = 3;

  constructor(private http: HttpClient,private tokenManager: TokenManagerService) {}

  uploadFile(file: File): Promise<any> {
    const token = this.tokenManager.getIdToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json','Authorization': `Bearer ${token}` });
    const payload = {
      files: [{ filename: file.name, fileSize: file.size, contentType: file.type }],
    };

    console.log('INITIATE PAYLOAD:', payload);

    // ✅ Step 1: Initiate multipart upload
    return firstValueFrom(
      this.http.post(`${this.API_BASE}/multipart/initiate`, payload, {
        headers: headers
      })
      ).then((initiateResp: any) => {
        console.log('Response', initiateResp.uploads[0]);

        const uploads: any = initiateResp.uploads[0];
        uploads['partSize'] = this.PART_SIZE;
        uploads['fileSize'] = file.size;

        const presignPayload = { uploads: [uploads] };

        // ✅ Step 2: Get presigned URLs for parts
        return firstValueFrom(
          this.http.post(`${this.API_BASE}/multipart/presign_parts`, presignPayload, {
            headers: headers,
          })
        ).then((presignResp: any) => {
          console.log('Presigned parts:', presignResp);

          const parts = presignResp.uploads[0].parts;
          const partBlobs = parts.map((p: any, i: number) => {
            const start = i * this.PART_SIZE;
            const end = Math.min(start + this.PART_SIZE, file.size);
            return { ...p, blob: file.slice(start, end) };
          });

          const etags: { PartNumber: number; ETag: string }[] = [];

          // ✅ Step 3: Upload each part concurrently using part.blob
          return this.promisePool(partBlobs, this.CONCURRENCY, (part: any) => {
            return fetch(part.url, { method: 'PUT', body: part.blob })
              .then(async (res) => {
                if (!res.ok) {
                  const txt = await res.text().catch(() => '');
                  throw new Error(`Upload part ${part.partNumber} failed: ${res.status} ${txt}`);
                }

                const etag = (res.headers.get('etag') || res.headers.get('ETag') || '').replace(
                  /"/g,
                  ''
                );
                if (!etag) throw new Error('No ETag returned for part ' + part.partNumber);

                etags.push({ PartNumber: part.partNumber, ETag: etag });
                console.log(`✅ Uploaded part ${part.partNumber}, ETag ${etag}`);
              })
              .catch((err) => {
                console.error(`❌ Failed to upload part ${part.partNumber}:`, err);
                throw err;
              });
          }).then(() => {
            // Sort ETags
            etags.sort((a, b) => a.PartNumber - b.PartNumber);

            // ✅ Step 4: Complete multipart upload
            const completePayload = {
              uploads: [{ key: uploads.key, uploadId: uploads.uploadId, parts: etags }],
            };

            console.log('Completing upload with payload:', completePayload);

            return firstValueFrom(
              this.http.post(`${this.API_BASE}/multipart/complete`, completePayload, {
                headers: headers,
              })
            );
          });
        });
      })
      .then((completeResp: any) => {
        console.log('✅ Upload complete:', completeResp);
        return completeResp;
      })
      .catch((err) => {
        console.error('❌ Upload failed:', err);
        throw err;
      });
  }

  // 🔁 Concurrency helper
  private promisePool<T>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<void>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let i = 0,
        active = 0;
      const next = () => {
        if (i >= items.length && active === 0) return resolve();
        while (active < concurrency && i < items.length) {
          const item = items[i++];
          active++;
          Promise.resolve(worker(item))
            .then(() => {
              active--;
              next();
            })
            .catch(reject);
        }
      };
      next();
    });
  }


  private readonly _selectedItem = signal<any | null>(null);

  // ✅ Getter for readonly access in components
  get selectedItem() {
    return this._selectedItem;
  }

  // ✅ Method to update the selected item
  setSelectedItem(item: any): void {
    this._selectedItem.set(item);
  }

  // ✅ Optional helper: get the latest value directly (e.g. in services)
  getSelectedItemValue(): any | null {
    return this._selectedItem();
  }

  // ✅ Optional helper: clear the selection
  clearSelectedItem(): void {
    this._selectedItem.set(null);
  }
}
