"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="relative flex h-fit w-fit flex-col items-center justify-center">
        {/* Анимированная коробка */}
        <div className="relative mb-2 flex flex-col items-center animate-bounce-short">
          {/* Сканирующий лазер */}
          <div className="absolute -top-1 z-10 h-0.5 w-14 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-scan-beam" />

          {/* Коробка */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="h-16 w-16 drop-shadow-sm"
          >
            {/* Картонная коробка */}
            <path
              d="M15 35 L50 15 L85 35 L85 75 L50 95 L15 75 Z"
              fill="#E2E8F0"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Верхние клапаны */}
            <path
              d="M15 35 L50 55 L85 35"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Центральная линия */}
            <path
              d="M50 55 L50 95"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3"
            />

            {/* Зеленая наклейка */}
            <rect
              x="58"
              y="52"
              width="20"
              height="26"
              rx="3"
              fill="#4E9F59"
              transform="rotate(-10 68 65)"
            />

            {/* Штрихкод */}
            <line
              x1="62"
              y1="56"
              x2="62"
              y2="72"
              stroke="white"
              strokeWidth="2"
            />

            <line
              x1="66"
              y1="56"
              x2="66"
              y2="72"
              stroke="white"
              strokeWidth="1"
            />

            <line
              x1="69"
              y1="56"
              x2="69"
              y2="72"
              stroke="white"
              strokeWidth="2"
            />

            <line
              x1="73"
              y1="56"
              x2="73"
              y2="72"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Конвейер */}
        <div className="relative flex h-1 w-24 items-center overflow-hidden rounded-full bg-gray-800">
          <div className="absolute inset-0 h-full w-full animate-conveyor bg-[linear-gradient(90deg,transparent_50%,#4e9f59_50%)] bg-[length:12px_100%]" />
        </div>

        {/* Текст */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-gray-600">
            Загрузка данных
          </span>

          <span className="flex gap-0.5">
            <span className="h-1 w-1 animate-ping rounded-full bg-emerald-600" />

            <span className="h-1 w-1 animate-ping rounded-full bg-emerald-600 [animation-delay:0.2s]" />

            <span className="h-1 w-1 animate-ping rounded-full bg-emerald-600 [animation-delay:0.4s]" />
          </span>
        </div>
      </div>
    </div>
  );
}
