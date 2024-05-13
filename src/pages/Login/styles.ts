import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  height: 100%;
`;

export const Content = styled.div`
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 2rem;
  padding-bottom: 0;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  gap: 1rem;

  width: 23rem;
  height: 100%;
  min-width: 18rem;
  max-height: 33rem;

  margin: 0 auto;
  padding: 2rem;

  background: var(--white);
  box-shadow: 0 0 64px var(--box-shadow);
  border-radius: 0.1rem;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 4rem;
  }
`;

export const DividerLogo = styled.div`
  position: relative;

  opacity: 0.5;

  hr {
    margin: 1rem 0;
  }

  span {
    position: absolute;

    top: 50%;
    left: 50%;

    padding: 0.5rem 1rem;

    background: var(--white);

    font-family: Catamaran, sans-serif;
    font-size: 14pt;
    font-weight: 600;

    transform: translate(-50%, -50%);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;

  gap: 1rem;

  input {
    font-size: 11pt;
  }

  > button {
    margin-top: 1rem;
  }

  .remember {
    align-self: flex-end;

    > span:last-child {
      font-size: 11pt;

      color: var(--gray);
    }
  }
`;

export const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  padding-bottom: 0.8rem;

  opacity: 0.7;

  a,
  span {
    font-size: 10pt;

    color: var(--black);
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    width: 4rem;
  }
`;
