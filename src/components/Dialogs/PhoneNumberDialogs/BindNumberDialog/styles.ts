import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  padding: 0.5rem 0;

  text-align: center;

  form {
    display: flex;
    align-items: flex-end;

    gap: 2rem;

    > div {
      flex: 1;
    }
  }

  .radio-group {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    .radio-item {
      margin: 0;
      padding: 0.5rem;

      border: 1px solid var(--gray-light);
      border-radius: 0.2rem;

      transition: all 0.2s;

      &.selected {
        border: 1px solid var(--secondary);
        background: var(--background);
      }

      .radio-item-content {
        text-align: left;

        p {
          font-size: 11pt;
          font-weight: 500;
        }

        span {
          font-size: 10pt;
        }
      }
    }
  }
`;
