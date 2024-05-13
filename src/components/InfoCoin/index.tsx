import { HTMLAttributes } from "react";

import { Container, Coin } from "./styles";

export interface InfoCoinContainerProps
  extends HTMLAttributes<HTMLDivElement> {}

export interface InfoCoinProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: React.ReactNode;
  type: "blue" | "green" | "orange" | "red" | "gold" | "iceGreen";
}

const InfoCoinContainer: React.FC<InfoCoinContainerProps> = ({
  children,
  ...props
}) => {
  return <Container {...props}>{children}</Container>;
};

const InfoCoin: React.FC<InfoCoinProps> = ({ title, icon, type, ...props }) => {
  return (
    <Coin
      className={`icon centralize ${type} ${props.className || ""}`}
      title={title}
      {...props}
    >
      {icon}
    </Coin>
  );
};

export { InfoCoinContainer, InfoCoin };
