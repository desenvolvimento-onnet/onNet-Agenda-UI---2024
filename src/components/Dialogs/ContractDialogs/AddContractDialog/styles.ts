import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 0.5rem 0;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  height: calc(100vh - 20rem);

  overflow: auto;
`;
