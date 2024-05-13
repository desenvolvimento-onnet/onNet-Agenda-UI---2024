import styled from "styled-components";

export const Container = styled.div`
  display: flex;

  gap: 0.2rem;

  min-width: 3.5rem;

  padding: 0 0.3rem;

  &:hover .icon + .icon {
    margin-left: unset !important;
  }
`;

export const Coin = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 2rem;
  height: 2rem;

  border-radius: 50%;
  box-shadow: 3px 3px 8px 0 var(--box-shadow);

  transition: all 0.15s;

  svg {
    color: var(--white);
    font-size: 15pt;
  }

  & + &.icon {
    margin-left: -50%;
  }

  &.blue {
    background: var(--secondary);
  }

  &.green {
    background: var(--success);
  }

  &.orange {
    background: var(--warning);
  }

  &.red {
    background: var(--danger);
  }

  &.gold {
    background: var(--gold);
  }

  &.iceGreen {
    background: var(--primary);
  }
`;
