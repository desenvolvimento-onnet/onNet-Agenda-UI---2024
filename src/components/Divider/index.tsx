import React from "react";
import { HTMLAttributes } from "react";

import { Container } from "./styles";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {}

const Divider: React.FC<DividerProps> = (props) => {
  return <Container {...props} />;
};

export default Divider;
