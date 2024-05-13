import { ChangeEvent } from "react";

import { Accordion, AccordionSummary, TextField } from "@material-ui/core";
import { BsQuestionCircle } from "react-icons/bs";
import { MdExpandMore } from "react-icons/md";

import Divider from "../../../../../components/Divider";

import { Container } from "./styles";

export interface TabBarProps {
  accordionChildren: React.ReactNode;
  active: boolean;
  queryValue: string;
  onQueryChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  active,
  accordionChildren,
  children,
  queryValue,
  onQueryChange,
}) => {
  return (
    <Container hidden={!active}>
      <Accordion style={{ background: "var(--background)" }}>
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <div className="accordion-header">
            <BsQuestionCircle />
            <h3>Modo de usar</h3>
          </div>
        </AccordionSummary>

        {accordionChildren}
      </Accordion>
      <TextField
        className="seach-field"
        label="Buscar"
        value={queryValue}
        onChange={onQueryChange}
        type="search"
        variant="outlined"
        margin="dense"
      />

      <Divider />

      {children}
    </Container>
  );
};

export default TabBar;
