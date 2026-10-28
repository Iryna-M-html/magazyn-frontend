"use client";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo/Logo";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)] p-6 text-center">
      {/* Масштабируемый логотип в круглом контейнере */}
      <div className="w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 p-4 md:p-6 lg:p-8 border-2 border-[#56c6a0] rounded-full bg-[rgba(15,23,42,0.4)] flex items-center justify-center mb-6 shadow-2xl shadow-black/50 transition-all duration-300">
        <Logo className="w-full h-full" />
      </div>

      

      {/* Кнопка входа с вашими корпоративными цветами и стилями */}
      <Link
        href="/login"
        className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
        style={{
          backgroundColor: "var(--color-primary, #4e9f59)",
          fontSize: "var(--type-button-size, 13px)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-primary-hover, #3d8346)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-primary, #4e9f59)")
        }
      >
        Welcome to IVPOL
      </Link>
    </main>
  );
}