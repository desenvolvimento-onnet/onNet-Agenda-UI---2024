import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import { FiAlertTriangle, FiPercent } from "react-icons/fi";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import ConfirmDialog from "../../../components/ConfirmDialog";
import Button from "../../../components/Button";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import Composition from "../../../models/Composition";
import CompositionService from "../../../services/CompositionService";
import CompositionItem from "../../../models/CompositionItem";
import Item from "./Item";

import {
  Container,
  DialogContainer,
  ItemsContainer,
  ItemsContent,
} from "./styles";
import SwitchToggle from "../../../components/SwitchToggle";
import SelectFilter from "../../../components/SelectFilter";

const Compositions: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedComposition, setSelectedComposition] =
    useState<Composition | null>(null);
  const [compositionForm, setCompositionForm] = useState<Composition>(
    {} as Composition
  );

  const [compositions, setCompositions] = useState<Composition[]>();
  const [compositionItems, setCompositionItems] = useState<CompositionItem[]>(
    []
  );

  const [compositionItemForm, setCompositionItemForm] =
    useState<CompositionItem>({ autocomplete: false } as CompositionItem);

  // Filter compositions
  const compositionsFiltered = useMemo<Composition[]>(() => {
    if (!compositions) return [];

    const value = padronize(query);

    const data = compositions.filter(
      (composition) =>
        padronize(composition.name).indexOf(value) > -1 ||
        String(composition.min_value).indexOf(value) > -1
    );

    return data;
  }, [query, compositions]);

  function refresh() {
    setIsLoading(true);
    setCompositionItems([]);

    CompositionService.index({ order_by: "name" })
      .then((response) => setCompositions(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as composições",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function changeCompositionItems(
    compositionId: number,
    compositionItems: CompositionItem[],
    composition?: Composition
  ) {
    if (
      compositionItems.some(
        (item) =>
          !item.name ||
          !item.short_name ||
          (!item.autocomplete &&
            !item.value &&
            item.value != 0 &&
            !item.percent &&
            item.percent != 0)
      )
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data");
    }

    await CompositionService.updateCompositionItems(
      compositionId,
      compositionItems,
      composition
    );
  }

  async function inactivate(compositionId: number, active: boolean) {
    await CompositionService.update(compositionId, { active } as Composition);
  }

  async function onSubmit(composition: Composition, id?: number) {
    if (!id && !composition.name) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await CompositionService.update(id, composition);
    else await CompositionService.store(composition);
  }

  const handleDialogOpen = useCallback(
    (index: number, compositionId?: number) => {
      setCompositionForm({ active: true, min_value: 0 } as Composition);
      setCompositionItems([]);
      setSelectedComposition(null);
      setDialogOpened(index);

      if (compositionId) {
        setDialogIsLoading(true);

        CompositionService.show(compositionId)
          .then((response) => {
            setCompositionForm({
              active: Boolean(response.data.active),
              use_value: Boolean(response.data.use_value),
              min_value: response.data.min_value,
            } as Composition);
            setCompositionItems(response.data.compositionItems || []);
            setSelectedComposition(response.data);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Esta composição não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar a composição",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedComposition(null);
    },
    [
      setSelectedComposition,
      setCompositionForm,
      setDialogOpened,
      setDialogIsLoading,
    ]
  );

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(compositionForm, selectedComposition?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Já existe uma composição com este nome",
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
  }

  function inactivateDialog() {
    setDialogIsLoading(true);

    inactivate(
      Number(selectedComposition?.id),
      !Boolean(selectedComposition?.active)
    )
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro inativar/ativar a composição",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  function compositionItemsDialog() {
    setDialogIsLoading(true);

    changeCompositionItems(
      Number(selectedComposition?.id),
      compositionItems,
      compositionForm
    )
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status)
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao salvar os itens da composição",
            type: "danger",
          });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        else if (dialogOpened === 2) inactivateDialog();
        else if (dialogOpened === 3) compositionItemsDialog();
      } else setDialogOpened(null);
    },
    [compositionForm, selectedComposition, dialogOpened]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchToggle: Array<keyof Composition> = ["active", "use_value"];

      setCompositionForm((prev) => ({
        ...prev,
        [name || ""]: switchToggle.includes(name as keyof Composition)
          ? checked
          : value,
      }));
    },
    [setCompositionForm]
  );

  const handleInputItemChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean,
      id?: number
    ) => {
      var { name, value } = ev.target;

      const switchOptions: Array<keyof CompositionItem> = ["autocomplete"];

      var aditionals = {} as CompositionItem;

      if (switchOptions.includes(name as keyof CompositionItem)) {
        value = Boolean(checked);

        aditionals = {
          percent: null,
          value: null,
        } as CompositionItem;
      }

      if (id) {
        const data = compositionItems.map((compositionItem) => {
          if (compositionItem.id === id)
            return { ...compositionItem, ...aditionals, [name || ""]: value };

          return compositionItem;
        });

        setCompositionItems(data);
      } else
        setCompositionItemForm((prev) => ({
          ...prev,
          ...aditionals,
          [name || ""]: value,
        }));
    },
    [compositionItems]
  );

  const handleAddItemClick = useCallback(() => {
    const { name, short_name, value, percent, autocomplete } =
      compositionItemForm;

    if (
      !name ||
      !short_name ||
      (!autocomplete && value !== 0 && !value && value !== 0 && !percent)
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos",
        type: "info",
      });

      return;
    }

    compositionItemForm.id = new Date().getTime();

    setCompositionItems((prev) => [compositionItemForm, ...prev]);
    setCompositionItemForm({ autocomplete: false } as CompositionItem);
  }, [compositionItemForm, setCompositionItems, setCompositionItemForm]);

  const handleRemoveItemClick = useCallback(
    (id?: number) => {
      setCompositionItems((prev) =>
        prev.filter((compositionItem) => compositionItem.id !== id)
      );
    },
    [setCompositionItems]
  );

  useEffect(() => {
    var min_value = 0;

    if (compositionForm.use_value) {
      compositionItems.forEach((item) => {
        min_value += Number(item.value) || 0;
      });

      min_value = Number(min_value.toFixed(2));
    }

    setCompositionForm((prev) => ({ ...prev, min_value }));
  }, [compositionForm.use_value, compositionItems, setCompositionForm]);

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !compositions,
        }}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : compositions ? (
            compositions.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Composição</Th>
                    <Th>Tipo</Th>
                    <Th>Status</Th>
                    <Th>Valor mínimo</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {compositionsFiltered.map((composition) => (
                    <tr key={composition.id}>
                      <Td>{composition.id}</Td>
                      <Td>{composition.name}</Td>
                      <Td>{composition.use_value ? "Valor" : "Fração"}</Td>
                      {Boolean(composition.active) ? (
                        <Td
                          style={{
                            background: "var(--success)",
                            color: "var(--white)",
                          }}
                        >
                          Ativo
                        </Td>
                      ) : (
                        <Td
                          style={{
                            background: "var(--danger)",
                            color: "var(--white)",
                          }}
                        >
                          Inativo
                        </Td>
                      )}
                      <Td>{composition.min_value}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(1, composition.id)}
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(composition.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() => handleDialogOpen(2, composition.id)}
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() => handleDialogOpen(2, composition.id)}
                          />
                        )}
                      </Td>
                      <Td noBackground short>
                        <Button
                          title="Valores"
                          className="centralize"
                          icon={<FiPercent />}
                          background={"var(--secondary-dark)"}
                          onClick={() => handleDialogOpen(3, composition.id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhuma composição encontrada</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar as composições</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add composition Dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${selectedComposition?.id ? "Editar" : "Adicionar"} composição`}
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
              <TextField
                label="Nome"
                variant="outlined"
                autoComplete="off"
                name="name"
                value={compositionForm?.name || selectedComposition?.name || ""}
                onChange={handleInputChange}
                required
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate composition Dialog - INDEX 2 */}
      <ConfirmDialog
        title={`${
          Boolean(selectedComposition?.active) ? "Inativar" : "Ativar"
        } composição`}
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <p className="info">{selectedComposition?.name}</p>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* CompositionIems Dialog - INDEX 3 */}
      <ConfirmDialog
        title="Valores da composição"
        okLabel="Salvar"
        open={dialogOpened === 3}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="md"
      >
        <ItemsContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <>
              <div className="dialog-header">
                <SwitchToggle
                  label="Usar valor"
                  name="use_value"
                  value={compositionForm.use_value}
                  onChange={handleInputChange}
                />

                <SelectFilter
                  className="clone"
                  label="Clonar"
                  options={
                    compositions?.filter(
                      (composition) => selectedComposition?.id != composition.id
                    ) || []
                  }
                  identifierAttr="id"
                  nameAttr="name"
                  value=""
                  onChange={(ev) => {
                    const id = Number(ev.target.value);
                    const items = compositions?.find(
                      (composition) => composition.id === id
                    )?.compositionItems;

                    if (items) setCompositionItems(items);
                  }}
                />

                <TextField
                  label="Valor mínimo (R$)"
                  helperText="Valor mínimo para cada plano"
                  value={compositionForm.min_value}
                  type="number"
                  InputProps={{ readOnly: true }}
                />
              </div>

              <Item
                type="include"
                useValue={compositionForm.use_value}
                compositionItem={compositionItemForm}
                onChange={(ev, checked) => handleInputItemChange(ev, checked)}
                onAddClick={handleAddItemClick}
              />

              <ItemsContent>
                {compositionItems.length ? (
                  compositionItems.map((compositionItem) => (
                    <Item
                      key={compositionItem.id}
                      type="remove"
                      useValue={compositionForm.use_value}
                      compositionItem={compositionItem}
                      onChange={(ev, checked) =>
                        handleInputItemChange(ev, checked, compositionItem.id)
                      }
                      onRemoveClick={() =>
                        handleRemoveItemClick(Number(compositionItem.id))
                      }
                    />
                  ))
                ) : (
                  <MessageInfo>Nenhum item adicionado</MessageInfo>
                )}
              </ItemsContent>
            </>
          )}
        </ItemsContainer>
      </ConfirmDialog>
    </>
  );
};

export default Compositions;
