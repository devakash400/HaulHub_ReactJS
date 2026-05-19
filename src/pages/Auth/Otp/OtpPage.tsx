import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/index.ts";
import LoginModal from "../Login/Login.tsx";

const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <LoginModal
      isOpen
      initialStep="otp"
      onClose={() => navigate(-1)}
      onSuccess={() => navigate("/")}
    />
  );
};

export default OtpPage;
