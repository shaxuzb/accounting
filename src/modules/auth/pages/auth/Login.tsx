import InputPassword from "@/components/fields/InputPassword";
import InputText from "@/components/fields/InputText";
import { Button, Checkbox, Form } from "antd";
import { useFormik } from "formik";
import loginP from "@/assets/loginP.png";
import { authSchema } from "../../types/auth";
import { authService, type LoginPayload } from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, isLoading as setIsLoading } from "@/store/features/authSlice";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((s) => s.auth.loading);

  const formik = useFormik<LoginPayload>({
    initialValues: { userName: "", password: "" },
    validationSchema: authSchema,
    onSubmit: async (values) => {
      // dispatch(setIsLoading(true));
      try {
        const response = await authService.login({
          userName: values.userName,
          password: values.password,
        });
        dispatch(login(response.data));
        navigate("/main");
        toast.success("Muvaffaqiyatli kirdingiz!");
      } catch (error) {
        errorHandlers(error);
      }
    },
  });

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#f5f5f5] flex items-center justify-center"
      style={{ padding: "15px" }}
    >
      <div className="w-full h-full flex rounded-2xl shadow-2xl overflow-hidden shadow-[#828487]">
        <div className="w-[38%] min-w-85 h-full bg-white flex flex-col px-10 py-8">
          <div className="flex flex-col flex-1 justify-center max-w-90 mx-auto w-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
                HK
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">
                  HisobKitob
                </h1>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5 tracking-wider">
                  Buxgalteriya tizimi
                </p>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xush kelibsiz!
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Hisobingizga kiring va jarayonlarni oson boshqaring.
              </p>
            </div>

            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <InputText fieldName="userName" formik={formik} label="Email" />
              <InputPassword
                formik={formik}
                fieldName="password"
                label="Parol"
              />

              <div className="flex items-center justify-between py-3">
                <Checkbox className="text-xs font-medium text-gray-500">
                  Eslab qolish
                </Checkbox>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Parolni unutdingizmi?
                </a>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
              >
                Kirish →
              </Button>
            </Form>
          </div>

          <div className="border-t border-gray-100 pt-5 max-w-90 mx-auto w-full">
            <p className="text-center text-[11px] text-gray-400 mb-3">
              © 2024 HisobKitob. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex justify-center gap-5 items-center text-[11px] font-semibold text-gray-400">
              <span className="hover:text-blue-600 cursor-pointer transition-all">
                O'zbekcha
              </span>
              <span className="hover:text-blue-600 cursor-pointer transition-all">
                Русский
              </span>
              <span className="hover:text-blue-600 cursor-pointer transition-all">
                English
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 h-full relative overflow-hidden">
          <img
            src={loginP}
            alt="Accounting illustration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(219,234,254,0.25) 0%, rgba(191,219,254,0.15) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-7">
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[13px] mb-1">
                    Buxgalterlar uchun qulay
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Intuitiv interfeys va avtomatlashtirilgan jarayonlar bilan
                    vaqtni tejang.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[13px] mb-1">
                    Xavfsiz va ishonchli
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Ma'lumotlaringiz yuqori darajadagi xavfsizlik bilan
                    himoyalangan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-[13px] mb-1">
                    Barchasi bitta tizimda
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Barcha buxgalteriya jarayonlarini yagona platformada
                    boshqaring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
