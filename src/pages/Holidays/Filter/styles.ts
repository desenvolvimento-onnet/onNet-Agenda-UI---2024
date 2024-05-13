import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;

  gap: 1rem;

  form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 1rem;

    input {
      width: 4rem;
    }

    .large input {
      width: 15rem;
    }
  }
`;
