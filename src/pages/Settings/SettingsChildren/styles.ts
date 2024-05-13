import styled from "styled-components";

export const Container = styled.div`
  flex: 1;

  margin: 2rem 4rem;
  padding: 1rem;

  border-radius: 0.2rem;
  background: var(--white);
  box-shadow: 3px 3px 8px 0 var(--box-shadow);
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-bottom: 3rem;

  .flex-start {
    align-self: flex-start;
  }
`;
