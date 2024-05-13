import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AppBar,
  CircularProgress,
  DialogProps,
  Tab,
  Tabs,
} from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import ConfirmDialog from "../../../ConfirmDialog";
import ContractService from "../../../../services/ContractService";
import Contract from "../../../../models/Contract";
import MessageInfo from "../../../MessageInfo";
import InfoTab from "./InfoTab";
import TelephonyTab from "./TelephonyTab";
import ProductsTab from "./ProductsTab";
import RenewsTab from "./RenewsTab";

import { Container } from "./styles";
import OrdersTabTab from "./OrdersTab";

interface ViewContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const ViewContractDialog: React.FC<ViewContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [successOnClose, setSuccessOnClose] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const [contract, setContract] = useState<Contract>();

  useEffect(() => {
    if (open && !userPermissions?.contract.show) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para visualizar o contrato",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const handleClose = useCallback(
    (success?: boolean) => {
      onClose({ index, success: success || successOnClose });
      setSuccessOnClose(false);
    },
    [onClose, successOnClose, setSuccessOnClose]
  );

  async function getData(id: number) {
    const contract = (await ContractService.show(id)).data;

    return { contract };
  }

  function refresh() {
    setContract(undefined);
    setTabIndex(0);

    if (!contractId) {
      handleClose(false);

      return;
    }

    setIsLoading(true);

    getData(contractId)
      .then((response) => setContract(response.contract))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o contrato",
          type: "danger",
        });

        handleClose(false);

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  const handleTabChange = useCallback(
    (event: React.ChangeEvent<{}>, index: number) => {
      setTabIndex(index);
    },
    [setTabIndex]
  );

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId]);

  return (
    <ConfirmDialog
      open={open}
      title="Visualizar contrato"
      okLabel=""
      cancelLabel="Voltar"
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ style: { height: "100%" } }}
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : contract ? (
          <>
            <AppBar
              position="static"
              color="default"
              style={{ boxShadow: "none", background: "var(--white)" }}
            >
              <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Info" value={0} />

                {Boolean(contract.phoneNumbers?.length) && (
                  <Tab
                    label={`Telefonia (${contract.phoneNumbers?.length})`}
                    value={1}
                  />
                )}

                {Boolean(contract.products?.length) && (
                  <Tab
                    label={`Produtos (${contract.products?.length})`}
                    value={2}
                  />
                )}

                {Boolean(contract.renews?.length) && (
                  <Tab
                    label={`Renovações (${contract.renews?.length})`}
                    value={3}
                  />
                )}

                {Boolean(contract.orders?.length) && (
                  <Tab label={`O.S (${contract.orders?.length})`} value={4} />
                )}
              </Tabs>
            </AppBar>

            <InfoTab active={tabIndex === 0} contract={contract} />
            <TelephonyTab
              active={tabIndex === 1}
              contract={contract}
              onRefresh={() => {
                setSuccessOnClose(true);
                refresh();
              }}
            />
            <ProductsTab active={tabIndex === 2} contract={contract} />
            <RenewsTab
              active={tabIndex === 3}
              contract={contract}
              onRefresh={() => {
                setSuccessOnClose(true);
                refresh();
              }}
            />

            <OrdersTabTab active={tabIndex === 4} contract={contract} />
          </>
        ) : (
          open && (
            <MessageInfo>Não foi possível carregar o contrato</MessageInfo>
          )
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(ViewContractDialog);
