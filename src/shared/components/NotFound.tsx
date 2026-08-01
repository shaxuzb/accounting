import { Link } from "react-router";
import { Button } from "antd";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-bold">
        404
      </motion.h1>
      <p className="text-gray-500">{t("error.pageNotFound")}</p>
      <Link to="/main">
        <Button type="primary">{t("common.home")}</Button>
      </Link>
    </div>
  );
}
