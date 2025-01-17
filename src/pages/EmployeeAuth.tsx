import { EmployeeLoginForm } from "@/components/auth/EmployeeLoginForm";
import { Car } from "lucide-react";

const EmployeeAuth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Portail Employé
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous à votre compte employé
          </p>
        </div>

        <div className="mt-8">
          <EmployeeLoginForm />
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;