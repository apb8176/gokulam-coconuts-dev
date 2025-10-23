import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type DialogVariant = 'info' | 'success' | 'error' | 'warning';

export interface AppDialogComponent {
  title: string;
  message: string;
  variant?: DialogVariant;
  isConfirm?: boolean;
  okText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-dialog',
  standalone:false,
  template: `
    <div class="w-full">
      <div class="px-5 pt-5 pb-2 flex items-start gap-3" [attr.data-variant]="data.variant">
        <div class="flex-none w-11 h-11 rounded-lg grid place-items-center"
             [ngClass]="iconBgClass()">
          <ng-container [ngSwitch]="data.variant">
            <svg *ngSwitchCase="'success'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg *ngSwitchCase="'error'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg *ngSwitchCase="'warning'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            </svg>
            <svg *ngSwitchDefault class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
            </svg>
          </ng-container>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-[var(--dialog-title,#0f172a)] leading-tight truncate">{{ data.title }}</h3>
          <p class="mt-2 text-sm text-[var(--dialog-text,#475569)] whitespace-pre-wrap break-words">
            <span [innerHTML]="data.message"></span>
          </p>
        </div>
      </div>

      <div class="px-4 pb-4 pt-3 flex items-center justify-end gap-3">
        <button *ngIf="data.isConfirm"
                (click)="onCancel()"
                class="px-3 py-2 rounded-md text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50">
          {{ data.cancelText || 'Cancel' }}
        </button>

        <button (click)="onOk()"
                class="px-4 py-2 rounded-md text-sm font-medium shadow-sm text-white"
                [ngClass]="okBtnClass()">
          {{ data.okText || (data.isConfirm ? 'OK' : 'Close') }}
        </button>
      </div>
    </div>
  `
})
export class AppDialogData {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppDialogComponent,
    private dialogRef: MatDialogRef<AppDialogData>
  ) {}

  onOk() { this.dialogRef.close(true); }
  onCancel() { this.dialogRef.close(false); }

  iconBgClass() {
    switch (this.data.variant) {
      case 'success': return 'bg-[color:var(--dialog-success-bg,rgba(16,185,129,0.12))] text-[var(--dialog-success,#059669)]';
      case 'error':   return 'bg-[color:var(--dialog-error-bg,rgba(239,68,68,0.08))] text-[var(--dialog-error,#ef4444)]';
      case 'warning': return 'bg-[color:var(--dialog-warning-bg,rgba(245,158,11,0.08))] text-[var(--dialog-warning,#f59e0b)]';
      default:        return 'bg-[color:var(--dialog-info-bg,rgba(59,130,246,0.08))] text-[var(--dialog-info,#3b82f6)]';
    }
  }

  okBtnClass() {
    switch (this.data.variant) {
      case 'success': return 'bg-[var(--dialog-success,#10B981)] hover:bg-[color:var(--dialog-success-hover,#059669)]';
      case 'error':   return 'bg-[var(--dialog-error,#EF4444)] hover:bg-[color:var(--dialog-error-hover,#dc2626)]';
      case 'warning': return 'bg-[var(--dialog-warning,#F59E0B)] hover:bg-[color:var(--dialog-warning-hover,#d97706)]';
      default:        return 'bg-[var(--dialog-info,#3B82F6)] hover:bg-[color:var(--dialog-info-hover,#2563eb)]';
    }
  }
}
