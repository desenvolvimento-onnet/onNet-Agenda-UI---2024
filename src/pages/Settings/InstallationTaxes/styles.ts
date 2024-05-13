import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;

  padding: 1rem 0;

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 2rem;

    div.line {
      display: flex;

      gap: 1rem;

      > * {
        flex: 1;
      }
    }
  }
`;
