import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value;
    if (isNaN(Number(char))) return;

    const newOtp = value.split("");
    // Take the last character if user types in a filled field
    newOtp[index] = char.substring(char.length - 1);
    const newValue = newOtp.join("");
    
    onChange(newValue);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData);
    focusInput(Math.min(pastedData.length, length - 1));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center" role="group" aria-label="One-time password input">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-10 h-12 text-center text-lg font-semibold bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all",
              error ? "border-destructive focus:ring-destructive" : "border-input"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-xs text-destructive font-medium animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
