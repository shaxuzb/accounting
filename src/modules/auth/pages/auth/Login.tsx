//
import InputPasword from "@/components/fields/InputPassword";
import InputText from "@/components/fields/InputText";
import type { LoginProps } from "@/interface/Interface";
import { Button, Checkbox, Form } from "antd";
import { useFormik } from "formik";
import login from "@/assets/login.png";
import GoogleIcon from "@/components/widget/customicons/GoogleIcon";
import { authSchema } from "../../types/auth";

function Login() {
  const formikLogin = useFormik<LoginProps>({
    initialValues: { username: "", password: "" },
    validationSchema: authSchema,
    onSubmit: async () => {},
  });

  return (
    <div className="min-h-screen w-full bg-[#e5e9ed] flex items-center justify-center p-4">
      <div className="w-full  bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-10 min-h-600px">
        <div className="lg:col-span-3 p-8 sm:p-10 flex flex-col justify-between bg-white h-full">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                HK
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">
                  HisobKitob
                </h1>
                <p className="text-[10px] text-blue-600 font-semibold mt-1 uppercase tracking-wider">
                  Buxgalteriya tizimi
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xush kelibsiz!
              </h2>
              <p className="text-sm text-gray-400">
                Hisobingizga kiring va jarayonlarni oson boshqaring.
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={formikLogin.handleSubmit}
              className="space-y-4"
            >
              <InputText
                fieldName="username"
                formik={formikLogin}
                label="User"
              />
              <InputPasword
                formik={formikLogin}
                fieldName="password"
                label="Parol"
              />

              <div className="flex items-center justify-between pb-2">
                <Checkbox className="text-xs font-medium text-gray-500">
                  Eslab qolish
                </Checkbox>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Unutdingizmi?
                </a>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                Kirish
              </Button>
            </Form>

            <div className="mt-8 text-center">
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-gray-100"></div>
                <span className="shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Yoki
                </span>
                <div className="grow border-t border-gray-100"></div>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <Button className="p-0! w-8! h-8! border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                  <div className="w-5 h-5">
                    <GoogleIcon />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 flex justify-center gap-5 items-center text-[11px] font-bold text-gray-400">
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
        <div
          className="hidden lg:block lg:col-span-7 h-full"
          style={{
            backgroundImage: `url(${login})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}

export default Login;
