// Helper para mostrar toasts desde el store (sin hooks)
// Esto funciona creando eventos personalizados que el Toaster puede escuchar

export interface ToastData {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Función para mostrar toast desde cualquier lugar (incluyendo el store)
export function showToast(data: ToastData) {
  if (typeof window !== "undefined") {
    // Crear un evento personalizado que el Toaster puede escuchar
    const event = new CustomEvent("show-toast", { detail: data });
    window.dispatchEvent(event);
  }
}

// Funciones de conveniencia
export const toast = {
  success: (title: string, description?: string) => {
    showToast({ title, description, variant: "default" });
  },

  error: (title: string, description?: string) => {
    showToast({ title, description, variant: "destructive" });
  },

  info: (title: string, description?: string) => {
    showToast({ title, description, variant: "default" });
  },
};
