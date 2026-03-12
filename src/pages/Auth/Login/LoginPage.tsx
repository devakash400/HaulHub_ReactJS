import React from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./Login.tsx";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LoginModal
      isOpen={true}
      onClose={() => navigate(-1)}
      onSuccess={() => navigate("/edit-profile")}
    />
  );
};

export default LoginPage;
