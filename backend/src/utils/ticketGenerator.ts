import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un número único de boleto basado en el número de control del sorteo
 * y un número secuencial
 * Formato: TKT-{controlNumber}-{sequentialNumber}
 * Ejemplo: TKT-LOT-2025-003-0020
 */
export const generateTicketNumber = (controlNumber: string, sequentialNumber: number): string => {
  const prefix = 'TKT';
  // Formatear el número secuencial con padding de 4 dígitos
  const paddedNumber = sequentialNumber.toString().padStart(4, '0');
  return `${prefix}-${controlNumber}-${paddedNumber}`;
};

/**
 * Genera un código de verificación único
 */
export const generateVerificationCode = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
};

/**
 * Genera números aleatorios únicos para un boleto de lotería
 */
export const generateRandomNumbers = (
  min: number,
  max: number,
  count: number
): number[] => {
  const numbers = new Set<number>();

  while (numbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNumber);
  }

  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Valida que los números estén dentro del rango permitido
 */
export const validateNumbers = (
  numbers: number[],
  min: number,
  max: number,
  count: number
): boolean => {
  if (numbers.length !== count) return false;

  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== count) return false;

  return numbers.every(num => num >= min && num <= max);
};

/**
 * Cuenta cuántos números coinciden entre el boleto y los números ganadores
 */
export const countMatchingNumbers = (
  ticketNumbers: number[],
  winningNumbers: number[]
): number => {
  return ticketNumbers.filter(num => winningNumbers.includes(num)).length;
};
