import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  width: 100%;
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

    hr {
      margin: 0;
    }

    div.line {
      display: flex;
      align-items: center;

      gap: 1rem;

      > *:not(span) {
        flex: 1;
      }

      .small {
        flex: 0.5;
      }
    }
  }
`;
