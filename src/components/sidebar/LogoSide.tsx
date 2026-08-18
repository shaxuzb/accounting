import { useAppSelector } from "@/store/hooks";
// import { useTranslation } from "react-i18next";
import logo from "@/assets/images/logo/logo.svg";
import logo1 from "@/assets/images/logo/logo1.svg";

const LogoSide = () => {
  // const { t } = useTranslation();
  const sidebarInline = useAppSelector((state) => state.sidebar);

  return (
    <div
      className={`h-16 flex ${sidebarInline.sidebar ? "px-2" : "px-4"}  border-b border-border`}
    >
      <div className={`flex items-center gap-3 w-full `}>
        {/* Logo */}

        {/* <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
          HK
        </div> */}

        {/* Title */}
        {!sidebarInline.sidebar ? (
          <div>
            <img
              src={logo1}
              alt="Accounting"
              className="brand-logo h-10 w-auto object-contain object-left"
            />
            {/* <h1 className="text-blue-600  text-xl font-bold leading-none">
              HisobKitob
            </h1>
            <p className="text-blue-600 mt-0.5 text-[10px] font-semibold tracking-wider">
              {t("auth.systemName")}
            </p> */}
          </div>
        ) : (
          <div>
            <img
              src={logo}
              alt="Accounting"
              className="brand-logo h-10 w-10 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoSide;
