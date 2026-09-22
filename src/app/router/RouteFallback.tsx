import { Spin } from "antd";

/**
 * Route'lar lazy yuklanadi, shuning uchun Outlet Suspense ichida turadi.
 * Fallback yengil bo'lishi kerak: u chunk yuklanayotgan bir necha yuz
 * millisekundda ko'rinadi, shuning uchun to'liq ekranli LoadingScreen emas.
 */
const RouteFallback = () => (
  <div className="flex min-h-40 w-full items-center justify-center p-10">
    <Spin />
  </div>
);

export default RouteFallback;
