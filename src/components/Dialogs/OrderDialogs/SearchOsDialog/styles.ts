import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;
`;

export const Content = styled.div`
  display: flex;

  min-width: 30rem;

  padding: 1rem 0;
`;

export const Filter = styled.div`
  display: flex;
  align-items: flex-end;

  gap: 2rem;

  button {
    min-width: 8rem;
  }
`;
