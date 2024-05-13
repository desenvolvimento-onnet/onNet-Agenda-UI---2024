import { FormHTMLAttributes, MouseEvent } from "react";

import Button from "../../../../Button";

import { Container } from "./styles";

interface StepProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  submitTitle?: string;
  onBackStep?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const Step: React.FC<StepProps> = ({
  onBackStep,
  submitTitle = "Avançar",
  children,
  ...props
}) => {
  return (
    <Container {...props}>
      <div className="input-group">{children}</div>

      <div className="button-group">
        <Button
          title="Voltar"
          background="var(--secondary)"
          onClick={onBackStep}
          type="button"
          disabled={!Boolean(onBackStep)}
        >
          Voltar
        </Button>

        <Button title={submitTitle} background="var(--secondary)" type="submit">
          {submitTitle}
        </Button>
      </div>
    </Container>
  );
};

export default Step;
