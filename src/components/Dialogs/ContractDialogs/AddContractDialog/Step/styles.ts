import styled from "styled-components";

export const Container = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;

  gap: 2rem;

  padding: 1rem;
  padding-bottom: 0;

  background: var(--background);

  &.hidden {
    display: none;
  }

  div.line {
    display: flex;
    align-items: center;

    gap: 1rem;

    > * {
      flex: 1;
    }

    .small {
      flex: 0.5;

      display: flex;
    }

    &.hidden {
      display: none;
    }
  }

  div.input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    gap: 2rem;

    padding: 1rem;
    padding-bottom: 0;
  }

  div.button-group {
    position: sticky;

    display: flex;
    align-items: center;
    justify-content: space-around;

    bottom: 0;

    padding-bottom: 1rem;

    background: var(--background);

    z-index: 2;

    button:disabled {
      opacity: 0;
    }
  }
`;
