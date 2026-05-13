import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export default function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`input-modern ${
        hasError ? "border-red-400 focus:ring-red-400/20" : ""
      } ${className}`}
    />
  );
}
