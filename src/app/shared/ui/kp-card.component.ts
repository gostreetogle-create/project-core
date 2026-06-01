import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kp-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card [header]="header()" [subheader]="subheader()" [styleClass]="styleClass()">
      <ng-content />
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpCardComponent {
  header = input('');
  subheader = input('');
  styleClass = input('');
}
