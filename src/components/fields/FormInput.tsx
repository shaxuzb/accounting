import { useField } from "formik";
import { Form, Input } from "antd";

interface FormInputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
}

export default function FormInput({
  name,
  label,
  type = "text",
  placeholder,
}: FormInputProps) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;
  const Component = type === "password" ? Input.Password : Input;

  return (
    <Form.Item label={label} validateStatus={error ? "error" : ""} help={error}>
      <Component
        {...field}
        type={type === "password" ? undefined : type}
        placeholder={placeholder}
      />
    </Form.Item>
  );
}
