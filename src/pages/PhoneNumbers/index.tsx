import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";

import { CircularProgress } from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { endOfDay, format, startOfDay } from "date-fns/esm";

import { padronize } from "../../global/globalFunctions";
import { notificate } from "../../global/notificate";
import PhoneNumberService, {
  PhoneNumberFilterProps,
  PhoneNumberStatus,
} from "../../services/PhoneNumberService";

import MessageInfo from "../../components/MessageInfo";
import PhoneNumber from "../../models/PhoneNumber";
import Pagination from "../../models/Pagination";
import PhoneNumberList from "../../components/PhoneNumberList";
import AdvancedFilter from "./AdvancedFilter";

import { Container, Content } from "./styles";
import Button from "../../components/Button";
import { BsPlusCircleFill } from "react-icons/bs";
import useNumberDialog from "../../components/Dialogs/PhoneNumberDialogs/context/useNumberDialog";
import { useContext } from "react";
import { AuthContext } from "../../global/context/AuthContext";

const PhoneNumbers: React.FC = () => {
  const { userPermissions } = useContext(AuthContext);
  const { addNumberDialog } = useNumberDialog();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [filterValue, setFilterValue] = useState<PhoneNumberFilterProps>({
    begin_date: null,
    end_date: null,
    statuses: [] as PhoneNumberStatus[],
    users: [] as number[],
    cities: [] as number[],
  } as PhoneNumberFilterProps);

  const [phoneNumbers, setPhoneNumbers] = useState<Pagination<PhoneNumber>>();

  const handleFilterChange = useCallback(
    (ev: ChangeEvent<{ name?: string; value: any }>) => {
      const { name, value } = ev.target;

      var data: PhoneNumberFilterProps = {
        [name || ""]: value,
      } as PhoneNumberFilterProps;

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

  async function getPhoneNumbers(
    page: number,
    per_page: number,
    filter: PhoneNumberFilterProps
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
    const phoneNumbers = (
      await PhoneNumberService.filter(filter, {
        page,
        per_page,
      })
    ).data;

    return { phoneNumbers };
  }

  const refresh = useCallback(
    (page?: number, perPage?: number) => {
      setIsLoading(true);

      getPhoneNumbers(page || 1, perPage || 20, filterValue)
        .then((response) => {
          setPhoneNumbers(response.phoneNumbers);
        })
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar os números",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [filterValue, setIsLoading, setPhoneNumbers]
  );

  // First loading
  useEffect(() => {
    refresh(1);
  }, []);

  // Filter phoneNumbers
  const phoneNumbersFiltered = useMemo<Pagination<PhoneNumber>>(() => {
    if (!phoneNumbers)
      return { page: 0, lastPage: 0, perPage: 0, total: 0, data: [] };

    const value = filterValue.query?.replace(/[ ()-]/g, "") || "";
    const client = padronize(filterValue.client_name);

    const filtered = phoneNumbers.data.filter(
      ({ contract, number }) =>
        (!client || padronize(contract?.client).indexOf(client) > -1) &&
        (!value || number.replace(/[ ()-]/g, "").indexOf(value) > -1)
    );

    return { ...phoneNumbers, data: filtered };
  }, [filterValue.client_name, filterValue.query, phoneNumbers]);

  return (
    <>
      <Container>
        <AdvancedFilter
          value={filterValue}
          onChange={handleFilterChange}
          onDateChange={handleDateChange}
          onSubmit={() => refresh(1, phoneNumbers?.perPage)}
        />

        <Content>
          {userPermissions?.phone_numbers.add &&
            userPermissions.phone_number.add.allow && (
              <Button
                title="Adicionar"
                background="var(--secondary)"
                icon={<BsPlusCircleFill />}
                type="button"
                height={2}
                onClick={() =>
                  addNumberDialog(
                    {},
                    (success) => success && refresh(1, phoneNumbers?.perPage)
                  )
                }
              >
                Adicionar
              </Button>
            )}

          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : phoneNumbers ? (
            <PhoneNumberList
              phoneNumbers={phoneNumbersFiltered}
              onReload={refresh}
            />
          ) : (
            <MessageInfo>
              Não foi possível carregar os números de telefone
            </MessageInfo>
          )}
        </Content>
      </Container>
    </>
  );
};

export default PhoneNumbers;
