import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { validationUtils } from '@/utils/validation';

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validationType?: 'document' | 'phone' | 'email' | 'currency' | 'required' | 'number';
  required?: boolean;
  onValidation?: (isValid: boolean, message: string) => void;
  showValidation?: boolean;
}

export function ValidationInput({
  label,
  validationType,
  required = false,
  onValidation,
  showValidation = true,
  className,
  onChange,
  value,
  ...props
}: ValidationInputProps) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Auto-formatação baseada no tipo
    if (validationType === 'document') {
      newValue = validationUtils.formatDocument(newValue);
    } else if (validationType === 'phone') {
      newValue = validationUtils.formatPhone(newValue);
    }

    // Atualizar o valor com formatação
    if (onChange) {
      const formattedEvent = { ...e, target: { ...e.target, value: newValue } };
      onChange(formattedEvent);
    }

    // Validação
    let validation = { isValid: true, message: '' };

    if (required && !newValue.trim()) {
      validation = { isValid: false, message: `${label || 'Campo'} é obrigatório` };
    } else if (newValue.trim()) {
      switch (validationType) {
        case 'document':
          validation = validationUtils.validateDocument(newValue);
          break;
        case 'phone':
          validation = {
            isValid: validationUtils.validatePhone(newValue),
            message: validationUtils.validatePhone(newValue) ? '' : 'Telefone inválido'
          };
          break;
        case 'email':
          validation = {
            isValid: validationUtils.validateEmail(newValue),
            message: validationUtils.validateEmail(newValue) ? '' : 'Email inválido'
          };
          break;
        case 'currency':
          validation = {
            isValid: validationUtils.validateCurrency(newValue),
            message: validationUtils.validateCurrency(newValue) ? '' : 'Valor inválido'
          };
          break;
        case 'number':
          const numValidation = validationUtils.validateNumber(newValue);
          validation = numValidation;
          break;
        case 'required':
          validation = validationUtils.validateRequired(newValue, label || 'Campo');
          break;
      }
    }

    setValidationState(validation);
    if (onValidation) {
      onValidation(validation.isValid, validation.message);
    }
  };

  const inputClassName = cn(
    className,
    !validationState.isValid && showValidation && "border-destructive focus:border-destructive",
    validationState.isValid && showValidation && value && "border-success"
  );

  return (
    <div className="space-y-1">
      {label && (
        <Label className={cn(
          required && "after:content-['*'] after:text-destructive after:ml-1"
        )}>
          {label}
        </Label>
      )}
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        className={inputClassName}
      />
      {showValidation && !validationState.isValid && validationState.message && (
        <p className="text-sm text-destructive">{validationState.message}</p>
      )}
      {showValidation && validationState.isValid && value && validationType === 'document' && (
        <p className="text-sm text-success">
          {validationUtils.validateDocument(value as string).type} válido
        </p>
      )}
    </div>
  );
}