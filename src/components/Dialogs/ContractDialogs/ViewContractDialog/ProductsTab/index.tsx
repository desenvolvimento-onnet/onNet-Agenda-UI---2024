import { useMemo } from "react";

import { MdAttachMoney } from "react-icons/md";

import TabBar, { TabBarProps } from "../TabBar";
import Contract from "../../../../../models/Contract";
import LabelGroup from "../../../../LabelGroup";
import Divider from "../../../../Divider";

export interface ProductsTabProps extends Omit<TabBarProps, "children"> {
  contract: Contract;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ contract, ...props }) => {
  const valuesToPay = useMemo(() => {
    var totalPrice = 0;
    var totalBenefit = 0;

    contract.products?.forEach(({ benefit, pivot }) => {
      if (benefit) totalBenefit += pivot.value * pivot.amount;
      else totalPrice += pivot.value * pivot.amount;
    });

    totalPrice = Math.max(0, totalPrice);
    totalBenefit = Math.max(0, totalBenefit);

    return {
      totalPrice,
      totalBenefit,
    };
  }, [contract.products]);

  return (
    <TabBar {...props}>
      {contract.products?.map(({ name, pivot, benefit }) => (
        <section key={pivot.id} className="multiple">
          <div className="line">
            <LabelGroup
              label={benefit ? "Benefício" : "Produto"}
              content={name}
            />

            {Boolean(pivot.value) && (
              <LabelGroup
                className="center"
                label="Valor"
                content={`R$ ${pivot.value.toFixed(2)}`}
              />
            )}

            <LabelGroup
              className="end"
              label="Quantidade"
              content={`${pivot.amount}x`}
            />
          </div>
        </section>
      ))}

      <Divider />

      <section>
        <div className="line">
          <LabelGroup
            label="Total de Produtos"
            content={`R$ ${valuesToPay.totalPrice.toFixed(2)}`}
            icon={<MdAttachMoney />}
          />

          <LabelGroup
            className="end"
            label="Total de Benefícios"
            content={`R$ ${valuesToPay.totalBenefit.toFixed(2)}`}
          />
        </div>
      </section>
    </TabBar>
  );
};

export default ProductsTab;
