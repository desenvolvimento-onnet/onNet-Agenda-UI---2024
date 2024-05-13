import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

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

    gap: 1rem;

    input {
      flex: 1;
    }
  }

  .roles {
    width: 100%;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    p {
      margin-bottom: 1rem;
    }

    .line {
      display: flex;

      gap: 1rem;

      &:not(.fitContent) > * {
        flex: 1;
      }

      & + .line {
        margin-top: 2rem;
      }
    }
  }
`;
