import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'kp-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  template: `<p-confirmDialog />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpConfirmDialogComponent {
  confirmationService = inject(ConfirmationService);

  static confirm(
    confirmationService: ConfirmationService,
    options: {
      message: string;
      header?: string;
      icon?: string;
      acceptLabel?: string;
      rejectLabel?: string;
      accept: () => void;
      reject?: () => void;
    }
  ) {
    confirmationService.confirm({
      message: options.message,
      header: options.header || 'Подтверждение',
      icon: options.icon || 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel || 'Да',
      rejectLabel: options.rejectLabel || 'Нет',
      accept: options.accept,
      reject: options.reject
    });
  }
}
