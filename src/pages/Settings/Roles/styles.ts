import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;

  padding: .5rem;

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    input {
      flex: 1;
    }
  }
`;
