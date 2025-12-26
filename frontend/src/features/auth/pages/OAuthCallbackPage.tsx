import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Authentication failed");
      navigate("/login");
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      // Note: Refresh token should ideally be in an HTTP-only cookie, 
      // but if the backend sends it in URL (as per current implementation), we store it.
      // If backend sets cookie, this might be redundant but harmless.
      
      toast.success("Successfully authenticated!");
      // Force reload to ensure AuthContext picks up the new token
      window.location.href = "/chat";
    } else {
      // If no tokens found, redirect to login
      navigate("/login");
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
}
