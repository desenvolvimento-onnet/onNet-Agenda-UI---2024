import styled from "styled-components";

export const Container = styled.table`
  --padding-x: 0.5rem;

  width: 100%;
  height: fit-content;

  border-spacing: 0.3rem;
  border-bottom: 3px solid var(--secondary);

  background: var(--white);

  box-shadow: 3px 3px 8px 0 var(--box-shadow);

  .text-center {
    text-align: center;
  }

  .no-background {
    background: var(--white) !important;
  }

  .small {
    width: 5rem;
  }

  th,
  td {
    padding: 0.3rem var(--padding-x);
  }

  thead {
    th {
      text-align: left;

      font-size: 11pt;
      font-weight: normal;

      color: var(--gray);
      font-family: "Catamaran";

      &:first-child {
        font-weight: bold;
        color: var(--secondary);
      }
    }
  }

  tbody {
    tr {
      background: var(--background);

      td {
        font-size: 10pt;

        transition: 0.2s;

        &:first-child {
          position: relative;

          padding-left: calc(var(--padding-x) + 0.3rem);

          &:before {
            position: absolute;

            content: "";

            top: 0;
            left: 0;
            bottom: 0;

            width: 0.3rem;

            background: var(--secondary-dark);
          }
        }

        &.green {
          background: var(--success) !important;
        }

        &.red {
          background: var(--danger) !important;
        }

        &.green,
        &.red {
          color: var(--white);
          font-weight: 500;
        }
      }

      &:hover td {
        background: var(--box-shadow);
      }
    }
  }
`;
