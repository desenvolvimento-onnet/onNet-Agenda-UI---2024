import React, {
  HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { FaTractor } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { IoMdCalendar } from "react-icons/io";
import { MdBlock, MdCheck, MdClose, MdEdit, MdMoreVert } from "react-icons/md";
import { Button, Menu, MenuItem } from "@material-ui/core";
import { format } from "date-fns";

import { AuthContext } from "../../global/context/AuthContext";
import { InfoCoinContainer, InfoCoin } from "../InfoCoin";
import { Table, THead, TBody, Th, Td } from "../Table";

import Order from "../../models/Order";
import Pagination from "../../models/Pagination";
import PaginateFooter from "../PaginateFooter";
import MessageInfo from "../MessageInfo";
import useOsDialog from "../Dialogs/OrderDialogs/context/useOsDialog";

import { Container } from "./styles";

interface OrderListProps extends HTMLAttributes<HTMLTableElement> {
  orders: Pagination<Order>;
  onReload?: (page: number, perPage: number) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  children,
  onReload,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const {
    viewOsDialog,
    addOsDialog,
    closeOsDialog,
    rescheduleOsDialog,
    cancelDialog,
  } = useOsDialog();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order>();

  const handleMoreClick = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement>, order: Order) => {
      setSelectedOrder(order);
      setAnchorEl(ev.currentTarget);
    },
    [setSelectedOrder, setAnchorEl]
  );

  useEffect(() => {
    if (!anchorEl) setSelectedOrder(undefined);
  }, [anchorEl, setSelectedOrder]);

  return (
    <>
      <Container>
        {Boolean(orders.data.length) ? (
          <>
            <Table cellSpacing={3} {...props}>
              <THead>
                <tr>
                  <Th>O.S</Th>
                  <Th>Cliente</Th>
                  <Th noContent></Th>
                  <Th>Turno</Th>
                  <Th>Data</Th>
                  <Th>Cidade</Th>
                  <Th>Criado por</Th>
                  <Th>Observação</Th>
                  <Th short></Th>
                </tr>
              </THead>
              <TBody>
                {orders.data.map((order) => (
                  <tr key={order.id}>
                    <Td>{order.os}</Td>
                    <Td>{order.client}</Td>
                    <Td noBackground noContent>
                      {Boolean(
                        order.rural ||
                          order.rescheduled ||
                          order.closed ||
                          order.canceled
                      ) && (
                        <InfoCoinContainer>
                          {Boolean(order.rural) && (
                            <InfoCoin
                              icon={<FaTractor />}
                              title="Rural"
                              type="blue"
                            />
                          )}

                          {Boolean(order.rescheduled) && (
                            <InfoCoin
                              icon={<IoMdCalendar />}
                              title="Reagendado"
                              type="orange"
                            />
                          )}

                          {Boolean(order.closed) && (
                            <InfoCoin
                              icon={<MdCheck />}
                              title="Finalizado"
                              type="green"
                            />
                          )}

                          {Boolean(order.canceled) && (
                            <InfoCoin
                              icon={<MdClose />}
                              title="Cancelado"
                              type="red"
                            />
                          )}
                        </InfoCoinContainer>
                      )}
                    </Td>
                    <Td>{order.shift?.name}</Td>
                    <Td>{format(new Date(order.date || ""), "dd/MM/yyyy")}</Td>
                    <Td>{order.city?.name}</Td>
                    <Td>{order.user?.short_name}</Td>
                    <Td>{order.note}</Td>
                    <Td short noBackground>
                      <Button onClick={(ev) => handleMoreClick(ev, order)}>
                        <MdMoreVert size={24} />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>

            <PaginateFooter pagination={{ ...orders }} onReload={onReload} />
          </>
        ) : (
          <MessageInfo>Nenhuma O.S encontrada</MessageInfo>
        )}
      </Container>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={useCallback(() => setAnchorEl(null), [])}
        MenuListProps={{ style: { minWidth: "4rem" } }}
      >
        {Boolean(userPermissions?.order.show) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedOrder && viewOsDialog(Number(selectedOrder.id));
            }}
            disabled={!anchorEl || !selectedOrder}
          >
            <FiEye />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Visualizar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.order.edit) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedOrder &&
                addOsDialog(
                  { orderId: Number(selectedOrder.id) },
                  (success) =>
                    success && onReload && onReload(orders.page, orders.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedOrder ||
              Boolean(selectedOrder.closed || selectedOrder.canceled)
            }
          >
            <MdEdit />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Editar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.order.close) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedOrder &&
                closeOsDialog(
                  Number(selectedOrder.id),
                  (success) =>
                    success && onReload && onReload(orders.page, orders.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedOrder ||
              Boolean(selectedOrder.closed || selectedOrder.canceled)
            }
          >
            <MdCheck />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Fechar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.order.reschedule) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedOrder &&
                rescheduleOsDialog(
                  Number(selectedOrder.id),
                  (success) =>
                    success && onReload && onReload(orders.page, orders.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedOrder ||
              Boolean(selectedOrder.closed || selectedOrder.canceled)
            }
          >
            <IoMdCalendar />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Reagendar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.order.cancel) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedOrder &&
                cancelDialog(
                  Number(selectedOrder.id),
                  (success) =>
                    success && onReload && onReload(orders.page, orders.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedOrder ||
              Boolean(selectedOrder.closed || selectedOrder.canceled)
            }
          >
            <MdBlock />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Cancelar
            </span>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default memo(OrderList);
