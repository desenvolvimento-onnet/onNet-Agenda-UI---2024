import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: calc(50% - 0.5rem);
  height: fit-content;

  padding: 1rem;

  background: var(--background);

  .disabled {
    opacity: 0.6;
  }
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > h2 {
    font-size: 14pt;
    text-transform: capitalize;

    color: var(--secondary-dark);

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    &.disabled {
      color: var(--danger);
    }
  }

  button {
    border-radius: 50%;
    box-shadow: 2px 2px 4px 2px var(--box-shadow);

    &:hover {
      transform: scale(1.1);
    }
  }
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0.5rem;

  margin: 1rem 0;

  > strong,
  > div > span {
    font-size: 11pt;
    color: var(--gray);
  }
`;

export const Vacancy = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 2.2rem;

  padding: 0.2rem .5rem;

  border-radius: 0.1rem;

  > span {
    margin-right: 1rem;
  }

  > div {
    display: flex;

    gap: 0.5rem;
  }

  .button-group {
    display: none;
  }

  &:hover,
  &:focus {
    background: var(--box-shadow);

    .button-group {
      display: flex;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;

  gap: 0.5rem;

  margin-top: 1rem;

  .full-width {
    flex: 1;
  }
`;
