import { Link } from "react-router";
import { Button } from "antd";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-bold">
        404
      </motion.h1>
      <p className="text-gray-500">Page not found</p>
      <Link to="/main">
        <Button type="primary">Go home</Button>
      </Link>
    </div>
  );
}
