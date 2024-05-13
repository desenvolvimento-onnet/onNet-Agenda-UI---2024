import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.5rem;

  height: 100%;

  padding: 2rem;
`;

export const Content = styled.div`
  padding: 1rem;

  background: var(--white);
  box-shadow: 0 0 64px var(--box-shadow);

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 8rem;
  }
`;
