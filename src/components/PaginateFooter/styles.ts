import styled from "styled-components";

export const Container = styled.footer`
  position: sticky;

  display: flex;
  align-items: center;
  justify-content: space-between;

  bottom: 0;

  width: 100%;

  padding: 1rem .5rem;

  border-top: 2px solid var(--secondary-dark);

  z-index: 2;

  > div {
    display: flex;
    align-items: center;

    gap: 1rem;

    &:last-child {
      margin-right: 5.5rem;
    }

    p {
      color: var(--gray);
      font-weight: 500;
    }

    .itens-per-page {
      min-width: 10rem;

      margin: 0 2rem;
    }
  }
`;
