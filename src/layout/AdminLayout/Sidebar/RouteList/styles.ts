import styled from "styled-components";

export const Container = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;

  margin: 2rem 0;

  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    width: 0.6rem;
  }

  ::-webkit-scrollbar-thumb {
    background: #848484;
    border-right: 4px solid var(--tertiary);
  }

  ::-webkit-scrollbar-track {
    background: var(--tertiary);
  }

  hr {
    margin: 0.5rem 1rem;

    border-color: var(--gray);

    opacity: 0.6;
  }

  a {
    position: relative;

    display: flex;
    align-items: center;

    gap: 1rem;

    height: 3rem;
    min-height: 3rem;

    padding-left: 1.3rem;

    color: var(--white);
    font-size: 10.5pt;
    text-decoration: none;

    transition: all 0.2s ease-in, background-color 0.2s;

    svg {
      min-width: 1.3rem;
      min-height: 1.3rem;
    }

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    svg,
    span {
      transition: all 0.2s;
    }

    &:hover {
      background: var(--box-shadow);
    }

    &:before {
      position: absolute;

      content: "";

      top: 0;
      left: 0;

      width: 0.3rem;
      height: calc(100% - 0.6rem);

      margin: 0.3rem 0;

      background: transparent;

      transition: all 0.2s;
    }

    &.active {
      background: var(--box-shadow);

      &:before {
        background: var(--primary-dark);
      }

      svg {
        color: var(--primary-dark);
      }
    }

    &.short {
      flex-direction: column;
      justify-content: center;

      padding: 0.5rem;

      &:before {
        width: 0;
      }
    }

    &.spaced {
      margin-top: auto;
    }
  }
`;
