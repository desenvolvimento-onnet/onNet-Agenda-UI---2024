import { useState, ChangeEvent, useCallback, useEffect } from "react";

import { CircularProgress } from "@material-ui/core";
import { MdClose } from "react-icons/md";

import { SystemContractParams } from "../../services/SystemService";
import { notificate } from "../../global/notificate";

import ImportForm from "./ImportForm";
import ContractList from "../../components/ContractList";
import Contract from "../../models/Contract";
import MessageInfo from "../../components/MessageInfo";
import useContractDialog from "../../components/Dialogs/ContractDialogs/context/useContractDialog";
import ContractService from "../../services/ContractService";
import Button from "../../components/Button";
import System from "../../models/System";

import { Container, Content } from "./styles";

const ContractImport: React.FC = () => {
  const { addContractDialog, fixContractDialog } = useContractDialog();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<System>();
  const [searchForm, setSearchForm] = useState<SystemContractParams>(
    {} as SystemContractParams
  );

  const [importedContract, setImportedContract] = useState<Contract>();

  const handleSearchFormInput = useCallback(
    (
      ev: ChangeEvent<
        HTMLTextAreaElement | HTMLInputElement | { name: string; value?: any }
      >,
      system?: System
    ) => {
      const { name, value } = ev.target;

      if (name === "system") setSelectedSystem(system);
      else setSearchForm((prev) => ({ ...prev, [name]: value }));
    },
    [setSelectedSystem, setSearchForm]
  );

  async function getContract(
    contract_number: number,
    client_number?: number | null
  ) {
    const contracts = (
      await ContractService.index({ contract_number, client_number })
    ).data.data;

    var contract: Contract | undefined;

    if (contracts[0])
      contract = (await ContractService.show(Number(contracts[0].id))).data;

    return { contract };
  }

  const refresh = useCallback(
    (options: {
      success?: boolean;
      client_number?: number | null;
      contract_number: number;
    }) => {
      if (options.success && options.contract_number) {
        setImportedContract(undefined);

        setIsLoading(true);

        getContract(options.contract_number, options.client_number)
          .then((response) => {
            setSearchForm((prev) => ({} as SystemContractParams));
            setImportedContract(response.contract);
          })
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status}`,
              message: "Ocorreu um erro ao carregar o contrato importado",
              type: "danger",
            });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      }
    },
    [searchForm, setSearchForm, setImportedContract]
  );

  useEffect(() => {
    if (selectedSystem)
      setSearchForm((prev) => ({ ...prev, client_number: undefined }));
  }, [setSearchForm, selectedSystem]);

  return (
    <Container>
      <ImportForm
        selectedSystem={selectedSystem}
        value={searchForm}
        onChange={handleSearchFormInput}
        onSubmit={() =>
          selectedSystem &&
          fixContractDialog(selectedSystem, searchForm, undefined, (success) =>
            refresh({
              success,
              client_number: searchForm.client_number,
              contract_number: searchForm.contract_number,
            })
          )
        }
        onAddClick={() => addContractDialog()}
        disableButtons={isLoading}
      />

      <Content>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : importedContract ? (
          <>
            <ContractList
              contracts={{
                page: 1,
                lastPage: 1,
                perPage: 10,
                total: 1,
                data: [importedContract],
              }}
              onReload={() =>
                refresh({
                  success: true,
                  client_number: importedContract.client_number as
                    | number
                    | undefined,
                  contract_number: importedContract.contract_number,
                })
              }
            />

            <Button
              title="Limpar lista"
              icon={<MdClose />}
              onClick={() => setImportedContract(undefined)}
            >
              Limpar
            </Button>
          </>
        ) : (
          <MessageInfo>
            Importe algum contrato criado em outro sistema
          </MessageInfo>
        )}
      </Content>
    </Container>
  );
};

export default ContractImport;
