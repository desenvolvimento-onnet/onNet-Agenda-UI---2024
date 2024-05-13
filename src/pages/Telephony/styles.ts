import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  height: 100%;

  padding: 1rem;
  padding-bottom: 4rem;

  background: var(--background);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  height: calc(100vh - 13rem);

  padding: 2rem 1rem;

  background: var(--white);
  box-shadow: 2px 2px 6px 0 var(--box-shadow);

  hr {
    margin: 0;
  }

  .gold {
    background: var(--gold) !important;
  }

  .portability {
    background: var(--primary) !important;
  }
`;

export const PrefixInfo = styled.div`
  position: absolute;

  bottom: 0;
  right: 5rem;

  display: flex;
  flex-direction: column;
  align-self: flex-end;

  width: fit-content;

  margin: 2rem auto;
  padding: 0.5rem 1rem;

  gap: 0.5rem;

  background: var(--info);
  box-shadow: 2px 2px 15px -3px var(--gray);
  border: 0;

  z-index: 1;

  overflow: hidden;
  user-select: none;

  cursor: pointer;

  > div {
    > p,
    > div {
      white-space: nowrap;
    }
  }

  p,
  span {
    color: var(--white) !important;
    border-color: var(--white);
  }

  span.prefix {
    font-weight: 400;

    &:after {
      content: "0000";

      filter: blur(3px);
    }
  }

  &.hidden {
    width: 4.5rem;
  }
`;

export const DialogContainer = styled.div`
  display: flex;
  align-items: center;

  padding: 1rem 0;

  form {
    flex: 1;

    display: flex;
    flex-direction: column;

    gap: 2rem;

    hr {
      margin: 0;
    }

    div.line {
      display: flex;
      align-items: center;

      gap: 1rem;

      > *:not(span) {
        flex: 1;
      }

      .small {
        flex: 0.5;
      }
    }
  }
`;
