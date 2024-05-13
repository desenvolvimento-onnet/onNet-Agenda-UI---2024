import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 1rem 0;

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 1rem;

    input {
      flex: 1;
    }
  }
`;

export const List = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

  p.info {
    margin-bottom: 2rem;

    text-align: center;
    font-weight: 500;
    font-size: 11pt;
  }
`;
