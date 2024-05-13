import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";

import Pagination from "../../models/Pagination";
import Button from "../Button";

import { Container } from "./styles";

interface PaginateFooterProps {
  pagination: Omit<Pagination<any>, "data">;
  onReload?: (page: number, perPage: number) => void;
  background?: string;
}

const PaginateFooter: React.FC<PaginateFooterProps> = ({
  pagination,
  onReload,
  background = "var(--white)",
}) => {
  return (
    <Container style={{ background }}>
      <div>
        <Button
          title="Primeira página"
          icon={<BsChevronDoubleLeft />}
          iconSize={15}
          height={2}
          background="var(--secondary-dark)"
          disabled={pagination.page <= 1}
          onClick={() => onReload && onReload(1, pagination.perPage)}
        />

        <Button
          title="Página anterior"
          icon={<BsChevronLeft />}
          iconSize={15}
          height={2}
          background="var(--secondary-dark)"
          disabled={pagination.page <= 1}
          onClick={() =>
            onReload &&
            onReload(Math.abs(pagination.page - 1) || 1, pagination.perPage)
          }
        />

        <p>
          {pagination.page} / {pagination.lastPage}
        </p>

        <Button
          title="Próxima página"
          icon={<BsChevronRight />}
          iconSize={15}
          height={2}
          background="var(--secondary-dark)"
          disabled={pagination.page >= pagination.lastPage}
          onClick={() =>
            onReload && onReload(pagination.page + 1, pagination.perPage)
          }
        />

        <Button
          title="Última página"
          icon={<BsChevronDoubleRight />}
          iconSize={15}
          height={2}
          background="var(--secondary-dark)"
          disabled={pagination.page >= pagination.lastPage}
          onClick={() =>
            onReload && onReload(pagination.lastPage, pagination.perPage)
          }
        />

        <FormControl className="itens-per-page">
          <InputLabel>Itens por página</InputLabel>

          <Select
            name="per_page"
            value={pagination.perPage}
            onChange={(ev) =>
              onReload && onReload(1, Math.abs(Number(ev.target.value)))
            }
          >
            <MenuItem value={10}>10 itens</MenuItem>
            <MenuItem value={20}>20 itens</MenuItem>
            <MenuItem value={50}>50 itens</MenuItem>
            <MenuItem value={100}>100 itens</MenuItem>
            <MenuItem value={200}>200 itens</MenuItem>
            <MenuItem value={400}>400 itens</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div>
        <p>Total: {pagination.total}</p>
      </div>
    </Container>
  );
};

export default PaginateFooter;
