import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kp-drawer',
  standalone: true,
  imports: [CommonModule, DrawerModule],
  template: `
    <p-drawer
      [visible]="visible()"
      [position]="position()"
      [style]="{ width: width() }"
      [closable]="closable()"
      (visibleChange)="visibleChange.emit($event)"
    >
      <ng-content />
    </p-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpDrawerComponent {
  visible = input(false);
  position = input<'left' | 'right' | 'top' | 'bottom'>('left');
  width = input('300px');
  closable = input(true);
  readonly visibleChange = output<boolean>();
}
