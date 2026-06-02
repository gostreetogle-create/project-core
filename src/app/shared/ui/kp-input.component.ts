import { Component, input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'kp-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, FloatLabelModule],
  template: `
    <div class="kp-input-field" [class.kp-input-field--error]="!!error()">
      @if (label()) { <p-floatlabel>
        @if (type() === 'number') {
          <p-inputnumber
            [inputId]="inputId()"
            [(ngModel)]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled()"
            [styleClass]="'kp-input__number' + (error() ? ' ng-invalid' : '')"
            [placeholder]="placeholder()"
            [attr.aria-label]="label() || placeholder() || 'Поле ввода'"
            [attr.aria-describedby]="error() ? inputId() + '-error' : null"
          />
          <label [for]="inputId()">{{ label() }}</label>
        } @else {
          <input
            [id]="inputId()"
            [type]="type()"
            pInputText
            [(ngModel)]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled()"
            [placeholder]="placeholder()"
            [class.ng-invalid]="!!error()"
            [attr.aria-label]="label() || placeholder() || 'Поле ввода'"
            [attr.aria-describedby]="error() ? inputId() + '-error' : null"
          />
          <label [for]="inputId()">{{ label() }}</label>
        }
      </p-floatlabel> }

      @if (!label()) {
        @if (type() === 'number') {
          <p-inputnumber
            [(ngModel)]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled()"
            [placeholder]="placeholder()"
          />
        } @else {
          <input
            [type]="type()"
            pInputText
            [(ngModel)]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled()"
            [placeholder]="placeholder()"
            [class.ng-invalid]="!!error()"
          />
        }
      }

      @if (error()) {
        <small class="kp-input__error" [id]="inputId() + '-error'">{{ error() }}</small>
      }
    </div>
  `,
  styles: [`
    .kp-input-field { display: flex; flex-direction: column; gap: var(--space-2); }
    .kp-input-field--error :host ::ng-deep .p-inputtext { border-color: var(--color-error); }
    .kp-input__error { color: var(--color-error); font-size: var(--font-size-xs); margin-top: var(--space-1); }
    .kp-input__number { width: 100%; }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KpInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpInputComponent implements ControlValueAccessor {
  label = input('');
  type = input<'text' | 'number' | 'password' | 'email'>('text');
  placeholder = input('');
  disabled = input(false);
  error = input('');
  inputId = input(`kp-input-${Math.random().toString(36).slice(2, 8)}`);

  value: string | number = '';
  onChange: (value: string | number) => void = () => {};
  onTouched: () => void = () => {};

  onValueChange(value: string | number) {
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string | number): void { this.value = value ?? ''; }
  registerOnChange(fn: (value: string | number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(_: boolean): void { /* handled by input */ }
}
