import styled from "styled-components";

export const Container = styled.section`
  padding: 1rem;

  .accordion-header {
    display: flex;
    align-items: center;

    gap: 0.5rem;

    color: var(--gray);
  }

  .accordion-container {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    padding: 0 2rem 1rem;

    font-size: 11pt;

    hr {
      margin: 0;
    }

    ul {
      list-style: circle;
      border: 0;
    }

    p.small {
      font-size: 10pt;
    }

    .exemple-group {
      display: flex;
      flex-direction: column;

      gap: 1rem;

      margin-top: 3.5rem;
    }

    .exemple {
      display: flex;
      flex-direction: column;

      gap: 0.5rem;

      span {
        width: 100%;

        padding: 0.5rem 1rem;

        background: var(--box-shadow);
        border-radius: 0.2rem;
      }

      & + .exemple {
        margin-top: 1rem;
      }
    }

    .line {
      display: flex;
      align-items: center;

      gap: 1rem;

      > * {
        flex: 1;

        min-width: fit-content;
      }

      & + .line {
        margin-top: 1rem;
      }

      .exemple {
        margin: 0;
      }
    }
  }

  .seach-field {
    margin-top: 2rem;
  }

  ul {
    list-style: none;

    li {
      margin: 0.2rem 0;

      ul {
        margin: 1rem 0;
        margin-left: 3rem;

        padding: 0 1rem;

        border-left: 2px solid var(--gray-light);
      }
    }
  }
`;
