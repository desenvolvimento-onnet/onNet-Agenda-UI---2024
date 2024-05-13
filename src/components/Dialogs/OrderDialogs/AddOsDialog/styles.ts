import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  padding: 0.5rem 0;
`;

export const Filter = styled.form`
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

  button {
    min-width: 8rem;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  .line {
    display: flex;
    gap: 1rem;

    > * {
      flex: 1;
    }
  }

  .os-data {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 2rem;

    padding: 1rem 2rem;

    border-radius: 0.2rem;
    background: #e8e8e8;
  }

  .switch-rural {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
