import { Component, input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: unknown;
  label: string;
}

@Component({
  selector: 'kp-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, FloatLabelModule],
  template: `
    <div class="kp-select-field" [class.kp-select-field--error]="!!error()">
      @if (label()) { <p-floatlabel>
        <p-select
          [inputId]="inputId()"
          [options]="options()"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          [optionLabel]="optionLabel()"
          [optionValue]="optionValue()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [showClear]="showClear()"
          [class.ng-invalid]="!!error()"
        />
        <label [for]="inputId()">{{ label() }}</label>
      </p-floatlabel> }

      @if (!label()) {
        <p-select
          [options]="options()"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          [optionLabel]="optionLabel()"
          [optionValue]="optionValue()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [showClear]="showClear()"
          [class.ng-invalid]="!!error()"
        />
      }

      @if (error()) {
        <small class="kp-select__error">{{ error() }}</small>
      }
    </div>
  `,
  styles: [`
    .kp-select-field { display: flex; flex-direction: column; gap: var(--space-2); }
    .kp-select-field--error :host ::ng-deep .p-select { border-color: var(--color-error); }
    .kp-select__error { color: var(--color-error); font-size: var(--font-size-xs); margin-top: var(--space-1); }
  `],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => KpSelectComponent), multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpSelectComponent implements ControlValueAccessor {
  label = input('');
  options = input<SelectOption[]>([]);
  optionLabel = input('label');
  optionValue = input('value');
  placeholder = input('Выберите...');
  disabled = input(false);
  error = input('');
  showClear = input(false);
  inputId = input(`kp-select-${Math.random().toString(36).slice(2, 8)}`);

  value: unknown = null;
  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  onValueChange(value: unknown) {
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (value: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(_: boolean): void {}
}
