import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { api, setAuthToken, getAuthToken } from "@/services/api";

interface MongoUser {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  isApproved?: boolean;
  isSuperAdmin?: boolean;
}

interface MongoAuthContextType {
  user: MongoUser | null;
  isAdmin: boolean;
  isAdminApproved: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  loginError?: string;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; pendingApproval?: boolean }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "user",
  ) => Promise<{ error: Error | null; pendingApproval?: boolean }>;
  signOut: () => void;
}

const MongoAuthContext = createContext<MongoAuthContextType | undefined>(
  undefined,
);

export function MongoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string>();

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
          setLoginError(undefined);
        } catch (error) {
          console.error("Token validation failed:", error);
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password);

      // Check if approval is pending
      if (data.pendingApproval) {
        setLoginError(
          "Admin access pending approval. Please contact the administrator.",
        );
        return {
          error: new Error(
            "Admin access pending approval. Please contact the administrator.",
          ),
          pendingApproval: true,
        };
      }

      setUser({
        _id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        isApproved: data.isApproved,
        isSuperAdmin: data.isSuperAdmin,
      });
      setLoginError(undefined);
      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setLoginError(errorMessage);
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "admin" | "user" = "user",
  ) => {
    try {
      const data = await api.auth.register(email, password, name, role);

      // Check if approval is pending
      if (data.pendingApproval) {
        setLoginError(
          "Admin account registration successful. Awaiting approval from administrator.",
        );
        return {
          error: null,
          pendingApproval: true,
        };
      }

      setUser({
        _id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        isApproved: data.isApproved,
        isSuperAdmin: data.isSuperAdmin,
      });
      setLoginError(undefined);
      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setLoginError(errorMessage);
      return { error: error as Error };
    }
  };

  const signOut = () => {
    api.auth.logout();
    setUser(null);
    setLoginError(undefined);
  };

  return (
    <MongoAuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isAdminApproved: user?.role === "admin" && user?.isApproved === true,
        isSuperAdmin: user?.isSuperAdmin === true,
        isLoading,
        loginError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </MongoAuthContext.Provider>
  );
}

export function useMongoAuth() {
  const context = useContext(MongoAuthContext);
  if (context === undefined) {
    throw new Error("useMongoAuth must be used within a MongoAuthProvider");
  }
  return context;
}
