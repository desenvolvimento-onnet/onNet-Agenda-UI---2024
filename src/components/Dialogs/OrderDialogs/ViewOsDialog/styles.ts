import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0.5rem 0;
`;

export const TabPanel = styled.div`
  border-top: 1px solid var(--gray-light);

  padding: 1rem;

  section {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0.5rem 1rem;

      > * {
        flex: 1;
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

    &.reschedule {
      gap: 0;

      padding: 1rem;

      box-shadow: 3px 3px 10px var(--box-shadow);
      border: 1px solid var(--gray-light);
      border-radius: 0.2rem;

      & + .reschedule {
        margin-top: 2.5rem;
      }
    }
  }
`;
