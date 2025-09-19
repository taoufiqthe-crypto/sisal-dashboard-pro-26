export const validationUtils = {
  // Validação de CPF
  validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');
    
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
      return false;
    }
    
    const cpfArray = cpf.split('').map(el => +el);
    const rest = (count: number) => {
      return (cpfArray.slice(0, count-12).reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10) % 11 % 10;
    };
    
    return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
  },

  // Validação de CNPJ
  validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (cnpj === "00000000000000" || 
        cnpj === "11111111111111" || 
        cnpj === "22222222222222" || 
        cnpj === "33333333333333" || 
        cnpj === "44444444444444" || 
        cnpj === "55555555555555" || 
        cnpj === "66666666666666" || 
        cnpj === "77777777777777" || 
        cnpj === "88888888888888" || 
        cnpj === "99999999999999") {
      return false;
    }
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  },

  // Validação de documento (CPF ou CNPJ)
  validateDocument(document: string): { isValid: boolean; type: 'CPF' | 'CNPJ' | null; message: string } {
    const cleanDoc = document.replace(/[^\d]+/g, '');
    
    if (cleanDoc.length === 11) {
      const isValid = this.validateCPF(document);
      return {
        isValid,
        type: 'CPF',
        message: isValid ? 'CPF válido' : 'CPF inválido'
      };
    } else if (cleanDoc.length === 14) {
      const isValid = this.validateCNPJ(document);
      return {
        isValid,
        type: 'CNPJ',
        message: isValid ? 'CNPJ válido' : 'CNPJ inválido'
      };
    }
    
    return {
      isValid: false,
      type: null,
      message: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)'
    };
  },

  // Formatação de CPF
  formatCPF(cpf: string): string {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formatação de CNPJ
  formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  // Formatação automática de documento
  formatDocument(document: string): string {
    const cleanDoc = document.replace(/[^\d]/g, '');
    
    if (cleanDoc.length <= 11) {
      return this.formatCPF(cleanDoc);
    } else {
      return this.formatCNPJ(cleanDoc);
    }
  },

  // Validação de telefone
  validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  // Formatação de telefone
  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },

  // Validação de email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validação de valor monetário
  validateCurrency(value: string): boolean {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    return !isNaN(numValue) && numValue >= 0;
  },

  // Formatação de moeda
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  // Validação de campos obrigatórios
  validateRequired(value: string, fieldName: string): { isValid: boolean; message: string } {
    const isValid = value.trim().length > 0;
    return {
      isValid,
      message: isValid ? '' : `${fieldName} é obrigatório`
    };
  },

  // Validação de quantidade/número
  validateNumber(value: string, min: number = 0, max?: number): { isValid: boolean; message: string } {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, message: 'Valor deve ser um número válido' };
    }
    
    if (numValue < min) {
      return { isValid: false, message: `Valor mínimo é ${min}` };
    }
    
    if (max !== undefined && numValue > max) {
      return { isValid: false, message: `Valor máximo é ${max}` };
    }
    
    return { isValid: true, message: '' };
  }
};