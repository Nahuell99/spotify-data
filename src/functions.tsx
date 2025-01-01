export const formatTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000); // Convertir milisegundos a segundos
    const hours = Math.floor(totalSeconds / 3600); // Obtener horas
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Obtener minutos
    const seconds = totalSeconds % 60; // Obtener segundos restantes
  
    // Formatear la salida en formato HH:mm:ss
    return `${hours}h ${minutes}m ${seconds}s`;
  };
