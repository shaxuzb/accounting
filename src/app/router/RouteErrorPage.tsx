import React from "react";
import { Button, Result } from "antd";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { useTranslation } from "react-i18next";

/** Mavjud bo'lmagan manzil uchun sahifa. Route'ning oddiy elementi sifatida ishlatiladi. */
export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        status="404"
        title="404"
        subTitle={t("error.pageNotFound")}
        extra={
          <Button type="primary" onClick={() => navigate("/main/dashboard")}>
            {t("error.goHome")}
          </Button>
        }
      />
    </div>
  );
};

/**
 * Router darajasidagi `errorElement`. Ilgari bu yerda hech narsa bo'lmagani uchun
 * noto'g'ri manzil React Router'ning xom "Unexpected Application Error" ekranini
 * ko'rsatardi.
 */
const RouteErrorPage: React.FC = () => {
  const error = useRouteError();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="bg-primary-bg flex h-screen items-center justify-center">
        <Result
          status="404"
          title="404"
          subTitle={t("error.pageNotFound")}
          extra={
            <Button type="primary" onClick={() => navigate("/main/dashboard")}>
              {t("error.goHome")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-primary-bg flex h-screen items-center justify-center">
      <Result
        status="error"
        title={t("error.title")}
        subTitle={t("error.subtitle")}
        extra={
          <Button type="primary" danger onClick={() => window.location.reload()}>
            {t("error.reload")}
          </Button>
        }
      />
    </div>
  );
};

export default RouteErrorPage;
