import styled from "styled-components";

export const Container = styled.div`
  display: grid;

  grid-template-columns: 1fr 19.5rem;
  grid-template-rows: 3rem calc(100% - 4rem);
  grid-column-gap: 2rem;
  grid-row-gap: 1rem;

  height: calc(100vh - 4rem);

  padding: 1rem;

  background: var(--background);

  > button {
    margin-top: auto;
  }
`;

export const ShiftList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  row-gap: 2rem;

  padding: 1rem;

  overflow: auto;

  background: var(--white);
  box-shadow: 2px 2px 6px 0 var(--box-shadow);
`;

export const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  padding: 1rem 0;

  strong {
    font-size: 10pt;

    margin: auto;
    margin-bottom: 2rem;
  }

  .info {
    display: flex;
    flex-direction: column;

    h4 {
      color: var(--secondary-dark);
      text-align: center;

      margin-bottom: 0.5rem;
    }

    ul {
      padding: 0 2rem;

      list-style: disc;

      background: var(--background);
      box-shadow: inset 2px 2px 8px -5px var(--box-shadow);
      border-radius: 0.2rem;

      li {
        margin: 0.5rem 0;

        transition: background-color 0.1s;

        > div {
          display: flex;
          align-items: center;

          padding: 0.3rem;

          text-transform: capitalize;

          span {
            margin-left: auto;
            padding: 0.2rem 0.3rem;

            border-radius: 0.2rem;
            background: var(--secondary-dark);
            box-shadow: 1px 1px 4px 0 var(--box-shadow);

            color: var(--white);
            font-size: 9pt;
            text-transform: none;
          }
        }

        &:hover {
          background: var(--box-shadow);

          font-weight: 500;
        }
      }
    }
  }

  .shift {
    text-align: center;

    font-weight: 700;
    font-size: 11pt;
  }
`;
