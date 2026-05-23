import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { getMe } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const { token, login, logout } = useAuthStore();

  const { data: user, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      logout();
    } else if (user && token) {
      login(user, token);
    }
  }, [user, isError, token, login, logout]);

  return <>{children}</>;
}
