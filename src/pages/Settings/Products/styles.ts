import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;

  padding: 1rem;

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 2rem;

    div.line {
      display: flex;
      align-items: flex-end;

      gap: 1rem;

      > * {
        flex: 1;
      }

      .short {
        flex: 0.5;

        display: flex;
        justify-content: center;
      }
    }
  }
`;
