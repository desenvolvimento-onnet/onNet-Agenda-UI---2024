import styled from "styled-components";

export const Container = styled.table`
  width: 100%;
  height: fit-content;

  .no-background {
    background: transparent !important;
  }

  .no-content {
    padding-right: 0;
    padding-left: 0;
  }

  .short {
    width: 3rem;

    padding: 0 0.5rem;
  }
`;

export const THead = styled.thead``;

export const TBody = styled.tbody`
  tr {
    height: 3rem;

    background: var(--white);

    &:hover td {
      background: var(--box-shadow);
    }
  }
`;

export const ThContainer = styled.th`
  padding: 0.5rem;

  text-align: left;

  font-size: 11pt;
  font-weight: normal;

  color: var(--gray);
  font-family: "Catamaran";

  &:first-child {
    font-weight: bold;
    color: var(--secondary);
  }
`;

export const TdContainer = styled.td`
  padding: 0.5rem 0.7rem;

  font-size: 10pt;
  font-weight: 500;
  text-align: center;
  color: var(--gray);

  background: var(--background);

  transition: all 0.2s;

  &:first-child {
    --before-width: 0.3rem;

    position: relative;

    padding-left: calc(0.7rem + var(--before-width));

    &:before {
      position: absolute;

      content: "";

      top: 0;
      left: 0;
      bottom: 0;

      width: var(--before-width);

      background: var(--secondary-dark);
    }
  }
`;
