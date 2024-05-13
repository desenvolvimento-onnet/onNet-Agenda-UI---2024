import format from "date-fns/format";

import { BsPersonCheck } from "react-icons/bs";
import { ptBR } from "date-fns/locale";

import TabBar, { TabBarProps } from "../TabBar";
import Contract from "../../../../../models/Contract";
import LabelGroup from "../../../../LabelGroup";
import Divider from "../../../../Divider";

export interface OrdersTabTabProps extends Omit<TabBarProps, "children"> {
  contract: Contract;
}

const OrdersTabTab: React.FC<OrdersTabTabProps> = ({ contract, ...props }) => {
  return (
    <TabBar {...props}>
      {contract.orders?.map((order) => (
        <section key={order.id} className="multiple">
          <div className="line">
            <LabelGroup label="O.S" content={order.os} />

            <LabelGroup
              className="center"
              label="Turno"
              content={order.shift?.name}
            />

<LabelGroup
              className="end"
              label="Data"
              content={
                format(new Date(order.date), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              }
            />
          </div>

          <Divider />

          <div className="line">
            <LabelGroup
              label="Usuário de criação"
              content={order.user?.short_name}
              icon={<BsPersonCheck />}
            />

            <LabelGroup
              className="end"
              label="Data de criação"
              content={
                order?.created_at &&
                format(new Date(order.created_at), "dd MMM, yyyy || HH:mm'h'", {
                  locale: ptBR,
                })
              }
            />
          </div>
        </section>
      ))}
    </TabBar>
  );
};

export default OrdersTabTab;
