import styled from "styled-components";

export const Container = styled.div`
  border-top: 1px solid var(--gray-light);

  padding: 1rem;

  .header {
    flex: 1;

    display: flex;
    align-items: center;

    gap: 0.5rem;

    color: var(--gray);
    font-size: 11pt;

    h3 {
      text-transform: uppercase;
      font-size: 11pt;

      opacity: 0.9;
    }
  }

  .spaced {
    justify-content: space-between;
  }

  .accordion-container {
    border: 1px solid var(--gray-light);
    box-shadow: 3px 3px 10px var(--box-shadow);
  }

  section {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    fieldset {
      border: 0;
      box-shadow: 0 0 4px var(--gray-light);

      legend {
        font-size: 10pt;
        font-weight: bold;
        color: var(--gray);
      }

      &.detach {
        box-shadow: none;
      }
    }

    .print-button {
      max-width: fit-content;
      margin: 0 0.5rem;
    }

    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0.5rem 1rem;

      > * {
        flex: 1;
      }

      .large {
        flex: 2;
      }

      .end {
        justify-content: flex-end;
        text-align: end;
      }

      .center {
        justify-content: center;
        text-align: center;
      }

      &.detach {
        background: var(--background);
      }
    }

    &.accordion {
      padding: 1rem;

      div {
        color: var(--gray);
      }
    }

    &.multiple {
      gap: 0;

      padding: 1rem;

      box-shadow: 3px 3px 10px var(--box-shadow);
      border: 1px solid var(--gray-light);
      border-radius: 0.2rem;

      & + .multiple {
        margin-top: 2rem;
      }

      .line.detach {
        background: var(--background);
      }
    }
  }
`;
