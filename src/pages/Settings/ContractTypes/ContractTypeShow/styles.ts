import styled from "styled-components";

export const Container = styled.form`
  flex: 1;

  padding: 2rem;

  background: var(--background);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;

  gap: 1rem;

  margin-bottom: 2rem;

  div.title {
    flex: 1;
    display: flex;
    justify-content: center;

    padding: 0 1rem;

    h2 {
      color: var(--gray);

      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 0.5rem;

  height: calc(100vh - 12.5rem);

  margin: 0 auto;

  div.alert {
    display: flex;
    align-items: center;
    align-self: flex-start;

    gap: 0.5rem;

    font-size: 10pt;

    span {
      padding: 0.5rem;

      font-weight: bold;
      color: var(--gray);
      background: var(--gray-light);
    }
  }
`;

export const DialogContainer = styled.div`
  height: 100%;

  overflow: auto;
`;
