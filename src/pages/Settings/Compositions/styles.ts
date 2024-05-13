import styled from "styled-components";

export const Container = styled.div`
  display: flex;

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

    gap: 2rem;

    input {
      flex: 1;
    }
  }
`;

export const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: 1rem;

  gap: 1rem;

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 2rem;

    padding: 0 1rem 1rem;

    border-bottom: 1px solid var(--gray-light);

    > * {
      min-width: 8rem;
    }
  }
`;

export const ItemsContent = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.5rem;

  padding: 1rem;
  margin-top: 1rem;

  background: var(--background);
`;
