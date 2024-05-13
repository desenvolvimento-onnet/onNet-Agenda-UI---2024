import { CircularProgress } from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { format, startOfDay } from "date-fns";
import { endOfDay } from "date-fns/esm";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { padronize } from "../../global/globalFunctions";
import { notificate } from "../../global/notificate";
import ContractService, {
  ContractFilterProps,
  ContractStatus,
} from "../../services/ContractService";

import MessageInfo from "../../components/MessageInfo";
import ContractList from "../../components/ContractList";
import Contract from "../../models/Contract";
import Pagination from "../../models/Pagination";
import AdvancedFilter from "./AdvancedFilter";

import { Container, Content } from "./styles";

const Contracts: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [filterValue, setFilterValue] = useState<ContractFilterProps>({
    begin_date: null,
    end_date: null,
    statuses: [] as ContractStatus[],
    users: [] as number[],
    cities: [] as number[],
  } as ContractFilterProps);

  const [contracts, setContracts] = useState<Pagination<Contract>>();

  const handleFilterChange = useCallback(
    (ev: ChangeEvent<{ name?: string; value: any }>) => {
      const { name, value } = ev.target;

      var data = { [name || ""]: value };

      if (name === "search_type" && !value)
        data = { ...data, begin_date: null, end_date: null, users: [] };

      setFilterValue((prev) => ({ ...prev, ...data }));
    },
    [setFilterValue]
  );

  const handleDateChange = useCallback(
    (date: MaterialUiPickersDate, name: string) => {
      setFilterValue((prev) => ({ ...prev, [name]: date }));
    },
    [setFilterValue]
  );

  async function getContracts(
    page: number,
    per_page: number,
    filter: ContractFilterProps
  ) {
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

    const contracts = (
      await ContractService.filter(filter, {
        page,
        per_page,
      })
    ).data;

    return { contracts };
  }

  const refresh = useCallback(
    (page?: number, perPage?: number) => {
      setIsLoading(true);

      getContracts(page || 1, perPage || 10, filterValue)
        .then((response) => setContracts(response.contracts))
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar os contratos",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [filterValue, setIsLoading, setContracts]
  );

  // First loading
  useEffect(() => {
    refresh(1);
  }, []);

  // Filter phoneNumbers
  const contractsFiltered = useMemo<Pagination<Contract>>(() => {
    if (!contracts)
      return { page: 0, lastPage: 0, perPage: 0, total: 0, data: [] };

    const value = padronize(filterValue.client || "");

    const filtered = contracts.data.filter(
      ({ client_number, contract_number, client }) =>
        (!filterValue.client_number ||
          String(client_number).indexOf(String(filterValue.client_number)) >
            -1) &&
        (!filterValue.contract_number ||
          String(contract_number).indexOf(String(filterValue.contract_number)) >
            -1) &&
        (!value || padronize(client).indexOf(value) > -1)
    );

    return { ...contracts, data: filtered };
  }, [filterValue.client, filterValue.client_number, filterValue.contract_number, contracts]);

  return (
    <Container>
      <AdvancedFilter
        value={filterValue}
        onChange={handleFilterChange}
        onDateChange={handleDateChange}
        onSubmit={() => refresh(1, contracts?.perPage)}
      />

      <Content>
        <div className="content">
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : contracts ? (
            <ContractList contracts={contractsFiltered} onReload={refresh} />
          ) : (
            <MessageInfo>
              Não foi possível carregar os números de telefone
            </MessageInfo>
          )}
        </div>
      </Content>
    </Container>
  );
};

export default Contracts;
