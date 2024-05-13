import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CircularProgress, DialogProps, TextField } from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import ConfirmDialog from "../../../ConfirmDialog";
import Divider from "../../../Divider";

import { Container, Form } from "./styles";
import { AuthContext } from "../../../../global/context/AuthContext";
import SwitchToggle from "../../../SwitchToggle";
import PhoneNumber from "../../../../models/PhoneNumber";
import City from "../../../../models/City";
import CityService from "../../../../services/CityService";
import PhoneNumberService from "../../../../services/PhoneNumberService";
import SelectFilter from "../../../SelectFilter";

interface AddNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberId?: number;
  onClose: (options: CloseStatus) => void;
}

const AddNumberDialog: React.FC<AddNumberDialogProps> = ({
  index,
  open,
  onClose,
  phoneNumberId,
  ...props
}) => {
  const { userPermissions, user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRangeForm, setIsRangeForm] = useState<boolean>(false);
  const [sufixRange, setSufixRange] = useState<string>("");

  const [cities, setCities] = useState<City[]>([]);

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber>();
  const [phoneNumberForm, setPhoneNumberForm] = useState<PhoneNumber>(
    {} as PhoneNumber
  );

  const citiesFiltered = useMemo(() => {
    return cities.filter(
      (city) =>
        city.id === selectedPhoneNumber?.city_id ||
        (city.prefix &&
          (user?.cities as City[] | undefined)?.find(
            (userCity) => city.id === userCity.id
          ))
    );
  }, [user?.cities, cities, selectedPhoneNumber?.city_id]);

  useEffect(() => {
    if (open) {
      if (!phoneNumberId && !userPermissions?.phone_number.add.allow) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para adicionar um número",
          type: "danger",
        });

        onClose({ index, success: false });
      } else if (phoneNumberId && !userPermissions?.phone_number.edit) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para editar o número",
          type: "danger",
        });

        onClose({ index, success: false });
      }
    }
  }, [open, phoneNumberId, userPermissions]);

  const parseNumber = useCallback((text: string, maxLength: number) => {
    const reg = new RegExp(`(\\d{0,${maxLength}}).*`, "g");

    return text.replace(/\D/g, "").replace(reg, "$1");
  }, []);

  const submitRange = useCallback(
    async (phoneNumber: PhoneNumber, sufixEnd?: string) => {
      if (
        !phoneNumber.city_id ||
        !phoneNumber.ddd ||
        !phoneNumber.prefix ||
        !phoneNumber.sufix ||
        !sufixEnd
      ) {
        notificate({
          title: "Atenção",
          message: "Preencha todos os campos!",
          type: "info",
        });

        throw new Error("Missing data form");
      }

      if (Number(sufixEnd) <= Number(phoneNumber.sufix)) {
        notificate({
          title: "Atenção",
          message: "O intervalo inserido não é válido!",
          type: "info",
        });

        throw new Error("Invalid range");
      }

      const phoneNumbers = (
        await PhoneNumberService.storeRange(phoneNumber, sufixEnd)
      ).data;

      notificate({
        title: "Sucesso",
        message: `${phoneNumbers.length} números cadastrados!`,
        type: "success",
      });
    },
    []
  );

  const onSubmit = useCallback(
    async (phoneNumber: PhoneNumber, id?: number) => {
      if (
        !id &&
        (!phoneNumber.city_id ||
          !phoneNumber.ddd ||
          !phoneNumber.prefix ||
          !phoneNumber.sufix)
      ) {
        notificate({
          title: "Atenção",
          message: "Preencha todos os campos!",
          type: "info",
        });
        throw new Error("Missing data form");
      }

      if (id) await PhoneNumberService.update(id, phoneNumber);
      else await PhoneNumberService.store(phoneNumber);
    },
    []
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) {
        setIsLoading(true);

        if (!phoneNumberId && isRangeForm)
          submitRange(phoneNumberForm, sufixRange)
            .then(() => onClose({ index, success }))
            .catch((err) => {
              if (err.response?.status)
                notificate({
                  title: `Erro ${err.response.status || ""}`,
                  message: "Ocorreu um erro ao salvar os dados",
                  type: "danger",
                });

              console.log(err);
            })
            .finally(() => setIsLoading(false));
        else
          onSubmit(phoneNumberForm, phoneNumberId)
            .then(() => onClose({ index, success }))
            .catch((err) => {
              if (err.response?.status === 409)
                notificate({
                  title: "Aviso",
                  message: "Este número de telefone já foi cadastrado",
                  type: "warning",
                });
              else if (err.response?.status)
                notificate({
                  title: `Erro ${err.response?.status || ""}`,
                  message: "Ocorreu um erro ao salvar os dados",
                  type: "danger",
                });

              console.log(err);
            })
            .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [
      sufixRange,
      setIsLoading,
      submitRange,
      onSubmit,
      phoneNumberForm,
      onClose,
      phoneNumberId,
    ]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButton: Array<keyof PhoneNumber> = [
        "gold",
        "active",
        "portability",
      ];

      var data = {
        [name || ""]: switchButton.includes(name as keyof PhoneNumber)
          ? checked
          : value,
      };

      //Ajust textfields when change the city
      setPhoneNumberForm((prev) => {
        if (name === "portability" && checked) prev.gold = false;
        if (name === "gold" && checked) prev.portability = false;

        if (
          cities &&
          (((name === "city_id" || name === "gold") && !prev.portability) ||
            (name === "portability" && !checked))
        ) {
          const city = cities.find(
            (city) =>
              city.id ===
              (name === "city_id"
                ? value
                : prev.city_id ||
                  (!prev.city_id && selectedPhoneNumber?.city_id))
          );

          if (city) data = { ...data, ddd: city.ddd, prefix: city.prefix };
        }

        return { ...prev, ...data };
      });
    },
    [setPhoneNumberForm, cities, selectedPhoneNumber?.city_id]
  );

  const getData = useCallback(async (phoneNumberId?: number) => {
    const cities = (await CityService.index({ order_by: "name" })).data;

    var phoneNumber: PhoneNumber | undefined;

    if (phoneNumberId)
      phoneNumber = (await PhoneNumberService.show(phoneNumberId)).data;

    return { phoneNumber, cities };
  }, []);

  function refresh() {
    setPhoneNumberForm({ active: true } as PhoneNumber);
    setIsRangeForm(false);
    setSufixRange("");

    setIsLoading(true);

    getData(phoneNumberId)
      .then((response) => {
        setCities(response.cities);
        setSelectedPhoneNumber(response.phoneNumber);

        if (response.phoneNumber)
          setPhoneNumberForm({
            active: response.phoneNumber.active,
            gold: response.phoneNumber.gold,
            portability: response.phoneNumber.portability,
          } as PhoneNumber);
      })
      .catch((err) => {
        if (err.response?.status === 404)
          notificate({
            title: "Aviso",
            message: "Este número de telefone não foi encontrado",
            type: "warning",
          });
        else
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar o número de telefone",
            type: "danger",
          });

        handleClose(false);

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      title={`${phoneNumberId ? "Editar" : "Adicionar"} número`}
      okLabel="Salvar"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{
        disabled: isLoading,
      }}
      fullWidth
      maxWidth="xs"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <Form
            onSubmit={(ev) => {
              ev.preventDefault();

              handleClose(true);
            }}
          >
            <div className="line">
              <SelectFilter
                label="Cidade"
                options={citiesFiltered}
                identifierAttr="id"
                nameAttr="name"
                name="city_id"
                value={
                  phoneNumberForm.city_id || selectedPhoneNumber?.city_id || ""
                }
                onChange={handleInputChange}
                required
              />
            </div>

            <Divider />

            <div className="line">
              <TextField
                className="small"
                label="DDD"
                variant="outlined"
                autoComplete="off"
                name="ddd"
                value={phoneNumberForm.ddd || selectedPhoneNumber?.ddd || ""}
                type="number"
                InputProps={{
                  readOnly: !userPermissions?.phone_number.add.change_ddd_prefix,
                }}
                onChange={(ev) => {
                  ev.target.value = parseNumber(ev.target.value, 2);

                  handleInputChange(ev);
                }}
              />
              <TextField
                label="Prefixo"
                variant="outlined"
                autoComplete="off"
                name="prefix"
                value={
                  phoneNumberForm.prefix || selectedPhoneNumber?.prefix || ""
                }
                type="number"
                InputProps={{
                  readOnly: !userPermissions?.phone_number.add.change_ddd_prefix,
                }}
                onChange={(ev) => {
                  ev.target.value = parseNumber(ev.target.value, 4);

                  handleInputChange(ev);
                }}
              />
              <span>
                <strong>-</strong>
              </span>
              <TextField
                label="Sufixo"
                variant="outlined"
                autoComplete="off"
                name="sufix"
                type="number"
                value={
                  phoneNumberForm.sufix || selectedPhoneNumber?.sufix || ""
                }
                onChange={(ev) => {
                  ev.target.value = parseNumber(ev.target.value, 4);

                  handleInputChange(ev);
                }}
              />
            </div>

            {isRangeForm && (
              <>
                <span style={{ alignSelf: "center" }}>Até</span>

                <div className="line">
                  <TextField
                    className="small"
                    label="DDD"
                    variant="outlined"
                    autoComplete="off"
                    name="ddd"
                    value={phoneNumberForm.ddd || ""}
                    type="number"
                    disabled
                  />
                  <TextField
                    label="Prefixo"
                    variant="outlined"
                    autoComplete="off"
                    name="prefix"
                    value={phoneNumberForm.prefix || ""}
                    disabled
                  />
                  <span>
                    <strong>-</strong>
                  </span>
                  <TextField
                    label="Sufixo"
                    variant="outlined"
                    autoComplete="off"
                    name="sufix"
                    value={sufixRange}
                    type="number"
                    onChange={(ev) => {
                      const value = parseNumber(ev.target.value, 4);

                      setSufixRange(value);
                    }}
                  />
                </div>
              </>
            )}

            <div className="line">
              <SwitchToggle
                label="Portabilidade"
                name="portability"
                value={phoneNumberForm.portability || false}
                onChange={handleInputChange}
              />
              <SwitchToggle
                label="Gold"
                name="gold"
                value={phoneNumberForm.gold || false}
                onChange={handleInputChange}
              />
              <SwitchToggle
                label="Ativo"
                name="active"
                value={phoneNumberForm.active || false}
                onChange={handleInputChange}
              />
            </div>

            {!phoneNumberId && userPermissions?.phone_number.add.interval && (
              <div className="line">
                <SwitchToggle
                  label="Cadastrar intervalo"
                  value={isRangeForm}
                  onChange={(ev, checked) => setIsRangeForm(Boolean(checked))}
                />
              </div>
            )}
          </Form>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(AddNumberDialog);
