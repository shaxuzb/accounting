import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Wrench,
  FileText,
  Truck,
  Calculator,
  BarChart3,
  ShoppingCart,
  Factory,
  ClipboardList,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffectiveTheme } from "@/shared/hooks/useEffectiveTheme";

const LoadingScreen = () => {
  const { t } = useTranslation();
  const isDark = useEffectiveTheme() === "dark";

  const SIZE = 640;
  const RADIUS = 205;
  const CENTER = SIZE / 2;

  const modules = useMemo(
    () => [
      { label: t("loading.financialReport"), Icon: Calculator, color: "#22c55e" },
      { label: t("loading.hr"), Icon: Users, color: "#38bdf8" },
      { label: t("loading.supplyChain"), Icon: Truck, color: "#a78bfa" },
      { label: t("loading.production"), Icon: Factory, color: "#f97316" },
      { label: t("loading.projectManagement"), Icon: ClipboardList, color: "#06b6d4" },
      { label: "CRM", Icon: Layers, color: "#eab308" },
      { label: t("loading.sales"), Icon: ShoppingCart, color: "#fb7185" },
      { label: t("loading.businessAnalytics"), Icon: BarChart3, color: "#60a5fa" },
      { label: t("loading.services"), Icon: Wrench, color: "#f43f5e" },
      { label: t("loading.documents"), Icon: FileText, color: "#14b8a6" },
    ],
    [t],
  );

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-500 p-6 ${
        isDark
          ? "bg-[radial-gradient(1000px_600px_at_50%_-10%,#1f2845_0%,#0b1120_60%)] text-white"
          : "bg-linear-to-b from-gray-50 to-gray-100 text-slate-900"
      }`}
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.25), rgba(0,0,0,0) 70%)",
          }}
        />

        {[140, RADIUS + 20, RADIUS + 60].map((r, idx) => (
          <div
            key={r}
            className={`absolute rounded-full border ${
              isDark ? "border-slate-700/60" : "border-slate-300"
            }`}
            style={{
              left: CENTER - r,
              top: CENTER - r,
              width: r * 2,
              height: r * 2,
              opacity: idx === 0 ? 0.4 : 0.25,
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative grid place-items-center">
            <div
              className="absolute -inset-8 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(125,211,252,0.35), rgba(0,0,0,0))",
              }}
            />
            <div
              className={`h-48 w-48 rounded-full backdrop-blur ring-1 shadow-2xl grid place-items-center ${
                isDark
                  ? "bg-slate-900/60 ring-slate-700"
                  : "bg-white/80 ring-slate-300"
              }`}
            >
              <motion.div
                className="absolute -inset-1 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(147,197,253,.0) 0 65%, rgba(167,139,250,.35) 80% 100%)",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 10,
                }}
              />
              <motion.span
                className="text-7xl font-black tracking-tight drop-shadow-[0_2px_12px_rgba(167,139,250,0.35)]"
                style={{
                  background:
                    "linear-gradient(180deg,#c7d2fe,#a78bfa 60%,#60a5fa)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
                initial={{ letterSpacing: "0.28em" }}
                animate={{ letterSpacing: "0.01em" }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              >
                ERP
              </motion.span>
            </div>
          </div>
        </motion.div>

        {modules.map((m, i) => {
          const angle = (i / modules.length) * Math.PI * 2 - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          const delay = 0.35 + i * 0.09;

          const stubLen = 28;
          const stubStartX = CENTER + (RADIUS - 6) * Math.cos(angle);
          const stubStartY = CENTER + (RADIUS - 6) * Math.sin(angle);

          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay }}
            >
              <div
                className={`absolute ${
                  isDark ? "bg-slate-700/60" : "bg-slate-300"
                }`}
                style={{
                  left: stubStartX,
                  top: stubStartY,
                  width: 2,
                  height: stubLen,
                  transform: `translate(-50%, -50%) rotate(${
                    angle + Math.PI / 2
                  }rad)`,
                  borderRadius: 2,
                }}
              />
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
                initial={{ scale: 0.7, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 14,
                  delay: delay + 0.05,
                }}
              >
                <div className="group grid place-items-center gap-2">
                  <div
                    className={`relative h-16 w-16 rounded-full backdrop-blur ring-1 shadow-lg hover:shadow-xl ${
                      isDark
                        ? "bg-slate-800/80 ring-slate-700"
                        : "bg-white/80 ring-slate-300"
                    }`}
                  >
                    <div
                      className="absolute shadow-inset-[2px] rounded-full opacity-40 group-hover:opacity-70 transition-opacity"
                      style={{
                        background: `conic-gradient(from 180deg, transparent 0 70%, ${m.color} 80% 100%)`,
                      }}
                    />
                    <div className="relative grid place-items-center h-full">
                      <m.Icon size={26} style={{ color: m.color }} />
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full ring-1 text-xs whitespace-nowrap ${
                      isDark
                        ? "bg-slate-900/80 ring-slate-700 text-slate-200"
                        : "bg-white ring-slate-300 text-slate-700"
                    }`}
                  >
                    {m.label}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScreen;

