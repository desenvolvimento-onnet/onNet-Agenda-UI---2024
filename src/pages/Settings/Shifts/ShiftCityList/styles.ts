import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  width: 100%;
`;

export const Item = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.5fr 0.5fr auto;

  padding: 0 1rem;

  gap: 1rem;

  button {
    align-self: flex-end;
  }
`;
