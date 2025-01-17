import { useState } from "react";
import { LoginForm } from "./employee/LoginForm";
import { PasswordChangeForm } from "./employee/PasswordChangeForm";

export const EmployeeLoginForm = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const handleLoginSuccess = (password: string, isTemporary: boolean) => {
    if (isTemporary) {
      setCurrentPassword(password);
      setIsChangingPassword(true);
      return;
    }
    window.location.href = "/employee";
  };

  if (isChangingPassword) {
    return <PasswordChangeForm currentPassword={currentPassword} />;
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};