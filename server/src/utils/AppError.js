// Error con código HTTP adjunto. Los controladores hacen:
//   throw new AppError('Ese email ya está registrado', 409)
// y el errorHandler de la Fase 0 responde automáticamente con ese código
// y ese mensaje, sin necesidad de try/catch repetido en cada ruta.
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}