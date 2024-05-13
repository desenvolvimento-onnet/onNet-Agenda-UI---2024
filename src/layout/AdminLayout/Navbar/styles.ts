import { Menu } from "@material-ui/core";
import styled from "styled-components";

export const Container = styled.div`
  height: 14rem;
`;

export const Content = styled.div`
  position: sticky;

  display: flex;
  align-items: center;
  justify-content: space-between;

  top: 0;

  padding: 0.8rem 3rem;

  p {
    color: var(--white);

    font-size: 14pt;
    font-weight: bold;
    font-family: "Roboto";
  }

  z-index: 10;
`;

export const Person = styled.button`
  display: flex;
  align-items: center;

  gap: 1rem;

  border: 0;
  background: transparent;

  cursor: pointer;

  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    line-height: 1.2rem;

    p {
      font-weight: 600;
    }

    span {
      color: var(--white);
      font-weight: 500;
    }
  }

  > span {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 2.2rem;
    height: 2.2rem;

    border-radius: 50%;
    background: var(--white);

    color: var(--primary);
    font-size: 1.4rem;
  }
`;

export const MenuStyled = styled(Menu)`
  hr {
    margin: 0.5rem;
  }

  span,
  svg {
    color: var(--gray);
  }
`;

export const DialogContainer = styled.div`
  display: flex;

  padding: 1rem;

  form {
    display: flex;
    flex-direction: column;

    gap: 1rem;

    width: 100%;
  }

  .line {
    display: flex;

    gap: 1.5rem;

    > * {
      flex: 1;
    }
  }
`;
