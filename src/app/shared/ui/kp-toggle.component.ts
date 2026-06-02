import { Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule, ToggleSwitchChangeEvent } from 'primeng/toggleswitch';

@Component({
  selector: 'kp-toggle',
  standalone: true,
  imports: [ToggleSwitchModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kp-toggle-wrap">
      @if (label()) {
        <label class="kp-toggle__label" [for]="inputId()">{{ label() }}</label>
      }
      <p-toggleswitch
        [(ngModel)]="checked"
        [disabled]="disabled()"
        [inputId]="inputId()"
        [styleClass]="styleClass()"
        (onChange)="toggleChange.emit($event)"
      />
    </div>
  `,
  styles: [`
    .kp-toggle-wrap { display: flex; align-items: center; gap: var(--space-2, 8px); }
    .kp-toggle__label { font-size: var(--font-size-sm, 12px); font-weight: 500; cursor: pointer; }
  `],
})
export class KpToggleComponent {
  label = input('');
  checked = model(false);
  disabled = input(false);
  inputId = input('');
  styleClass = input('');
  toggleChange = output<ToggleSwitchChangeEvent>();
}
