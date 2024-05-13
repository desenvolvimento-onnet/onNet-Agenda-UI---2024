import React, { ButtonHTMLAttributes } from "react";

import { Container, IconContent } from "./styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  background?: string;
  height?: number;
  secondary?: boolean;
  color?: string;
  size?: number;
  icon?: React.ReactNode;
  iconSize?: number;
}

const Button: React.FC<ButtonProps> = ({
  title,
  background = "var(--primary)",
  height = 2.5,
  secondary = false,
  color = "var(--white)",
  size = 12,
  icon,
  iconSize = size,
  className,
  children,
  ...props
}) => {
  return (
    <Container
      {...props}
      title={title}
      background={background}
      height={height}
      secondary={secondary}
      color={color}
      size={size}
      icon={icon}
      className={`${className || ""} ${(!children && "is-void") || ""}`}
    >
      {icon && (
        <IconContent
          title={title}
          secondary={secondary}
          background={background}
          iconSize={iconSize}
        >
          <span></span>
          {icon}
        </IconContent>
      )}

      {children}
    </Container>
  );
};

export default Button;
