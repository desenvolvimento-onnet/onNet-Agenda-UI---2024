import styled from "styled-components";

export const Container = styled.form`
  display: flex;
  flex-direction: column;

  top: 0;

  width: 100%;
  height: 16rem;

  border-bottom: 3px solid var(--secondary-dark);
  background: var(--white);

  box-shadow: 0 6px 6px -4px var(--box-shadow);

  overflow: hidden;

  transition: all 0.2s ease;

  &.hidden {
    height: 4.25rem;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;

  gap: 1rem;

  padding: 0.5rem 1rem;

  .input-group {
    flex: 1;
    display: flex;
    align-items: center;

    gap: 1rem;

    .large {
      flex: 1;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  gap: 2rem;

  padding: 1rem;
  margin-top: 1rem;

  transition: all 0.2s ease;

  &.hidden {
    opacity: 0;

    overflow: hidden;
  }

  .line {
    display: flex;

    gap: 1rem;

    > * {
      flex: 1;
    }
  }
`;
