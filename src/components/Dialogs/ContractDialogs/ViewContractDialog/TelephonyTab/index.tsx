import format from "date-fns/format";

import { MdPhonelinkLock } from "react-icons/md";
import { RiMedal2Fill } from "react-icons/ri";
import { BsPersonCheck } from "react-icons/bs";
import { ptBR } from "date-fns/locale";

import TabBar, { TabBarProps } from "../TabBar";
import Contract from "../../../../../models/Contract";
import LabelGroup from "../../../../LabelGroup";
import Divider from "../../../../Divider";
import Button from "../../../../Button";
import useNumberDialog from "../../../PhoneNumberDialogs/context/useNumberDialog";
import { useContext } from "react";
import { AuthContext } from "../../../../../global/context/AuthContext";

export interface TelephonyTabProps extends Omit<TabBarProps, "children"> {
  contract: Contract;
  onRefresh: () => void;
}

const TelephonyTab: React.FC<TelephonyTabProps> = ({
  contract,
  onRefresh,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const { unbindNumberDialog } = useNumberDialog();

  return (
    <TabBar {...props}>
      {contract.phoneNumbers?.map((phoneNumber) => (
        <section key={phoneNumber.id} className="multiple">
          <div className="line">
            <LabelGroup label="Número" content={phoneNumber.number} />

            {Boolean(phoneNumber.portability || phoneNumber.gold) && (
              <>
                {Boolean(phoneNumber.gold) && (
                  <LabelGroup
                    label="Tipo"
                    icon={<RiMedal2Fill />}
                    content="Gold"
                  />
                )}

                {Boolean(phoneNumber.portability) && (
                  <LabelGroup
                    label="Tipo"
                    icon={<MdPhonelinkLock />}
                    content="Portabilidade"
                  />
                )}
              </>
            )}
          </div>

          <Divider />

          <div className="line">
            <LabelGroup
              label="Usuário de alocação"
              content={phoneNumber?.allocationUser?.short_name}
              icon={<BsPersonCheck />}
            />

            {userPermissions?.phone_number.unbind && (
              <Button
                title="Desvincular número do contrato"
                background="var(--danger)"
                onClick={() =>
                  unbindNumberDialog(
                    Number(phoneNumber.id),
                    (success) => success && onRefresh && onRefresh()
                  )
                }
              >
                Desvincular
              </Button>
            )}

            <LabelGroup
              className="end"
              label="Data de alocação"
              content={
                phoneNumber?.alocated_at &&
                format(
                  new Date(phoneNumber?.alocated_at),
                  "dd MMM, yyyy || HH:mm'h'",
                  {
                    locale: ptBR,
                  }
                )
              }
            />
          </div>
        </section>
      ))}
    </TabBar>
  );
};

export default TelephonyTab;
