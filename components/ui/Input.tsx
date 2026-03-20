import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export default function Input({ hasError, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2980b9] ${
        hasError ? "border-red-400" : "border-gray-300"
      } ${className}`}
    />
  );
}
