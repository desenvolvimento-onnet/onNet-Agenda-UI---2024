import React, {
  HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { FaWrench } from "react-icons/fa";
import { FiEye, FiPrinter, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Button, Menu, MenuItem } from "@material-ui/core";
import { GrUpdate } from "react-icons/gr";
import {
  MdAutorenew,
  MdClose,
  MdEdit,
  MdFileUpload,
  MdLocalPhone,
  MdMoreVert,
} from "react-icons/md";

import { AuthContext } from "../../global/context/AuthContext";
import { InfoCoinContainer, InfoCoin } from "../InfoCoin";
import { Table, THead, TBody, Th, Td } from "../Table";

import useContractDialog from "../Dialogs/ContractDialogs/context/useContractDialog";
import Pagination from "../../models/Pagination";
import Contract from "../../models/Contract";
import MessageInfo from "../MessageInfo";
import PaginateFooter from "../PaginateFooter";

import format from "date-fns/format";
import Divider from "../Divider";

import { Container } from "./styles";

interface ContractListProps extends HTMLAttributes<HTMLTableElement> {
  contracts: Pagination<Contract>;
  onReload?: (page: number, perPage: number) => void;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts,
  children,
  onReload,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const {
    viewContractDialog,
    addContractDialog,
    fixContractDialog,
    productContractDialog,
    renewContractDialog,
    deleteContractDialog,
    printContractDialog,
  } = useContractDialog();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] = useState<Contract>();

  function handleMoreClick(
    ev: React.MouseEvent<HTMLButtonElement>,
    contract: Contract
  ) {
    setSelectedContract(contract);
    setAnchorEl(ev.currentTarget);
  }

  useEffect(() => {
    if (!anchorEl) setSelectedContract(undefined);
  }, [anchorEl, setSelectedContract]);

  return (
    <>
      <Container>
        {contracts.data.length ? (
          <>
            <Table cellSpacing={3} {...props}>
              <THead>
                <tr>
                  <Th>Contrato</Th>
                  <Th>Cliente</Th>
                  <Th noContent></Th>
                  <Th>Tipo</Th>
                  <Th>Plano</Th>
                  <Th>Adesão</Th>
                  <Th>Término</Th>
                  <Th>Endereço</Th>
                  <Th short></Th>
                </tr>
              </THead>
              <TBody>
                {contracts.data.map((contract) => (
                  <tr key={contract.id}>
                    <Td noWrap>
                      {contract.client_number
                        ? `${contract.client_number} (${contract.contract_number})`
                        : contract.contract_number}
                    </Td>
                    <Td>{contract.client}</Td>
                    <Td noBackground noContent>
                      {Boolean(
                        contract.phoneNumbers?.length ||
                          contract.canceled ||
                          contract.renewed
                      ) && (
                        <InfoCoinContainer>
                          {/* <InfoCoin
                          icon={<MdTimelapse />}
                          title="Cancelado"
                          type="orange"
                        /> */}

                          {Boolean(contract.renewed) && (
                            <InfoCoin
                              icon={<MdAutorenew />}
                              title="Renovado"
                              type="iceGreen"
                            />
                          )}

                          {Boolean(contract.phoneNumbers?.length) && (
                            <InfoCoin
                              icon={<MdLocalPhone />}
                              title={`Telefonia ${
                                contract.phoneNumbers?.some(({ gold }) => gold)
                                  ? "Gold"
                                  : ""
                              } `}
                              type={
                                contract.phoneNumbers?.some(({ gold }) => gold)
                                  ? "gold"
                                  : "blue"
                              }
                            />
                          )}

                          {Boolean(contract.canceled) && (
                            <InfoCoin
                              icon={<MdClose />}
                              title="Cancelado"
                              type="red"
                            />
                          )}
                        </InfoCoinContainer>
                      )}
                    </Td>
                    <Td>{contract.contractType?.name}</Td>
                    <Td>{contract.plan?.name}</Td>
                    <Td>
                      {format(
                        new Date(contract.accession_date as Date),
                        "dd/MM/yyyy"
                      )}
                    </Td>
                    <Td>
                      {format(
                        new Date(contract.conclusion_date as Date),
                        "dd/MM/yyyy"
                      )}
                    </Td>
                    <Td>
                      {contract.street}, {contract.district},{" "}
                      {contract.city?.name}
                    </Td>
                    <Td short noBackground>
                      <Button onClick={(ev) => handleMoreClick(ev, contract)}>
                        <MdMoreVert size={24} />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>

            <PaginateFooter pagination={{ ...contracts }} onReload={onReload} />
          </>
        ) : (
          <MessageInfo>Nenhum contrato encontrado</MessageInfo>
        )}
      </Container>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={useCallback(() => setAnchorEl(null), [])}
        MenuListProps={{ style: { minWidth: "4rem" } }}
      >
        {Boolean(userPermissions?.contract.show) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract &&
                viewContractDialog(
                  Number(selectedContract.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
          >
            <FiEye />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Visualizar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.edit) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract &&
                addContractDialog(
                  { contractId: Number(selectedContract.id) },
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedContract ||
              Boolean(selectedContract.canceled)
            }
          >
            <MdEdit />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Editar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.fix.allow) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract?.system &&
                fixContractDialog(
                  selectedContract.system,
                  {
                    contract_number: selectedContract.contract_number,
                    client_number: selectedContract.client_number || undefined,
                  },
                  Number(selectedContract?.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedContract ||
              Boolean(selectedContract.canceled)
            }
          >
            <FaWrench />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Ajustar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.products.allow) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract &&
                productContractDialog(
                  Number(selectedContract?.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedContract ||
              Boolean(selectedContract.canceled)
            }
          >
            <FiShoppingCart />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Produtos
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.renew.allow) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract &&
                renewContractDialog(
                  Number(selectedContract?.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
            disabled={
              !anchorEl ||
              !selectedContract ||
              Boolean(selectedContract.canceled)
            }
          >
            <MdAutorenew />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Renovar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.delete) && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              selectedContract &&
                deleteContractDialog(
                  Number(selectedContract?.id),
                  (success) =>
                    success &&
                    onReload &&
                    onReload(contracts.page, contracts.perPage)
                );
            }}
            disabled={!anchorEl || !selectedContract}
          >
            <FiTrash2 />
            <span className="menu-option" style={{ marginLeft: 10 }}>
              Deletar
            </span>
          </MenuItem>
        )}

        {Boolean(userPermissions?.contract.print) && (
          <div>
            <Divider />

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                selectedContract &&
                  printContractDialog(Number(selectedContract?.id));
              }}
              disabled={!anchorEl || !selectedContract}
            >
              <FiPrinter />
              <span className="menu-option" style={{ marginLeft: 10 }}>
                Imprimir
              </span>
            </MenuItem>
          </div>
        )}
      </Menu>
    </>
  );
};

export default memo(ContractList);
