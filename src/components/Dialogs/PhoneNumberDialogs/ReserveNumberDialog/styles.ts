import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  padding: 0.5rem 0;

  text-align: center;

  h2 {
    margin-bottom: 1rem;
  }

  ul {
    padding: 0 1rem;

    li {
      text-align: left;
      font-size: 11pt;

      & + li {
        margin-top: 0.5rem;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 0 1rem;

    gap: 0.5rem;

    span {
      font-size: 11pt;
    }

    > div {
      margin-top: 1.5rem;
    }
  }
`;
