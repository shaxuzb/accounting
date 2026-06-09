import clsx from "clsx";
import type { FC } from "react";
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  hoverable?: boolean;
}
const Card: FC<CardProps> = ({
  children,
  className,
  hoverable,
  ...customAttribute
}) => {
  return (
    <div
      className={clsx(
        `rounded-2xl backdrop-blur-md bg-primary-bg ${
          !!hoverable && "duration-200 hover:shadow-xl"
        }`,
        className,
      )}
      {...customAttribute}
    >
      {children}
    </div>
  );
};

export default Card;
