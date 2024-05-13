import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  padding: 1rem 0;

  form {
    flex: 1;
    display: flex;
    flex-direction: column;

    gap: 1rem;

    strong {
      font-size: 10pt;
      text-align: center;
    }
  }
`;
