import React from "react";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

const Error: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex justify-center items-center bg-primary-bg">
      <Result
        status="error"
        title={t("error.title")}
        subTitle={t("error.subtitle")}
        extra={
          <Button
            type="primary"
            danger
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            {t("error.reload")}
          </Button>
        }
      />
    </div>
  );
};

export default Error;


