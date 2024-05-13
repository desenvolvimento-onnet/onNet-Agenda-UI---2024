import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdEdit } from "react-icons/md";
import { CircularProgress, TextField } from "@material-ui/core";

import { notificate } from "../../../global/notificate";
import { padronize } from "../../../global/globalFunctions";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import { Container, DialogContainer } from "./styles";

import City from "../../../models/City";
import CityService from "../../../services/CityService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";

const Cities: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityForm, setCityForm] = useState<City>({} as City);

  const [cities, setCities] = useState<City[]>();

  // Filter cities
  const citiesFiltered = useMemo<City[]>(() => {
    if (!cities) return [];

    const value = padronize(query);

    const data = cities.filter(
      (city) => padronize(city.name).indexOf(value) > -1
    );

    return data;
  }, [query, cities]);

  function refresh() {
    setIsLoading(true);

    CityService.index({ order_by: "name" })
      .then((response) => setCities(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as cidades",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(city: City, id?: number) {
    if (!id && (!city.name || !city.ibge || !city.state)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await CityService.update(id, city);
    else await CityService.store(city);
  }

  const handleDialogOpen = useCallback((cityId?: number) => {
    setCityForm({} as City);
    setDialogIsOpen(true);

    if (cityId) {
      setDialogIsLoading(true);

      CityService.show(cityId)
        .then((response) => setSelectedCity(response.data))
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Esta cidade não foi encontrada",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar a cidade",
              type: "danger",
            });

          setDialogIsOpen(false);

          console.log(err);
        })
        .finally(() => setDialogIsLoading(false));
    } else setSelectedCity(null);
  }, []);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        setDialogIsLoading(true);

        onSubmit(cityForm, selectedCity?.id)
          .then(() => {
            setDialogIsOpen(false);
            refresh();
          })
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Já existe uma cidade com este nome ou IBGE",
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
          .finally(() => setDialogIsLoading(false));
      } else setDialogIsOpen(false);
    },
    [cityForm, selectedCity]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = ev.target;

      setCityForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), []),
          disabled: !cities,
        }}
        onAddClick={useCallback(() => handleDialogOpen(), [])}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : cities ? (
            cities.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Cidade</Th>
                    <Th>IBGE</Th>
                    <Th>UF</Th>
                    <Th>DDD</Th>
                    <Th>Prefixo</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {citiesFiltered?.map((city) => (
                    <tr key={city.id}>
                      <Td>{city.id}</Td>
                      <Td>{city.name}</Td>
                      <Td>{city.ibge}</Td>
                      <Td>{city.state}</Td>
                      <Td>{city.ddd}</Td>
                      <Td>{city.prefix}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(city.id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhuma cidade encontrada</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar as cidades</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      <ConfirmDialog
        title={`${selectedCity?.id ? "Editar" : "Adicionar"} cidade`}
        okLabel="Salvar"
        open={dialogIsOpen}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(cityForm) === "{}",
        }}
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
              <div className="line">
                <TextField
                  label="Nome"
                  autoComplete="off"
                  name="name"
                  value={cityForm?.name || selectedCity?.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="line">
                <TextField
                  label="IBGE"
                  autoComplete="off"
                  variant="outlined"
                  name="ibge"
                  value={cityForm?.ibge || selectedCity?.ibge || ""}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  label="UF"
                  autoComplete="off"
                  variant="outlined"
                  name="state"
                  value={cityForm?.state || selectedCity?.state || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="line">
                <TextField
                  label="DDD"
                  autoComplete="off"
                  variant="outlined"
                  type="number"
                  name="ddd"
                  value={cityForm?.ddd || selectedCity?.ddd || ""}
                  onChange={(ev) => {
                    ev.target.value =
                      Number(ev.target.value) < 0 ? "0" : ev.target.value;

                    handleInputChange(ev);
                  }}
                />
                <TextField
                  label="Prefixo"
                  autoComplete="off"
                  variant="outlined"
                  type="number"
                  name="prefix"
                  value={cityForm?.prefix || selectedCity?.prefix || ""}
                  onChange={(ev) => {
                    ev.target.value =
                      Number(ev.target.value) < 0 ? "0" : ev.target.value;

                    handleInputChange(ev);
                  }}
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Cities;
