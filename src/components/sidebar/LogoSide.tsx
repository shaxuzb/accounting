import Logo from "@/assets/login.png";
import { useAppSelector } from "@/store/hooks";

const LogoSide = () => {
  const sidebarInline = useAppSelector((state) => state.sidebar);

  return (
    <div
      className={`h-14 flex ${sidebarInline.sidebar ? "px-0" : "px-4"} items-center border-b border-border`}
    >
      <div
        className={`flex items-center gap-3 w-full ${
          sidebarInline.sidebar ? "justify-center" : "justify-start"
        }`}
      >
        {/* Logo */}
        <img src={Logo} alt="logo" className="w-11 h-11 object-contain" />

        {/* Title */}
        {!sidebarInline.sidebar && (
          <h1 className="text-[20px] font-semibold tracking-[0.2px] text-gray-800 leading-none">
            ModuX
          </h1>
        )}
      </div>
    </div>
  );
};

export default LogoSide;
