import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { twoFactorSchema, type TwoFactorSchema } from "../types/schema";

export function TwoFactorForm() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorSchema>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Authentication successful!");
      navigate("/chat");
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We sent a verification code to your email. Enter the code below to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              error={errors.code?.message}
            />
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-4">
        <Button variant="link" className="text-sm text-muted-foreground" onClick={() => toast.info("Code resent!")}>
          Resend Code
        </Button>
        
        <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>
      </div>
    </div>
  );
}
