"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-50 bg-white/70 backdrop-blur-sm">
      <div className="w-fit h-fit flex flex-col items-center justify-center relative">
        {/* Контейнер для анимированной коробки и сканера */}
        <div className="relative mb-3 flex flex-col items-center animate-bounce-short">
          {/* Сканирующий лазерный луч */}
          <div className="absolute -top-1 w-20 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] animate-scan-beam z-10"></div>

          {/* Иконка коробки товара с лабелом */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-24 h-24 drop-shadow-md"
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
            <path
              d="M50 55 L50 95"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3"
            />

            {/* Зеленая стилизованная наклейка / штрихкод */}
            <rect
              x="58"
              y="52"
              width="20"
              height="26"
              rx="3"
              fill="#4E9F59"
              transform="rotate(-10 68 65)"
            />
            {/* Полоски штрихкода на наклейке */}
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

        {/* Движущаяся конвейерная лента */}
        <div className="w-36 h-1.5 bg-gray-800 rounded-full relative overflow-hidden flex items-center">
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_50%,#4e9f59_50%)] bg-[length:16px_100%] animate-conveyor"></div>
        </div>

        {/* Текст подгрузки */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 tracking-wide">
            Загрузка данных
          </span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping [animation-delay:0.4s]"></span>
          </span>
        </div>
      </div>
    </div>
  );
}
