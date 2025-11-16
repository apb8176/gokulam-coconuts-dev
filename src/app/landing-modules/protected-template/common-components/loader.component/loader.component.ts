import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
   <div class="flex flex-col items-center justify-center w-full py-10 gap-3">
      <div class="loader"></div>
      <p class="text-sm sm:text-base font-medium text-center" style="color:#115930;">
        Syncing with the server….
      </p>
    </div>

  `,
  styles: [`
    .loader {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #115930; /* Dark Green */
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {}
