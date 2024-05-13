import React from "react";

import { LinkProps } from "react-router-dom";

import { Container } from "./styles";

interface CardLinkProps extends LinkProps {
  name: string;
  icon: React.ReactNode;
}

const CardLink: React.FC<CardLinkProps> = ({ name, icon, ...props }) => {
  return (
    <Container {...props}>
      {icon}

      <h4>{name}</h4>
    </Container>
  );
};

export default CardLink;
