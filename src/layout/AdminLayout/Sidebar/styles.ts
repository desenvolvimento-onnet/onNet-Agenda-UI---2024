import { NavLink } from "react-router-dom";
import styled from "styled-components";

export const Container = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 4rem;
  height: 100%;

  background: var(--tertiary);

  transition: all 0.2s;

  &.active {
    width: 15rem;
  }
`;

export const CloseMenu = styled.button`
  --size: 2rem;

  position: absolute;

  top: 0;
  right: 0;

  width: calc(var(--size) + 4px);
  height: calc(var(--size) + 4px);

  background: transparent;
  border: 4px solid var(--tertiary);
  outline: 0;
  border-right-color: transparent;
  border-top-color: transparent;
  outline: 0;
  border-radius: 50%;

  transform: translateX(50%) translateY(50%) rotate(45deg);

  z-index: 11;

  transition: all 0.2s;

  cursor: pointer;

  &:hover {
    transform: translateX(50%) translateY(50%) rotate(45deg) scale(1.2);
  }
`;

export const NavIcon = styled.div`
  --depth: calc(var(--size) * 0.15);

  position: relative;

  height: 100%;

  padding: calc(var(--depth) - 2px);

  border-radius: 50%;
  background: white;
  box-shadow: 3px 1px 4px var(--box-shadow);

  transform: rotate(-45deg);
  transition: all 0.2s ease-out;

  &:before,
  &:after {
    position: absolute;

    content: "";

    display: block;

    width: calc(100% - (var(--depth) - 2px) * 2);
    height: var(--depth);

    background: var(--primary-dark);

    transition: all 0.2s ease-out;
  }

  &:before {
    top: calc(var(--depth) * 1.5);
  }

  &:after {
    top: calc(100% - 2.5 * var(--depth));
  }

  &.close {
    &:before,
    &:after {
      top: calc(50% - var(--depth) / 2);
    }

    &:before {
      transform: rotate(45deg);
    }
    &:after {
      transform: rotate(-45deg);
    }
  }
`;

export const LinkHome = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 0.3rem;

  margin: 2rem auto 0.5rem;
  padding: 0.5rem;

  border-radius: 0 0.5rem;
  background: var(--background);

  color: var(--secondary);
  text-align: right;

  img {
    height: 2rem;
  }

  h2 {
    display: flex;
    flex-direction: column;

    font-family: Mina, sans-serif;
    font-size: 18pt;

    filter: brightness(0.7);

    line-height: 1rem;

    letter-spacing: -1px;

    span {
      font-family: Mina, sans-serif;
      font-size: 12pt;
    }
  }

  &.opened {
    padding: 0 0.5rem;

    img {
      height: 3rem;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;

  overflow: hidden;

  height: 100%;
`;
