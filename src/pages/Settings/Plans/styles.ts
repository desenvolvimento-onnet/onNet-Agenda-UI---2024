import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 1rem;

  > * {
    width: 100%;
  }

  .alert {
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 1rem;

    padding: 0.5rem 0;

    text-align: center;

    h2 {
      margin-bottom: 1.5rem;
    }
  }

  form {
    display: flex;
    flex-direction: column;

    gap: 1.5rem;

    .line {
      display: flex;
      align-items: center;

      gap: 1rem;

      > * {
        flex: 1;
      }
    }
  }
`;
