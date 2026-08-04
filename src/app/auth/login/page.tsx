import LoginForm from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  // LoginForm ya es una pantalla completa (min-h-screen bg-background con los
  // tokens del design system). El wrapper con gradiente hardcodeado de antes
  // generaba una franja oscura angosta sobre fondo claro en desktop.
  return <LoginForm />;
}

export const metadata = {
  title: "Iniciar Sesión - NaviTracker",
  description: "Inicia sesión en tu cuenta de NaviTracker",
};
