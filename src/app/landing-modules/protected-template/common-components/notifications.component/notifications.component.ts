import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppNotification, NotificationService } from '../../services/notification.service';
import { notif } from '../../models/sampleData';
import { LoaderComponent } from '../loader.component/loader.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  imports:[CommonModule,LoaderComponent ],
  providers:[DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {

  notifications: AppNotification[] = [];
  loading = false;
  markingInProgress = new Set<string>();
  errorMessage = '';

  constructor(
    private notificationService: NotificationService,
    private datePipe: DatePipe,  private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.notifications = notif;
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.loading = false;
         this.cdr.detectChanges();

      },
      error: () => {
        this.errorMessage = 'Failed to load notifications.';
        this.loading = false;
         this.cdr.detectChanges();
      },
      complete() {
       
      },
    });
  }

  markNotificationAsRead(n: AppNotification): void {
    if (n.read || this.markingInProgress.has(n.id)) return;

    const original = { ...n };
    n.read = true;
    this.markingInProgress.add(n.id);

    this.notificationService.markAsRead(n.id).subscribe({
      next: () => this.markingInProgress.delete(n.id),
      error: () => {
        Object.assign(n, original);
        this.markingInProgress.delete(n.id);
        alert('Failed to mark as read');
      }
    });
  }

  formatDate(iso: string): string {
    return this.datePipe.transform(iso, 'medium') ?? iso;
  }

  trackById(index: number, item: AppNotification) {
    return item.id;
  }
}