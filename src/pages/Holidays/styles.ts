import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  flex: 1;

  padding: 2rem;

  background: var(--background);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.5rem;

  padding: 1rem;

  background: var(--white);
  box-shadow: 0 0 64px var(--box-shadow);
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 1rem 0;

  > p {
    width: 100%;
  }

  form {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    .spaced {
      margin: 0.5rem 0;
    }

    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 1rem;

      > * {
        flex: 1;
      }
    }
  }
`;
