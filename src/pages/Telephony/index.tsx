import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";

import { MdDialpad } from "react-icons/md";
import { CircularProgress, TextField } from "@material-ui/core";
import { useEffect } from "react";

import { notificate } from "../../global/notificate";

import Filter from "./Filter";
import PhoneNumberList from "./PhoneNumbersList";
import PhoneNumber from "../../models/PhoneNumber";
import City from "../../models/City";
import PhoneNumberService, {
  PhoneNumberFilterProps,
} from "../../services/PhoneNumberService";
import LabelGroup from "../../components/LabelGroup";
import MessageInfo from "../../components/MessageInfo";
import ConfirmDialog from "../../components/ConfirmDialog";
import Divider from "../../components/Divider";
import SwitchToggle from "../../components/SwitchToggle";

import { Container, Content, PrefixInfo, DialogContainer } from "./styles";
import Pagination from "../../models/Pagination";
import PaginateFooter from "../../components/PaginateFooter";
import useNumberDialog from "../../components/Dialogs/PhoneNumberDialogs/context/useNumberDialog";

const Telephony: React.FC = () => {
  const { bindNumberDialog } = useNumberDialog();

  const prefixInputRef = useRef<HTMLInputElement>(null);
  const sufixInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedCity, setSelectedCity] = useState<City>();
  const [prefixInfoHidden, setPrefixInfoHidden] = useState<boolean>(false);
  const [filterValue, setFilterValue] = useState<PhoneNumberFilterProps>(
    {} as PhoneNumberFilterProps
  );

  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<
    PhoneNumber[]
  >([]);

  const [phoneNumberForm, setPhoneNumberForm] = useState<PhoneNumber>(
    {} as PhoneNumber
  );

  const [phoneNumbers, setPhoneNumbers] = useState<Pagination<PhoneNumber>>();

  const phoneNumbersFiltered = useMemo(() => {
    const { query, statuses } = filterValue;

    const data = phoneNumbers?.data.filter(
      ({ number, gold, portability }) =>
        number
          .replace(/[ ()-]/g, "")
          .indexOf(query?.replace(/[ ()-]/g, "") || "") > -1 &&
        (!statuses?.length ||
          (statuses.includes("gold") && gold) ||
          (statuses.includes("portability") && portability) ||
          (statuses.includes("normal") && !gold && !portability))
    );

    return data || [];
  }, [phoneNumbers, filterValue]);

  const parseNumber = useCallback((text: string, maxLength: number) => {
    const reg = new RegExp(`(\\d{0,${maxLength}}).*`, "g");

    return text.replace(/\D/g, "").replace(reg, "$1");
  }, []);

  async function getData(
    filterValue: PhoneNumberFilterProps,
    page: number,
    per_page: number
  ) {
    const phoneNumbers = (
      await PhoneNumberService.filter(
        { ...filterValue, active: true, alocated: false, reserved: false },
        {
          order_by: "sufix",
          page,
          per_page,
        }
      )
    ).data;

    return { phoneNumbers };
  }

  async function submitPhoneNumber(phoneNumber: PhoneNumber) {
    if (!phoneNumber.ddd || !phoneNumber.prefix || !phoneNumber.sufix) {
      notificate({
        title: "Aviso",
        message: "Preencha todos os dados",
        type: "info",
      });

      throw new Error("Missing data");
    }

    await PhoneNumberService.store(phoneNumber);
  }

  const submitPhoneNumberDialog = useCallback(() => {
    setDialogIsLoading(true);

    submitPhoneNumber({
      ...phoneNumberForm,
      city_id: Number(filterValue.city_id),
    })
      .then(() => {
        refresh(phoneNumbers?.page, phoneNumbers?.perPage);
        setDialogOpened(null);
      })
      .catch((err) => {
        if (err.response?.status)
          if (err.response.status === 409)
            notificate({
              title: `Aviso ${err.response?.status || ""}`,
              message: "Esse número já foi cadastrado",
              type: "info",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro salvar o número",
              type: "danger",
            });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }, [phoneNumbers, phoneNumberForm, setDialogIsLoading, filterValue.city_id]);

  const onFilterChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      const { name, value } = ev.target;

      setFilterValue((prev) => ({
        ...prev,
        [name as keyof PhoneNumberFilterProps]: value,
      }));
    },
    [setFilterValue]
  );

  const handlePhoneNumberInputChange = useCallback(
    (
      ev: ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | {
            name?: string;
            value?: any;
          }
      >,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButton: Array<keyof PhoneNumber> = [
        "active",
        "portability",
        "gold",
      ];

      setPhoneNumberForm((prev) => ({
        ...prev,
        [name || ""]: switchButton.includes(name as keyof PhoneNumber)
          ? checked
          : value,
      }));
    },
    [setPhoneNumberForm]
  );

  const handleDialogOpened = useCallback(
    (index: number) => {
      if (index === 1) {
        setPhoneNumberForm({ portability: true } as PhoneNumber);
        setDialogOpened(index);
      }
    },
    [setDialogOpened, filterValue, setPhoneNumberForm]
  );

  const handleDialogClose = useCallback(
    (success?: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitPhoneNumberDialog();
      } else setDialogOpened(null);
    },
    [dialogOpened, setDialogOpened, submitPhoneNumberDialog]
  );

  const refresh = useCallback(
    (page?: number, perPage?: number) => {
      setIsLoading(true);

      getData(filterValue, page || 1, perPage || 200)
        .then((response) => setPhoneNumbers(response.phoneNumbers))
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro carregar os números",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [filterValue, setPhoneNumbers, setIsLoading]
  );

  useEffect(() => {
    setSelectedPhoneNumbers([]);
  }, [filterValue.city_id, setSelectedPhoneNumbers]);

  useEffect(() => {
    if (filterValue.city_id) refresh(1);
  }, [filterValue.city_id]);

  return (
    <>
      <Container>
        <Filter
          value={filterValue}
          onFilterChange={onFilterChange}
          onSubmit={(ev) => {
            ev?.preventDefault();

            refresh(1, phoneNumbers?.perPage);
          }}
          onAddClick={() => handleDialogOpened(1)}
          onCityChange={(city) => setSelectedCity(city)}
        />

        <Content>
          {selectedCity && (
            <PrefixInfo
              className={prefixInfoHidden ? "hidden" : ""}
              onClick={() => setPrefixInfoHidden((prev) => !prev)}
            >
              <LabelGroup
                label="Escolha o sufixo"
                content={
                  <span className="prefix">
                    ({selectedCity.ddd || ""}) {selectedCity.prefix || ""} -{" "}
                  </span>
                }
                icon={<MdDialpad />}
              />
            </PrefixInfo>
          )}

          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : filterValue.city_id ? (
            phoneNumbers ? (
              phoneNumbersFiltered.length ? (
                <>
                  <PhoneNumberList
                    phoneNumbers={phoneNumbersFiltered}
                    value={selectedPhoneNumbers}
                    onChange={(phoneNumbers) =>
                      setSelectedPhoneNumbers(phoneNumbers)
                    }
                    handleBindClick={() =>
                      bindNumberDialog(
                        selectedPhoneNumbers.map((phoneNumber) =>
                          Number(phoneNumber.id)
                        ),
                        Number(selectedCity?.id),
                        (success) => {
                          if (success) {
                            refresh(1, phoneNumbers.perPage);
                            setSelectedPhoneNumbers([]);
                          }
                        }
                      )
                    }
                  />

                  <PaginateFooter
                    pagination={phoneNumbers}
                    onReload={refresh}
                  />
                </>
              ) : (
                <MessageInfo>Nenhum número encontrado</MessageInfo>
              )
            ) : (
              <MessageInfo>
                Não foi possível carregar os números de telefone
              </MessageInfo>
            )
          ) : (
            <MessageInfo>Selecione uma cidade</MessageInfo>
          )}
        </Content>
      </Container>

      {/* Add Number Dialog */}
      <ConfirmDialog
        title="Adicionar número portabilidade"
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <h4>
                {selectedCity?.name} |{" "}
                {`(${phoneNumberForm.ddd || "__"}) ${
                  phoneNumberForm.prefix || "____"
                }-${phoneNumberForm.sufix || "____"}`}
              </h4>

              <Divider />

              <div className="line">
                <TextField
                  className="small"
                  label="DDD"
                  variant="outlined"
                  autoComplete="off"
                  name="ddd"
                  value={phoneNumberForm.ddd || ""}
                  type="number"
                  onChange={(ev) => {
                    const value = parseNumber(ev.target.value, 2);

                    ev.target.value = value;

                    handlePhoneNumberInputChange(ev);

                    if (value.length === 2) prefixInputRef.current?.focus();
                  }}
                />
                <TextField
                  inputRef={prefixInputRef}
                  label="Prefixo"
                  variant="outlined"
                  autoComplete="off"
                  name="prefix"
                  value={phoneNumberForm.prefix || ""}
                  type="number"
                  onChange={(ev) => {
                    const value = parseNumber(ev.target.value, 4);

                    ev.target.value = value;

                    handlePhoneNumberInputChange(ev);

                    if (value.length === 4) sufixInputRef.current?.focus();
                  }}
                />
                <span>
                  <strong>-</strong>
                </span>
                <TextField
                  inputRef={sufixInputRef}
                  label="Sufixo"
                  variant="outlined"
                  autoComplete="off"
                  name="sufix"
                  value={phoneNumberForm.sufix || ""}
                  type="number"
                  onChange={(ev) => {
                    ev.target.value = parseNumber(ev.target.value, 4);

                    handlePhoneNumberInputChange(ev);
                  }}
                />
              </div>

              <div className="line">
                <SwitchToggle
                  label="Portabilidade"
                  name="portability"
                  value={phoneNumberForm.portability}
                  onChange={handlePhoneNumberInputChange}
                  disabled
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Telephony;
