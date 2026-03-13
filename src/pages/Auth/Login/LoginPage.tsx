import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import LoginModal from "./Login.tsx";
import {
  SignUpModal,
  SignUpData,
} from "../../../components/TrailerDetails/SignUpModal.tsx";
import { register } from "../../../api/authApi.ts";
import { loginSuccess } from "../../../store/authSlice.ts";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <>
      {!isSignUpOpen && (
        <LoginModal
          isOpen={!isSignUpOpen}
          onClose={() => navigate(-1)}
          onSuccess={() => navigate("/")}
          onOpenSignUp={() => setIsSignUpOpen(true)}
        />
      )}
      {isSignUpOpen && (
        <SignUpModal
          isOpen={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onSubmit={async (data: SignUpData) => {
            try {
              const res = await register({
                fullName: `${data.firstName} ${data.lastName}`.trim(),
                email: data.email,
                password: data.password,
              });

              const fullName =
                typeof res.user.fullName === "string"
                  ? res.user.fullName.trim()
                  : `${data.firstName} ${data.lastName}`.trim();
              const [firstName, ...restName] = fullName
                .split(" ")
                .filter(Boolean);
              const lastName =
                restName.length > 0 ? restName.join(" ") : undefined;

              dispatch(
                loginSuccess({
                  firstName: firstName || undefined,
                  lastName,
                  email: res.user.email || data.email,
                })
              );

              // eslint-disable-next-line no-console
              console.log("register api response:", res);
              setIsSignUpOpen(false);
              toast.success("Account created successfully");
              navigate("/");
            } catch (err: any) {
              const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create account. Please try again.";
              // eslint-disable-next-line no-console
              console.error("register api error:", err?.response?.data ?? err);
              toast.error(message);
            }
          }}
        />
      )}
    </>
  );
};

export default LoginPage;
