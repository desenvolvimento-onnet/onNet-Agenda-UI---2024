import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  padding: 1rem;

  height: calc(100vh - 4rem);

  background: var(--background);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  padding: 2rem;

  border: 0;
  background: var(--white);
  box-shadow: 2px 2px 6px 0 var(--box-shadow);

  > button {
    align-self: center;

    width: 15rem;
  } 
`;
