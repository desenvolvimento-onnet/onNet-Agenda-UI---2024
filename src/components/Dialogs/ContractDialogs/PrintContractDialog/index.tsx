import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { CircularProgress, DialogProps } from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import ConfirmDialog from "../../../ConfirmDialog";
import ContractService from "../../../../services/ContractService";
import Contract from "../../../../models/Contract";
import MessageInfo from "../../../MessageInfo";
import KeyTemplate from "../../../../models/KeyTemplate";

import { Container } from "./styles";

interface PrintContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const PrintContractDialog: React.FC<PrintContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contract, setContract] = useState<Contract>();

  useEffect(() => {
    if (open && !userPermissions?.contract.print) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para imprimir o contrato",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) iframeRef.current?.contentWindow?.print();
      else onClose({ index });
    },
    [onClose, index]
  );

  async function getContract(id: number) {
    const contract = (await ContractService.show(id)).data;

    return contract;
  }

  function refresh() {
    setContract(undefined);

    if (!contractId) {
      handleClose();

      return;
    }

    setIsLoading(true);

    getContract(contractId)
      .then((contract) => setContract(contract))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o contrato",
          type: "danger",
        });

        handleClose();

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  const handlePreventPrint = useCallback(
    (ev: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key == "p") {
        ev.preventDefault();
        ev.stopPropagation();

        iframeRef.current?.contentWindow?.print();
      }
    },
    [iframeRef.current]
  );

  useEffect(() => {
    if (contract && iframeRef.current) {
      const keyTemplate = new KeyTemplate(contract);
      const iframe = iframeRef.current;

      const monthly_price = keyTemplate.keys.find(
        (key) => key.name === "mensalidade"
      )?.value;

      if (monthly_price && Number(monthly_price) !== contract.monthly_price)
        notificate({
          title: "Atenção",
          message:
            "O valor da mensalidade não está correto! Contate o responsável da T.I",
          type: "info",
        });

      const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body>
          ${contract.contractType?.template || ""}
        </body>
      </html>`;

      if (iframe.contentDocument) {
        iframe.contentDocument.write(html);

        keyTemplate.parseAll(iframe.contentDocument);
      }

      if (iframe.contentWindow)
        iframe.contentWindow.addEventListener("keydown", handlePreventPrint);
    }

    return iframeRef.current?.contentWindow?.removeEventListener(
      "keydown",
      () => {}
    );
  }, [contract, iframeRef]);

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId]);

  return (
    <ConfirmDialog
      open={open}
      title="Imprimir contrato"
      okLabel="Imprimir"
      cancelLabel="Fechar"
      onClose={handleClose}
      okButtonProps={{ disabled: isLoading }}
      fullScreen
      onKeyDown={handlePreventPrint}
      {...props}
    >
      <Container>
        <iframe
          ref={iframeRef}
          frameBorder="0"
          style={{ display: isLoading ? "none" : "block" }}
        />

        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          open &&
          !contract && (
            <MessageInfo>Não foi possível carregar o contrato</MessageInfo>
          )
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(PrintContractDialog);
