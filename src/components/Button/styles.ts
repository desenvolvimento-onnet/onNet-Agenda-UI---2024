import styled from "styled-components";

import { ButtonProps } from ".";

export const Container = styled.button<ButtonProps>`
  --button-height: ${(props) => props.height}rem;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: var(--button-height);

  padding: 0.5rem 1rem;
  padding-left: ${(props) =>
    props.icon ? "calc(var(--button-height) + 1rem)" : "1rem"};

  &.is-void {
    padding-right: 0;
    padding-left: ${(props) => (props.icon ? "var(--button-height)" : 0)};
  }

  background: ${(props) =>
    props.secondary ? "transparent" : props.background};
  border: ${(props) =>
    props.secondary ? `1px solid ${props.background}` : "none"};
  border-radius: 0.15rem;

  font-family: "Catamaran";
  font-weight: 700;
  font-size: ${(props) => props.size}pt;
  color: ${(props) => (props.secondary ? `${props.background}` : props.color)};

  overflow: hidden;
  transition: all 0.2s;

  cursor: pointer;

  &:disabled {
    opacity: 0.5;

    cursor: default;
  }
`;

export const IconContent = styled.div<ButtonProps>`
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: center;

  top: 0;
  left: 0;
  bottom: 0;

  width: var(--button-height);
  height: var(--button-height);

  > * {
    z-index: 2;
  }

  span {
    position: absolute;

    width: 100%;
    height: 100%;

    background: ${(props) =>
      props.secondary ? props.background : "var(--black)"};

    opacity: 0.2;

    z-index: 1;
  }

  font-size: ${(props) => props.iconSize}pt;

  overflow: hidden;
`;
