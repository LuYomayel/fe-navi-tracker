import LoginForm from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Iniciar Sesión - NaviTracker",
  description: "Inicia sesión en tu cuenta de NaviTracker",
};
