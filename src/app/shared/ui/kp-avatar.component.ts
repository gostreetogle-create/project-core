import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kp-avatar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  template: `
    <p-avatar
      [label]="label()"
      [icon]="icon()"
      [image]="image()"
      [size]="size()"
      [shape]="shape()"
      [styleClass]="styleClass()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpAvatarComponent {
  label = input('');
  icon = input('');
  image = input('');
  size = input<'normal' | 'large' | 'xlarge'>('normal');
  shape = input<'square' | 'circle'>('circle');
  styleClass = input('');
}
