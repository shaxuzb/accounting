import { Button } from "antd";
import { Settings } from "lucide-react";
import { useState } from "react";
import SettingDetail from "./SettingDetail";
import { motion } from "motion/react";

const SettingSystem = ({ ref }: { ref: React.RefObject<HTMLDivElement> }) => {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      drag="y"
      dragConstraints={ref}
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      transition={{ type: "decay", stiffness: 200, damping: 25 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-10"
    >
      <Button
        type="primary"
        className="p-0! w-12 h-12! rounded-l-4xl! rounded-t-4xl! rounded-br-sm!"
        onClick={(e) => {
          if (dragging) return e.preventDefault();
          setOpen(true);
        }}
      >
        <Settings className="white animate-[spin_2s_linear_infinite]" />
      </Button>
      <SettingDetail open={open} setOpen={setOpen} />
    </motion.div>
  );
};

export default SettingSystem;



