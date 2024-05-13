import styled from "styled-components";

export const Container = styled.form`
  display: flex;
  align-items: center;

  gap: 2rem;

  .system {
    flex: 1;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;

    gap: 1rem;

    margin-right: 1rem;
  }

  .input-group {
    flex: 1;
    display: flex;

    gap: 1rem;

    > * {
      flex: 1;
    }
  }

  button {
    min-width: 8rem;
  }
`;
