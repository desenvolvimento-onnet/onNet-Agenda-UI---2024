import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 1rem;

  height: calc(100vh - 10rem);

  margin-top: 6rem;

  svg {
    font-size: 8rem;
  }

  h1 {
    font-size: 28pt;
  }

  h2 {
    margin: 1rem;

    color: var(--gray);
    font-size: 15pt;
  }

  h1,
  h2 {
    font-family: Roboto, sans-serif;
  }

  h1,
  svg {
    color: var(--secondary-dark);
  }

  button {
    padding: 0.5rem 1rem;

    border: none;
    border-radius: .2rem;

    cursor: pointer;

    font-size: 13pt;
    font-weight: bold;
    color: var(--gray);

    transition: background-color 0.1s;

    &:hover {
      background: var(--box-shadow);
    }
  }
`;
