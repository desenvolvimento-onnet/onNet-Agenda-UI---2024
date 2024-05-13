import styled from "styled-components";

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  gap: 2rem;

  overflow: auto;
`;

export const SelectedNumberList = styled.div`
  display: flex;
  align-items: center;

  div.list {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    gap: 0.5rem;

    height: 100%;
    max-height: 15rem;

    margin: 0 2rem;
    padding-left: 2rem;

    border-left: 1px solid var(--gray-light);

    overflow: auto;
  }

  div.button-group {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    button {
      min-width: 10rem;
    }
  }
`;

export const NumberList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  column-gap: 0.5rem;
  row-gap: 2.5rem;

  button {
    height: 2.5rem;

    padding: 0.5rem;

    border-radius: 0;
    background: var(--background);

    transition: border 0s;

    &:hover {
      background: var(--box-shadow);
    }

    &.selected {
      border: 2px dashed var(--secondary);

      &.portability {
        border: 2px dashed var(--gray);
      }
    }
  }
`;
