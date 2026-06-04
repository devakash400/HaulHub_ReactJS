import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, type Location } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/index.ts";
import { toast } from "react-toastify";
import LoginModal from "./Login.tsx";

import {
  SignUpModal,
  SignUpData,
} from "../../../components/TrailerDetails/SignUpModal.tsx";
import { register, roleToTrailor } from "../../../api/authApi.ts";
import { signUpSuccess } from "../../../store/authSlice.ts";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | ({ backgroundLocation?: Location; returnTo?: string } & Record<
        string,
        unknown
      >)
    | null;
  const backgroundLocation = locationState?.backgroundLocation as
    | Location
    | undefined;
  const returnTo = locationState?.returnTo as string | undefined;
  const loginState =
    (location.state as {
      modalStep?: "email" | "password" | "reset" | "otp" | "newPassword";
      loginIdentifier?: string;
      usePhoneOnly?: boolean;
      selectedCountryCode?: string;
      loginTrailor?: "Renter" | "Owner";
    } | null) ?? null;

  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }
    if (backgroundLocation && typeof backgroundLocation.pathname === "string") {
      const target = `${backgroundLocation.pathname || "/"}${backgroundLocation.search ?? ""}`;
      navigate(target, {
        replace: true,
        state: backgroundLocation.state ?? null,
      });
    } else {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, backgroundLocation, returnTo]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      {!isSignUpOpen && (
        <LoginModal
          isOpen
          initialStep={loginState?.modalStep}
          initialIdentifier={loginState?.loginIdentifier}
          initialUsePhoneOnly={loginState?.usePhoneOnly}
          initialCountryCode={loginState?.selectedCountryCode}
          initialTrailor={loginState?.loginTrailor}
          onClose={() => navigate(-1)}
          onSuccess={() => {
            if (returnTo) {
              navigate(returnTo, { replace: true });
              return;
            }
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
              navigate("/");
            }
          }}
          onOpenSignUp={() => setIsSignUpOpen(true)}
        />
      )}
      {isSignUpOpen && (
        <SignUpModal
          isOpen={isSignUpOpen}
          submitError={submitError}
          onClose={() => {
            setIsSignUpOpen(false);
            setSubmitError(null);
          }}
          onSubmit={async (data: SignUpData) => {
            setSubmitError(null);
            try {
              const res = await register({
                fullName: `${data.firstName} ${data.lastName}`.trim(),
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: data.password,
                trailor: data.trailor,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
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
              const apiUser = res.user as {
                role?: string;
                trailor?: string | string[];
              };
              const trailorFromApi =
                roleToTrailor(apiUser.role) ??
                roleToTrailor(
                  Array.isArray(apiUser.trailor)
                    ? apiUser.trailor[0]
                    : apiUser.trailor,
                );
              const normalizedTrailor = trailorFromApi ?? data.trailor;

              dispatch(
                signUpSuccess({
                  user: {
                    firstName: firstName || undefined,
                    lastName,
                    email: res.user.email || data.email,
                    trailor: normalizedTrailor,
                  },
                  accessToken: res.accessToken,
                  refreshToken: res.refreshToken,
                  userType: normalizedTrailor,
                }),
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
              setSubmitError(message);
            }
          }}
        />
      )}
    </>
  );
};

export default LoginPage;
