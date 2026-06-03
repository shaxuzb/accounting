import React from "react";
import { Button, Result } from "antd";

const Error: React.FC = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-primary-bg">
      <Result
        status="error"
        title="Xatolik yuz berdi"
        subTitle="Kechirasiz, sahifani yuklashda muammo yuz berdi yoki so'rovlarda hatolik!"
        extra={
          <Button
            type="primary"
            danger
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Sahifani qayta yuklash
          </Button>
        }
      />
    </div>
  );
};

export default Error;


