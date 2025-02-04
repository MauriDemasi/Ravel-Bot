export class ValidationService {
    static validateDates(dateRange: { start: string; end: string }): void {
      const now = new Date(); // Fecha y hora actual
      const startDate = new Date(dateRange.start); // Convertir a objeto Date
      const endDate = new Date(dateRange.end); // Convertir a objeto Date
  
      // Validar que la fecha de inicio sea al menos 24 horas posterior a la fecha actual
      const minStartDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas después de ahora
      if (startDate < minStartDate) {
        throw new Error("La fecha de inicio debe ser al menos 24 horas posterior a la fecha actual.");
      }
  
      // Validar que la fecha de fin sea posterior a la fecha de inicio
      if (endDate <= startDate) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");
      }
    }
  }