import React, { HTMLAttributes } from "react";

import { Container } from "./styles";

const MessageInfo: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  ...props
}) => {
  return <Container {...props}>{children}</Container>;
};

export default MessageInfo;
