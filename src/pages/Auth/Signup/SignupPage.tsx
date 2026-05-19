import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/index.ts";
import { toast } from "react-toastify";
import {
  SignUpModal,
  SignUpData,
} from "../../../components/TrailerDetails/SignUpModal.tsx";
import { register, roleToTrailor } from "../../../api/authApi.ts";
import { signUpSuccess } from "../../../store/authSlice.ts";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <SignUpModal
      isOpen
      onClose={() => navigate(-1)}
      onSubmit={async (data: SignUpData) => {
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
          const [firstName, ...restName] = fullName.split(" ").filter(Boolean);
          const lastName = restName.length > 0 ? restName.join(" ") : undefined;
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

          console.log("register api response:", res);
          toast.success("Account created successfully");
          navigate("/");
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to create account. Please try again.";
          console.error("register api error:", err?.response?.data ?? err);
          toast.error(message);
        }
      }}
    />
  );
};

export default SignupPage;
