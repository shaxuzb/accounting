import type { RouteObject } from "react-router";
import { Navigate, useNavigate } from "react-router";
import { Button, Card } from "antd";
import { Formik, Form } from "formik";
import toast from "react-hot-toast";
import FormInput from "@/components/fields/FormInput";
import { authService } from "@/services/authService";
import { loginSchema } from "@/utils/validations";

function Login() {
  const navigate = useNavigate();

  if (localStorage.getItem("login")) return <Navigate to="/main" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <Card title="Sign in" className="w-full max-w-sm">
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values) => {
            try {
              const res = await authService.login(values);
              localStorage.setItem("login", JSON.stringify(res));
              if (res.user?.organizationId != null) {
                localStorage.setItem("org", String(res.user.organizationId));
              }
              navigate("/main");
            } catch {
              toast.error("Invalid credentials");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-3">
              <FormInput name="username" label="Username" />
              <FormInput name="password" label="Password" type="password" />
              <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                Sign in
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
}

export const authRoutes: RouteObject[] = [{ path: "login", element: <Login />, handle: { title: "Login" } }];
