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

      .short {
        flex: .5;
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
  }
`;
