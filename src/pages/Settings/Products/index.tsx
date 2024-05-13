import { useState, useCallback, useEffect, useMemo, ChangeEvent } from "react";

import {
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import Product from "../../../models/Product";
import SettingsChildren from "../SettingsChildren";
import ProductService from "../../../services/ProductService";
import SwitchToggle from "../../../components/SwitchToggle";

import { Container, DialogContainer } from "./styles";

const Products: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>({} as Product);

  const [products, setProducts] = useState<Product[]>();

  // Filter product
  const productFiltered = useMemo<Product[]>(() => {
    if (!products) return [];

    const value = padronize(query);

    const data = products.filter(
      (product) => padronize(product.name).indexOf(value) > -1
    );

    return data;
  }, [query, products]);

  async function getData() {
    const products = (await ProductService.index({ order_by: "name" })).data;

    return { products };
  }

  function refresh() {
    setIsLoading(true);

    getData()
      .then((response) => setProducts(response.products))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os produtos",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function inactivate(productId: number, active: boolean) {
    await ProductService.update(productId, { active } as Product);
  }

  async function onSubmit(product: Product, id?: number) {
    if (!id && (!product.name || !productForm.base_value)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos obrigatórios!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    product.base_value = Number(product.base_value);

    if (id) await ProductService.update(id, product);
    else await ProductService.store(product);
  }

  const handleDialogOpen = useCallback(
    (index: number, productId?: number) => {
      setProductForm({} as Product);
      setDialogOpened(index);

      if (productId) {
        setDialogIsLoading(true);

        ProductService.show(productId)
          .then((response) => {
            setSelectedProduct(response.data);
            setProductForm({
              active: response.data.active,
              base_value: response.data.base_value,
              benefit: Boolean(response.data.benefit),
            } as Product);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este produto não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o produto",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedProduct(null);
    },
    [setProductForm, setDialogOpened, setSelectedProduct, setDialogIsLoading]
  );

  const submitDialog = useCallback(() => {
    setDialogIsLoading(true);

    onSubmit(productForm, selectedProduct?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status)
          notificate({
            title: `Erro ${err.response.status || ""}`,
            message: "Ocorreu um erro ao salvar os dados",
            type: "danger",
          });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }, [productForm, selectedProduct, setDialogIsLoading, setDialogOpened]);

  const inactivateDialog = useCallback(() => {
    setDialogIsLoading(true);

    inactivate(Number(selectedProduct?.id), !Boolean(selectedProduct?.active))
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro inativar/ativar o produto",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }, [setDialogIsLoading, setDialogOpened, refresh]);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        else if (dialogOpened === 2) inactivateDialog();
      } else setDialogOpened(null);
    },
    [dialogOpened, submitDialog, inactivateDialog, setDialogOpened]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButtons: Array<keyof Product> = ["active", "benefit"];

      setProductForm((prev) => ({
        ...prev,
        [name || ""]: switchButtons.includes(name as keyof Product)
          ? checked
          : value,
      }));
    },
    [setProductForm]
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
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !products,
        }}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : products ? (
            products.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Produto</Th>
                    <Th>Tipo</Th>
                    <Th>Status</Th>
                    <Th>Valor</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {productFiltered.map((product) => (
                    <tr key={product.id}>
                      <Td>{product.id} </Td>
                      <Td>{product.name}</Td>
                      <Td>{product.benefit ? "Benefício" : "Produto"}</Td>
                      {Boolean(product.active) ? (
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
                      <Td>R$ {Number(product.base_value).toFixed(2)}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(1, product.id)}
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(product.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() => handleDialogOpen(2, product.id)}
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() => handleDialogOpen(2, product.id)}
                          />
                        )}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum produto encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os produtos</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add Product Dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${selectedProduct?.id ? "Editar" : "Adicionar"} produto`}
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(productForm) === "{}",
        }}
        fullWidth
        maxWidth="sm"
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
                  variant="outlined"
                  autoComplete="off"
                  name="name"
                  value={productForm?.name || selectedProduct?.name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <TextField
                  label="Valor base"
                  autoComplete="off"
                  name="base_value"
                  value={productForm?.base_value || ""}
                  type="number"
                  onChange={(ev) => {
                    ev.target.value =
                      Number(ev.target.value) < 0 ? "0" : ev.target.value;

                    handleInputChange(ev);
                  }}
                  required
                />

                <div className="short">
                  <SwitchToggle
                    label="Benefício"
                    name="benefit"
                    value={Boolean(productForm.benefit)}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate Product Dialog - INDEX 2 */}
      <ConfirmDialog
        title={`${Boolean(selectedProduct?.active) ? "Inativar" : "Ativar"} ${
          selectedProduct?.name
        }`}
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
            <p className="info">{selectedProduct?.name}</p>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Products;
