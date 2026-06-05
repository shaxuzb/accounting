import { useAppSelector } from "@/store/hooks";

const LogoSide = () => {
  const sidebarInline = useAppSelector((state) => state.sidebar);

  return (
    <div
      className={`h-16 flex ${sidebarInline.sidebar ? "px-2" : "px-4"} items-center border-b border-border border-[#e5e7eb]`}
    >
      <div
        className={`flex items-center gap-3 w-full ${
          sidebarInline.sidebar ? "justify-center" : "justify-start"
        }`}
      >
        {/* Logo */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
          HK
        </div>

        {/* Title */}
        {!sidebarInline.sidebar && (
          <div>
            <h1 className="text-xl font-bold leading-none  text-blue-600">
              HisobKitob
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5  tracking-wider">
              Buxgalteriya tizimi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSide;
