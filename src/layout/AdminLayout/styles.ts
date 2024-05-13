import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  width: 100%;
  height: 100%;

  overflow: hidden;
`;

export const Main = styled.main`
  flex: 1;

  overflow: auto;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  margin: -10rem 0 0;

  //-14rem do navbar + 8rem do margin-top
  min-height: calc(100% - 4rem);
`;
