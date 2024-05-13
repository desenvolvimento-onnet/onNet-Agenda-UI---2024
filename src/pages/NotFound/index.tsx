import React from "react";

import { FiAlertTriangle } from "react-icons/fi";
import { useHistory } from "react-router";

import { Container } from "./styles";

const NotFound: React.FC = () => {
  const { goBack } = useHistory();

  return (
    <Container>
      <FiAlertTriangle />
      <h1>404 - Ops!</h1>
      <h2>Esta página não foi encontrada...</h2>
      <button onClick={goBack}>Voltar</button>
    </Container>
  );
};

export default NotFound;
