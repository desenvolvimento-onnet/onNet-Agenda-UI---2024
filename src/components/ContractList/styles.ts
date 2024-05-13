import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0.5rem;
    margin-top: 1rem;

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
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  margin: 2rem 0;
`;
