import React, { useEffect } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/index.ts";
import LoginModal from "../Login/Login.tsx";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | ({ backgroundLocation?: Location } & Record<string, unknown>)
    | null;
  const backgroundLocation = locationState?.backgroundLocation;
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
      initialStep="reset"
      onClose={() => {
        if (
          backgroundLocation &&
          typeof backgroundLocation.pathname === "string"
        ) {
          const target = `${backgroundLocation.pathname || "/"}${backgroundLocation.search ?? ""}`;
          navigate(target, {
            replace: true,
            state: backgroundLocation.state ?? null,
          });
        } else {
          navigate(-1);
        }
      }}
      onSuccess={() => navigate("/")}
    />
  );
};

export default ForgotPasswordPage;
