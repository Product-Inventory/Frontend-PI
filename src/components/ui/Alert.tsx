"use client";

export function Alert({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`px-4 py-3 rounded-lg text-sm shadow-md ${
        type === "success"
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-red-100 text-red-700 border border-red-300"
      }`}
    >
      {message}
    </div>
  );
}