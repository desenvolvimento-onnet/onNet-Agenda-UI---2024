import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BsShieldLock } from "react-icons/bs";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import { CircularProgress, FormHelperText, TextField } from "@material-ui/core";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import User from "../../../models/User";
import UserService from "../../../services/UserService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import Divider from "../../../components/Divider";
import CityService from "../../../services/CityService";
import City from "../../../models/City";
import SelectMultiple from "../../../components/SelectMultiple";
import RoleService from "../../../services/RoleService";
import Role from "../../../models/Role";
import SwitchToggle from "../../../components/SwitchToggle";
import Pagination from "../../../models/Pagination";

import { Container, DialogContainer } from "./styles";
import PaginateFooter from "../../../components/PaginateFooter";

const Users: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<User>({
    cities: [] as number[],
  } as User);

  const [users, setUsers] = useState<Pagination<User>>();
  const [cities, setCities] = useState<City[]>();
  const [roles, setRoles] = useState<Role[]>();

  // Filter users
  const usersFiltered = useMemo<User[]>(() => {
    if (!users) return [];

    const value = padronize(query);

    const data = users.data.filter(
      (user) =>
        padronize(user.name).indexOf(value) > -1 ||
        padronize(user.short_name).indexOf(value) > -1 ||
        padronize(user.email).indexOf(value) > -1
    );

    return data;
  }, [query, users]);

  const refreshUsers = useCallback(
    (page?: number, per_page?: number, query?: string) => {
      setIsLoading(true);

      UserService.index({ order_by: "name", page, per_page, query })
        .then((response) => setUsers(response.data))
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar os usuários",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [setUsers, setIsLoading]
  );

  const getData = useCallback(async () => {
    const cities = (await CityService.index({ order_by: "name" })).data;
    const roles = (await RoleService.index({ order_by: "name" })).data;

    return { cities, roles };
  }, []);

  function refresh(page?: number, perPage?: number) {
    setIsLoading(true);

    getData()
      .then((response) => {
        setCities(response.cities);
        setRoles(response.roles);
        refreshUsers(page || 1, perPage || 20, query);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as informações de usuário",
          type: "danger",
        });

        setIsLoading(false);

        console.log(err);
      });
  }

  async function onSubmit(user: User, id?: number) {
    if (!id && (!user.name || !user.email || !user.password)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await UserService.update(id, user);
    else await UserService.store(user);
  }

  async function inactivate(userId: number, active: boolean) {
    await UserService.update(userId, { active } as User);
  }

  async function showUser(userId: number) {
    const user = (await UserService.show(userId)).data;

    const cities = (user.cities as City[]) || [];
    const roles = (user.roles as Role[]) || [];

    const parsedCities = cities.map((city) => Number(city.id));
    const parsedRoles = roles.map((role) => Number(role.id));

    return { user, parsedCities, parsedRoles };
  }

  const handleDialogOpen = useCallback(
    (index: number, userId?: number) => {
      setUserForm({} as User);
      setDialogOpened(index);

      if (userId) {
        setDialogIsLoading(true);

        showUser(userId)
          .then((response) => {
            setSelectedUser(response.user);

            setUserForm({
              admin: response.user.admin,
              all_cities: response.user.all_cities,
              active: response.user.active,
              cities: response.parsedCities,
              roles: response.parsedRoles,
            } as User);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este usuário não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o usuário",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedUser(null);
    },
    [setUserForm, setDialogOpened, setDialogIsLoading, setSelectedUser]
  );

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(userForm, selectedUser?.id)
      .then(() => {
        setDialogOpened(null);
        refresh(users?.page, users?.perPage);
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Já existe um usuário com este nome de exibição ou email",
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

    inactivate(Number(selectedUser?.id), !Boolean(selectedUser?.active))
      .then(() => {
        setDialogOpened(null);
        refresh(users?.page, users?.perPage);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro inativar/ativar o usuário",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1 || dialogOpened === 2) submitDialog();
        else if (dialogOpened === 3) inactivateDialog();
      } else setDialogOpened(null);
    },
    [userForm, selectedUser, dialogOpened]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value?: any }>,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButton: Array<keyof User> = ["admin", "active", "all_cities"];

      setUserForm((prev) => ({
        ...prev,
        [name || ""]: switchButton.includes(name as keyof User)
          ? checked
          : value,
      }));
    },
    [setUserForm]
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
          disabled: !users,
        }}
        onAddClick={useCallback(() => handleDialogOpen(1), [])}
        onFilterSubmit={() => refreshUsers(1, users?.perPage, query)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : users ? (
            users.data.length ? (
              <>
                <Table>
                  <THead>
                    <tr>
                      <Th short>ID</Th>
                      <Th>Nome</Th>
                      <Th>Nome de exibição</Th>
                      <Th>Status</Th>
                      <Th>E-mail</Th>
                      <Th></Th>
                      <Th></Th>
                      <Th></Th>
                    </tr>
                  </THead>
                  <TBody>
                    {usersFiltered.map((user) => (
                      <tr key={user.id}>
                        <Td>{user.id}</Td>
                        <Td>{user.name}</Td>
                        <Td>{user.short_name}</Td>
                        {Boolean(user.active) ? (
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
                        <Td>{user.email}</Td>
                        <Td noBackground short>
                          <Button
                            title="Editar"
                            className="centralize"
                            background={"var(--info)"}
                            icon={<MdEdit />}
                            onClick={() => handleDialogOpen(1, user.id)}
                          />
                        </Td>
                        <Td noBackground short>
                          <Button
                            title="Permissões"
                            className="centralize"
                            icon={<BsShieldLock />}
                            background={"var(--secondary-dark)"}
                            iconSize={16}
                            onClick={() => handleDialogOpen(2, user.id)}
                          />
                        </Td>
                        <Td noBackground short>
                          {Boolean(user.active) ? (
                            <Button
                              title="Inativar / Desconectar"
                              className="centralize"
                              icon={<MdBlock />}
                              background="var(--danger)"
                              onClick={() => handleDialogOpen(3, user.id)}
                            />
                          ) : (
                            <Button
                              title="Ativar"
                              className="centralize"
                              icon={<MdCheck />}
                              background="var(--primary)"
                              onClick={() => handleDialogOpen(3, user.id)}
                            />
                          )}
                        </Td>
                      </tr>
                    ))}
                  </TBody>
                </Table>

                <PaginateFooter pagination={users} onReload={refreshUsers} />
              </>
            ) : (
              <MessageInfo>Nenhum usuário encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os usuários</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add user dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${selectedUser?.id ? "Editar" : "Adicionar"} usuário`}
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(userForm) === "{}",
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
              <TextField
                label="Nome"
                variant="outlined"
                autoComplete="off"
                name="name"
                value={userForm?.name || selectedUser?.name || ""}
                onChange={handleInputChange}
              />

              <TextField
                label="Nome de exibição"
                variant="outlined"
                autoComplete="off"
                helperText="Esse nome deve ser exclusivo para cada usuário"
                name="short_name"
                value={userForm?.short_name || selectedUser?.short_name || ""}
                onChange={handleInputChange}
              />

              <Divider />

              <TextField
                label="E-mail"
                variant="outlined"
                autoComplete="off"
                type="email"
                name="email"
                value={userForm?.email || selectedUser?.email || ""}
                onChange={handleInputChange}
              />

              <TextField
                label="Senha"
                variant="outlined"
                autoComplete="off"
                type="password"
                name="password"
                value={userForm?.password || ""}
                onChange={handleInputChange}
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* User roles dialog - INDEX 2 */}
      <ConfirmDialog
        title="Permissões"
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="sm"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : cities && roles ? (
            <div className="roles">
              <p className="info">{selectedUser?.name}</p>

              <div className="line">
                <SelectMultiple
                  label="Grupos de permissão"
                  identifierAttr="id"
                  nameAttr="name"
                  options={roles}
                  name="roles"
                  value={(userForm.roles as number[]) || []}
                  onChange={handleInputChange}
                />

                <SelectMultiple
                  label="Cidades"
                  identifierAttr="id"
                  nameAttr="name"
                  options={cities}
                  name="cities"
                  value={(userForm.cities as number[]) || []}
                  onChange={handleInputChange}
                />
              </div>

              <div className="line fitContent">
                <SwitchToggle
                  label="Administrador"
                  name="admin"
                  value={Boolean(userForm.admin) || false}
                  onChange={handleInputChange}
                />

                <SwitchToggle
                  label="Todas as Cidades"
                  name="all_cities"
                  value={Boolean(userForm.all_cities) || false}
                  onChange={handleInputChange}
                />
              </div>

              <FormHelperText>
                <strong>*Atenção:</strong> usuários administradores não precisam
                de grupos de permissão
              </FormHelperText>
            </div>
          ) : (
            <MessageInfo>Não foi possível carregar os dados</MessageInfo>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate user dialog - INDEX 3 */}
      <ConfirmDialog
        title={`${
          Boolean(selectedUser?.active) ? "Inativar" : "Ativar"
        } usuário`}
        open={dialogOpened === 3}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <p className="info">{selectedUser?.name}</p>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Users;
