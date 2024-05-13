import React, { memo, useCallback, useEffect, useState } from "react";

import { MdSearch } from "react-icons/md";
import { CircularProgress, DialogProps, TextField } from "@material-ui/core";

import { padronize } from "../../../../global/globalFunctions";
import { notificate } from "../../../../global/notificate";
import { CloseStatus } from "../context";

import Button from "../../../Button";
import OrderList from "../../../OrderList";
import ConfirmDialog from "../../../ConfirmDialog";
import Order from "../../../../models/Order";
import OrderService from "../../../../services/OrderService";
import MessageInfo from "../../../MessageInfo";
import Pagination from "../../../../models/Pagination";

import { Container, Content, Filter } from "./styles";

interface SearchOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  onClose: (options: CloseStatus) => void;
}

const SearchOsDialog: React.FC<SearchOsDialogProps> = ({
  index,
  open,
  onClose,
  ...props
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [orders, setOrders] = useState<Pagination<Order>>();

  async function getData(query: string, page: number, per_page: number) {
    const value = padronize(query);

    if (!value) {
      notificate({
        title: "Aviso",
        message: "Insira o nome do cliente ou código da O.S",
        type: "info",
      });

      throw new Error("Missing data");
    }

    const orders = (await OrderService.indexByQuery(value, { page, per_page }))
      .data;

    return { orders };
  }

  const refresh = useCallback(
    (page: number, perPage: number) => {
      setIsLoading(true);

      getData(query, page, perPage)
        .then((response) => setOrders(response.orders))
        .catch((err) => {
          if (err.response)
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar as O.S",
              type: "danger",
            });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [query]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setOrders(undefined);
    }
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      title="Buscar O.S"
      okLabel=""
      cancelLabel="Voltar"
      onClose={() => onClose({ index })}
      maxWidth="lg"
      BackdropProps={{ style: { background: "var(--backdrop)" } }}
      {...props}
    >
      <Container>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();

            refresh(1, 20);
          }}
        >
          <Filter>
            <TextField
              label="Buscar"
              type="search"
              name="query"
              autoComplete="off"
              value={query}
              onChange={useCallback((ev) => setQuery(ev.target.value), [])}
              placeholder="O.S ou Nome do cliente"
              fullWidth
            />

            <Button
              title="Buscar"
              icon={<MdSearch />}
              background="var(--info)"
              type="submit"
            >
              Buscar
            </Button>
          </Filter>
        </form>

        <Content>
          {isLoading ? (
            <CircularProgress
              size={100}
              className="centralize"
              style={{ margin: "0 30rem" }}
            />
          ) : orders ? (
            orders.data.length ? (
              <OrderList orders={orders} onReload={refresh} />
            ) : (
              <MessageInfo>Nenhuma O.S encontrada</MessageInfo>
            )
          ) : (
            <MessageInfo>
              Busque pelas ordens de serviço por nome ou código da O.S
            </MessageInfo>
          )}
        </Content>
      </Container>
    </ConfirmDialog>
  );
};

export default memo(SearchOsDialog);
