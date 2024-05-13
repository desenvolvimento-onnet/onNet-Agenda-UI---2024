import { HTMLAttributes } from "react";
import { Container } from "./styles";

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  active: boolean;
  children: React.ReactNode;
}

const TabBar: React.FC<TabBarProps> = ({ active, children, ...props }) => {
  return (
    <Container hidden={!active} {...props}>
      {children}
    </Container>
  );
};

export default TabBar;
