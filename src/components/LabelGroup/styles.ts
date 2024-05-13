import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;

  gap: 1rem;

  > span {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 2.5rem;
    min-width: 2.5rem;
    height: 2.5rem;

    border: 1px solid var(--gray);
    border-radius: 50%;
  }

  > div {
    > p {
      font-size: 9pt;
      font-weight: bold;
      font-family: Catamaran, sans-serif;
      color: var(--secondary);
      text-transform: uppercase;
    }

    > div {
      font-size: 11pt;
      font-weight: 500;
      white-space: pre-line;

      opacity: 0.9;

      > i {
        font-weight: normal;
      }
    }
  }
`;
