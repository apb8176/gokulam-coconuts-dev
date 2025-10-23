import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppDialogComponent, AppDialogData } from '../pages/app-dialog-data/app-dialog-data';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private dialog?: MatDialog) {}

  private openDialog(data: AppDialogComponent, config?: Partial<MatDialogConfig>) {
    if (!this.dialog) {
      if (data.isConfirm) {
        return Promise.resolve(window.confirm(`${data.title}\n\n${data.message}`));
      } else {
        window.alert(`${data.title}\n\n${data.message}`);
        return Promise.resolve(true);
      }
    }

    const dialogConfig: MatDialogConfig = {
      maxWidth: '92vw',
      width: '420px',
      panelClass: ['tw-dialog-panel'], // important for tailwind container tweaks
      data,
      ...config,
    };

    const ref = this.dialog.open(AppDialogData, dialogConfig);
    return ref.afterClosed().toPromise();
  }

  async showInfo(title: string, message: string): Promise<void> {
    await this.openDialog({ title, message, variant: 'info', isConfirm: false });
  }

  async showSuccess(title: string, message: string): Promise<void> {
    await this.openDialog({ title, message, variant: 'success', isConfirm: false });
  }

  async showError(title: string, message: string): Promise<void> {
    await this.openDialog({ title, message, variant: 'error', isConfirm: false });
  }

  async confirm(title: string, message: string, okText = 'OK', cancelText = 'Cancel'): Promise<boolean> {
    const result = await this.openDialog({
      title,
      message,
      variant: 'warning',
      isConfirm: true,
      okText,
      cancelText,
    });
    return !!result;
  }
}


