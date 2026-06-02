import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';

type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'danger' | 'warn' | 'info' | 'contrast';
type ButtonSize = 'small' | 'large';

@Component({
  selector: 'kp-button',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      [label]="label()"
      [icon]="icon()"
      [iconPos]="iconPos()"
      [severity]="severity()"
      [size]="size()"
      [outlined]="outlined()"
      [raised]="raised()"
      [rounded]="rounded()"
      [text]="text()"
      [plain]="plain()"
      [loading]="loading()"
      [disabled]="disabled()"
      [styleClass]="styleClass()"
      [attr.aria-label]="label() || 'Кнопка'"
      (onClick)="buttonClick.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpButtonComponent {
  label = input('');
  icon = input('');
  iconPos = input<'left' | 'right' | 'top' | 'bottom'>('left');
  severity = input<ButtonSeverity>('primary');
  size = input<ButtonSize>('small');
  outlined = input(false);
  raised = input(false);
  rounded = input(false);
  text = input(false);
  plain = input(false);
  loading = input(false);
  disabled = input(false);
  styleClass = input('');

  readonly buttonClick = output<MouseEvent>();
}
