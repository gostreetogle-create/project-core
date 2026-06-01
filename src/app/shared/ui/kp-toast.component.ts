import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'kp-toast',
  standalone: true,
  imports: [ToastModule],
  template: `<p-toast position="top-right" [life]="4000" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpToastComponent {
  messageService = inject(MessageService);
}
