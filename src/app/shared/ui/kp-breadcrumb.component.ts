import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kp-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule],
  template: `<p-breadcrumb [model]="items()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpBreadcrumbComponent {
  items = input<MenuItem[]>([]);
}
