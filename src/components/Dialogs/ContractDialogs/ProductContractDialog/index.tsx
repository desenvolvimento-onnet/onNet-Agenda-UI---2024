import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps, Divider } from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import ConfirmDialog from "../../../ConfirmDialog";
import ContractService from "../../../../services/ContractService";
import Contract from "../../../../models/Contract";

import { Container, ItemsContent } from "./styles";
import Product from "../../../../models/Product";
import ContractProduct from "../../../../models/ContractProduct";
import ContractProductService from "../../../../services/ContractProductService";
import ProductService from "../../../../services/ProductService";
import ContractProductItem from "./ContractProductItem";
import MessageInfo from "../../../MessageInfo";

interface ProductContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const ProductContractDialog: React.FC<ProductContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contract, setContract] = useState<Contract>();
  const [products, setProducts] = useState<Product[]>([]);
  const [contractProducts, setContractProducts] = useState<ContractProduct[]>(
    []
  );

  const [contractProductForm, setContractProductForm] =
    useState<ContractProduct>({ value: 0, amount: 1 } as ContractProduct);

  useEffect(() => {
    if (open && !userPermissions?.contract.products.allow) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para editar os produtos do contrato",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(
    async (contract: Contract, contractProducts: ContractProduct[]) => {
      if (contract?.canceled) {
        notificate({
          title: "Aviso",
          message: "Este contrato está cancelado!",
          type: "warning",
        });

        throw new Error("Contract is canceled");
      }

      await ContractProductService.updateProducts(
        Number(contract.id),
        contractProducts
      );
    },
    []
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && contract) {
        setIsLoading(true);

        onSubmit(contract, contractProducts)
          .then(() => onClose({ index, success }))
          .catch((err) => {
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
    [onClose, index, onSubmit, contract, contractProducts]
  );

  async function getData(contract_id: number) {
    const contract = (await ContractService.show(contract_id)).data;
    const products = (await ProductService.index()).data;
    const contractProducts = (
      await ContractProductService.index({ contract_id })
    ).data;

    return { contract, products, contractProducts };
  }

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>,
      id?: number
    ) => {
      var { name, value } = ev.target;

      if (id) {
        const data = contractProducts.map((contractProduct) => {
          if (contractProduct.id === id)
            return { ...contractProduct, [name || ""]: value };

          return contractProduct;
        });

        setContractProducts(data);
      } else
        setContractProductForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [contractProducts, setContractProducts, setContractProductForm]
  );

  const handleAddClick = useCallback(() => {
    const { product_id, value, amount } = contractProductForm;

    if (!product_id || !String(value) || !String(amount)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos",
        type: "info",
      });

      return;
    }

    contractProductForm.id = new Date().getTime();

    setContractProducts((prev) => {
      var alreadyExists: boolean = false;

      prev = prev.map((contractProduct) => {
        if (
          contractProduct.product_id == product_id &&
          contractProduct.value == value
        ) {
          alreadyExists = true;

          return {
            ...contractProduct,
            amount: Number(contractProduct.amount) + Number(amount),
          };
        }

        return contractProduct;
      });

      return alreadyExists ? prev : [contractProductForm, ...prev];
    });

    setContractProductForm({ value: 0, amount: 1 } as ContractProduct);
  }, [contractProductForm, setContractProducts, setContractProductForm]);

  const handleRemoveClick = useCallback(
    (id: number) => {
      setContractProducts((prev) =>
        prev.filter((contractProduct) => contractProduct.id !== id)
      );
    },
    [setContractProducts]
  );

  function refresh() {
    setContract(undefined);
    setProducts([]);
    setContractProducts([]);
    setContractProductForm({ value: 0, amount: 1 } as ContractProduct);

    if (!contractId) {
      handleClose();

      return;
    }

    setIsLoading(true);

    getData(contractId)
      .then((response) => {
        if (response.contract.canceled) {
          notificate({
            title: "Aviso",
            message: "Este contrato está cancelado!",
            type: "warning",
          });

          handleClose();
        } else {
          setContract(response.contract);
          setProducts(response.products);
          setContractProducts(response.contractProducts);
        }
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o dados",
          type: "danger",
        });

        handleClose();

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const product = products.find(
      (product) => product.id == contractProductForm.product_id
    );

    if (product)
      setContractProductForm((prev) => ({
        ...prev,
        value: product.base_value,
      }));
  }, [setContractProductForm, contractProductForm.product_id, products]);

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId]);

  return (
    <ConfirmDialog
      open={open}
      title="Produtos do contrato"
      okLabel="Salvar"
      cancelLabel="Voltar"
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <>
            <ContractProductItem
              type="include"
              products={products.filter((product) => product.active)}
              contractProduct={contractProductForm}
              onChange={(ev) => handleInputChange(ev)}
              onAddClick={handleAddClick}
            />

            <ItemsContent>
              {contractProducts.length ? (
                contractProducts.map((contractProduct) => (
                  <ContractProductItem
                    key={contractProduct.id}
                    type="remove"
                    products={products}
                    contractProduct={contractProduct}
                    onChange={(ev) => handleInputChange(ev, contractProduct.id)}
                    onRemoveClick={() =>
                      handleRemoveClick(Number(contractProduct.id))
                    }
                  />
                ))
              ) : (
                <MessageInfo>Nenhum produto na adicionado</MessageInfo>
              )}
            </ItemsContent>
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(ProductContractDialog);
