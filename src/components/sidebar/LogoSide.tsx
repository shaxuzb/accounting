import { useAppSelector } from "@/store/hooks";
/* import logo from "@/assets/images/logo/logo.svg"; */

const LogoSide = () => {
  const sidebarInline = useAppSelector((state) => state.sidebar);

  return (
    <div
      className={`h-16 flex ${sidebarInline.sidebar ? "px-2" : "px-4"} items-center border-b border-border`}
    >
      <div
        className={`flex items-center gap-3 w-full ${
          sidebarInline.sidebar ? "justify-center" : "justify-start"
        }`}
      >
        {/* Logo */}
        {/* <img src={logo} alt="logo" className="h-10 w-10 object-contain" /> */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
          HK
        </div>

        {/* Title */}
        {!sidebarInline.sidebar && (
          <div>
            <h1 className="text-blue-600  text-xl font-bold leading-none">
              HisobKitob
            </h1>
            <p className="text-blue-600 mt-0.5 text-[10px] font-semibold tracking-wider">
              Buxgalteriya tizimi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSide;
