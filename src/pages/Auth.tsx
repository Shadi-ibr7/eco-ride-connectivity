import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {isLogin ? "Connexion" : "Inscription"}
            </h2>
            <p className="mt-2 text-gray-600">
              {isLogin
                ? "Connectez-vous pour accéder à votre compte"
                : "Créez votre compte pour commencer"}
            </p>
          </div>

          <div className="mt-8">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;