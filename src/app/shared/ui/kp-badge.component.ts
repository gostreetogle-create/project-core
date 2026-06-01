import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

type BadgeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'kp-badge',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <p-tag
      [value]="value()"
      [severity]="severity()"
      [rounded]="rounded()"
      [styleClass]="styleClass()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpBadgeComponent {
  value = input('');
  severity = input<BadgeSeverity>('info');
  rounded = input(false);
  styleClass = input('');

  // Хелперы для статусов
  static readonly STATUS_MAP: Record<string, { label: string; severity: BadgeSeverity }> = {
    active: { label: 'Активен', severity: 'success' },
    pending: { label: 'В ожидании', severity: 'warn' },
    completed: { label: 'Завершён', severity: 'info' },
    cancelled: { label: 'Отменён', severity: 'danger' },
    draft: { label: 'Черновик', severity: 'secondary' }
  };
}
