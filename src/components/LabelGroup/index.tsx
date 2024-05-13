import { HTMLAttributes } from "react";

import { Container } from "./styles";

interface LabelGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  content?: string | number | React.ReactNode | null;
  emptyMessage?: string;
  icon?: React.ReactNode;
}

const LabelGroup: React.FC<LabelGroupProps> = ({
  label,
  content = "",
  emptyMessage,
  icon,
  ...props
}) => {
  return (
    <Container {...props}>
      {icon && <span>{icon}</span>}

      <div>
        <p>{label}</p>
        <div>{content || <i>{emptyMessage}</i>}</div>
      </div>
    </Container>
  );
};

export default LabelGroup;
