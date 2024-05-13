import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Container, Content } from "./styles";
import { CircularProgress } from "@material-ui/core";

import OrderList from "../../components/OrderList";
import AdvancedFilter from "./AdvancedFilter";
import Order from "../../models/Order";
import OrderService, { OrderFilterProps } from "../../services/OrderService";
import MessageInfo from "../../components/MessageInfo";
import { format, startOfDay, endOfDay } from "date-fns";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { padronize } from "../../global/globalFunctions";
import Pagination from "../../models/Pagination";
import { notificate } from "../../global/notificate";

const Orders: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState<Pagination<Order>>();
  const [filter, setFilter] = useState<OrderFilterProps>({
    begin_date: null,
    end_date: null,
    statuses: [],
    users: [],
    cities: [],
    shifts: [],
  });

  const ordersFiltered = useMemo<Pagination<Order>>(() => {
    if (!orders)
      return { page: 0, lastPage: 0, perPage: 0, total: 0, data: [] };

    const value = padronize(filter.client || "");

    const filtered = orders.data.filter(
      (order) =>
        (!filter.os || filter.os == order.os) &&
        padronize(order.client || "").indexOf(value) > -1
    );

    return { ...orders, data: filtered };
  }, [filter.os, filter.client, orders]);

  const handleInputChange = useCallback(
    (ev: ChangeEvent<{ name?: string; value: any }>) => {
      const { name, value } = ev.target;

      var data: OrderFilterProps = {
        [name || ""]: value && name === "os" ? Math.abs(value) : value,
      };

      if (name === "search_type") {
        if (!value)
          data = { ...data, begin_date: null, end_date: null, users: [] };
        else if (value === "os") data = { ...data, users: [] };
      }

      setFilter((prev) => ({ ...prev, ...data }));
    },
    [setFilter]
  );

  const handleDateChange = useCallback(
    (date: MaterialUiPickersDate, name: string) => {
      setFilter((prev) => ({ ...prev, [name]: date }));
    },
    [setFilter]
  );

  const getOrders = useCallback(
    async (filter: OrderFilterProps, page: number, per_page: number) => {
      if (filter.begin_date)
        filter.begin_date = format(
          startOfDay(new Date(filter.begin_date)),
          "yyyy-MM-dd HH:mm:ss"
        );

      if (filter.end_date)
        filter.end_date = format(
          endOfDay(new Date(filter.end_date)),
          "yyyy-MM-dd HH:mm:ss"
        );

      const orders = (await OrderService.filter(filter, { page, per_page }))
        .data;

      return { orders };
    },
    []
  );

  const refresh = useCallback(
    (page: number, perPage: number) => {
      setIsLoading(true);

      getOrders(filter, page, perPage)
        .then((response) => setOrders(response.orders))
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar as O.S",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() =>
          setTimeout(() => {
            setIsLoading(false);
          }, 300)
        );
    },
    [filter, setIsLoading, setOrders, getOrders]
  );

  useEffect(() => {
    refresh(1, 20);
  }, []);

  return (
    <Container>
      <AdvancedFilter
        value={filter}
        onChange={handleInputChange}
        onDateChange={handleDateChange}
        onSubmit={() => refresh(1, orders?.perPage || 20)}
      />

      <Content>
        <div className="content">
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : orders ? (
            <OrderList
              orders={ordersFiltered}
              onReload={(page, perPage) => refresh(page, perPage)}
            />
          ) : (
            <MessageInfo>Não foi possível carregar as O.S</MessageInfo>
          )}
        </div>
      </Content>
    </Container>
  );
};

export default Orders;
