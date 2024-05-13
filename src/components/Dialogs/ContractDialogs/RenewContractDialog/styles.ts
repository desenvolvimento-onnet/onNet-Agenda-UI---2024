import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0.5rem;

  gap: 2rem;

  strong,
  span {
    text-align: center;
    font-size: 10pt;
  }

  span {
    text-align: left;
  }

  .contract-data {
    display: flex;
    flex-direction: column;

    gap: 2rem;

    padding: 1rem;

    border-radius: 0.2rem;
    background: #e8e8e8;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 2rem;
  }

  .line {
    flex: 1;

    display: flex;
    align-items: flex-end;

    gap: 1rem;

    > * {
      flex: 1;
    }

    .short {
      flex: 0.5;

      max-width: fit-content;
    }
  }
`;
