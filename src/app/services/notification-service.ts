import { Injectable } from '@angular/core';
import { MatDialog, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Component } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private dialog?: MatDialog) {}

  showInfo(title: string, message: string) {
    if (this.dialog) {
      this.dialog.open(SimpleDialogComponent, {
        data: { title, message },
        width: '420px'
      });
    } else {
      alert(`${title}\n\n${message}`);
    }
  }
}

/** Simple inline dialog component used only if MatDialog is available */
@Component({
  selector: 'app-simple-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>
      <p>{{data.message}}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>OK</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogContent, MatDialogActions],
})
export class SimpleDialogComponent {
  data:any
  constructor() {}
}
