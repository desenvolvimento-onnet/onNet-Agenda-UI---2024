import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  min-height: 10rem;
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;

  padding: 1rem 0;

  .alert {
    flex: 1;
    
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 1rem;

    padding: 0.5rem 0;

    text-align: center;

    h2 {
      margin-bottom: 1.5rem;
    }
  }

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 2rem;

    input {
      flex: 1;
    }
  }
`;
