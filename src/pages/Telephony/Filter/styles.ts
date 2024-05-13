import styled from "styled-components";

export const Container = styled.form`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 1.5rem;

  padding: 0 1rem;
`;

export const InputGroup = styled.div`
  flex: 1;

  display: flex;
  align-items: flex-end;

  gap: 1rem;

  > * {
    flex: 1;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-end;

  gap: 1rem;
`;
