import React, { TdHTMLAttributes, ThHTMLAttributes } from "react";
import { memo } from "react";
import { TableHTMLAttributes } from "react";

import { Container, THead, TBody, ThContainer, TdContainer } from "./styles";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {}

interface ThProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  noBackground?: boolean;
  noContent?: boolean;
  short?: boolean;
}

export interface TdProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  noBackground?: boolean;
  noContent?: boolean;
  noWrap?: boolean;
  short?: boolean;
}

const Table: React.FC<TableProps> = ({ children, ...props }) => {
  return <Container {...props}>{children}</Container>;
};

const Th: React.FC<ThProps> = ({
  noBackground,
  noContent,
  short,
  children,
  ...props
}) => {
  return (
    <ThContainer
      className={`${noBackground ? "no-background" : ""} ${
        noContent ? "no-content" : ""
      } ${short ? "short" : ""} ${props.className || ""}`}
      {...props}
    >
      {children}
    </ThContainer>
  );
};

const Td: React.FC<TdProps> = memo<TdProps>(
  ({ noBackground, noContent, short, noWrap, children, style, ...props }) => {
    return (
      <TdContainer
        className={`${noBackground ? "no-background" : ""} ${
          noContent ? "no-content" : ""
        } ${short ? "short" : ""} ${props.className || ""}`}
        style={{ whiteSpace: noWrap ? "nowrap" : "normal", ...style }}
        {...props}
      >
        {children}
      </TdContainer>
    );
  }
);

export { Table, THead, TBody, Th, Td };
