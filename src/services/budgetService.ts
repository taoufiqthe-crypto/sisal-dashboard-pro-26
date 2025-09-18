import { Budget } from '../types/budgetTypes';

export const saveBudget = (budget: Budget): void => {
  try {
    localStorage.setItem('budget', JSON.stringify(budget));
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    throw new Error('Não foi possível salvar o orçamento');
  }
};

export const loadBudget = (): Budget | null => {
  try {
    const saved = localStorage.getItem('budget');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar orçamento:', error);
    return null;
  }
};

export const generateBudgetNumber = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};