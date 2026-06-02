import { useCallback } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";

type NavOptions = {
  replace?: boolean;
  state?: Record<string, unknown> | null;
};

type BackgroundLocationState = {
  backgroundLocation?: Location;
};

export const useModalNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const modalNavigate = useCallback(
    (to: string, opts: NavOptions = {}) => {
      const currentState = location.state as BackgroundLocationState | null;
      const backgroundLocation = currentState?.backgroundLocation ?? location;
      const state = {
        ...(opts.state ?? {}),
        backgroundLocation,
      };
      navigate(to, { replace: opts.replace, state });
    },
    [navigate, location],
  );

  return modalNavigate;
};

export default useModalNavigate;
