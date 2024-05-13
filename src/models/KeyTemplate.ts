import { format } from "date-fns";
import { padronize } from "../global/globalFunctions";

import Composition from "./Composition";
import Contract from "./Contract";

type Key =
  | "codigo_contrato"
  | "cliente"
  | "tipo_pessoa"
  | "nome_fantasia"
  | "inscricao_municipal"
  | "cpf_cnpj"
  | "rg_ie"
  | "email"
  | "fone_residencial"
  | "fone_comercial"
  | "fone_trabalho"
  | "celular"
  | "nascimento_fundacao"
  | "nome_pai"
  | "nome_mae"
  | "local_trabalho"
  | "endereco"
  | "bairro"
  | "complemento_endereco"
  | "numero_endereco"
  | "cidade"
  | "uf"
  | "cep"
  | "plano_internet"
  | "velocidade_download"
  | "velocidade_upload"
  | "mensalidade"
  | "beneficio_mensal"
  | "dia_vencimento"
  | "taxa_instalacao"
  | "valor_taxa_instalacao"
  | "isento_taxa_instalacao"
  | "observacao"
  | "data_adesao"
  | "data_termino"
  | "duracao_fidelidade"
  | "consultor_crm"
  | "valor_total_produtos"
  | "quantidade_total_produtos"
  | "valor_total_beneficios"
  | "quantidade_total_beneficios"
  | "ddr";

type List = "produtos" | "beneficios" | "numeros_telefone" | "composicoes";

type Func =
  | "soma"
  | "subtrai"
  | "multiplica"
  | "divide"
  | "inteiro"
  | "compara";

type ProductKeys = "nome" | "valor" | "quantidade";
type PhoneNumberKeys = "ddd" | "prefixo" | "sufixo" | "numero" | "tipo";
type CompositionKeys = "nome" | "abreviacao" | "valor_cf" | "valor_sf";

export interface KeyProp {
  name: Key;
  value?: string | null;
  description: string;
}

export interface ListKeyProp<T> {
  name: T;
  value?: string;
  description: string;
}

export interface ListProp {
  name: List;
  keys: Array<ListKeyProp<ProductKeys | PhoneNumberKeys | CompositionKeys>[]>;
  description: string;
}

export interface FuncProp {
  name: Func;
  method: (...args: Array<number | string>) => string;
  description: string;
}

interface ParsedComposition {
  name: string;
  shortName: string;
  valueCF: number;
  valueSF: number;
}

class KeyTemplate {
  public keys: KeyProp[];
  public funcs: FuncProp[];
  public lists: ListProp[];

  private executeFunc(key: Func, params: string) {
    const reg = new RegExp(`([a-z]+)\\((.*?)\\)`, "g");

    params.match(reg)?.forEach((childrenFunc) => {
      const [childrenKey, childrenParams] = childrenFunc
        .replace(reg, "$1\\$2")
        .split("\\");

      const value = this.executeFunc(childrenKey as Func, childrenParams);

      params = params.replace(childrenFunc, value || childrenFunc);
    });

    const parsedParams = params.split(",").map((param) => param);

    const currentFunction = this.funcs.find((func) => func.name === key);

    return currentFunction
      ? currentFunction.method(...parsedParams)
      : `{{ ${key}(${params}) }}`;
  }

  private createList(doc: Document, name: List, id: string): string {
    const line = doc.getElementById(id);
    const list = this.lists.find((list) => list.name === name);

    if (line && list?.keys.length && list.keys[0][0].value)
      list?.keys.forEach((keys) => {
        var lineChildren = line.innerHTML;

        keys.forEach((key) => {
          const reg = new RegExp(
            `(&lt;){2}\\s?${name}\\((${key.name})\\)\\s?(&gt;){2}`,
            "g"
          );

          lineChildren = lineChildren.replace(reg, key.value || "");
        });

        const newLine = line.cloneNode() as HTMLElement;

        newLine.removeAttribute("id");
        newLine.innerHTML = lineChildren;

        line.parentElement?.insertBefore(newLine, line);
      });

    line?.remove();

    return doc.body.innerHTML;
  }

  public parseCompositions(
    composition: Composition,
    price: number,
    benefit: number
  ) {
    benefit += price;

    var items = composition?.compositionItems;

    if (!composition || !items) return;

    const compositions: ParsedComposition[] = [];
    const diferenceBetweenValues = benefit / price;
    const autocompleteAmount = items.filter((item) => item.autocomplete).length;

    var totalCF = 0;
    var totalSF = 0;

    if (!composition.use_value)
      items = items.map((item) => {
        item.value = price * ((item.percent || 0) / 100);

        return item;
      });

    items.forEach((item) => {
      if (!item.autocomplete) {
        item.value = item.value || 0;

        const valueCF = item.value;
        const valueSF = item.value * diferenceBetweenValues;

        totalCF += valueCF;
        totalSF += valueSF;

        compositions.push({
          name: item.name,
          shortName: item.short_name,
          valueCF,
          valueSF,
        });
      }
    });

    const eachAutocompleteValue = Math.max(
      0,
      (price - totalCF) / autocompleteAmount
    );

    items.forEach((item) => {
      if (item.autocomplete) {
        const valueCF = eachAutocompleteValue;
        const valueSF = eachAutocompleteValue * diferenceBetweenValues;

        totalCF += valueCF;
        totalSF += valueSF;

        compositions.unshift({
          name: item.name,
          shortName: item.short_name,
          valueCF,
          valueSF,
        });
      }
    });

    return { compositions, totalCF, totalSF };
  }

  public parseKeys(doc: Document) {
    var text = doc.body.innerHTML;

    this.keys.forEach((key) => {
      const reg = new RegExp(`\\[{2}\\s?${key.name}\\s?\\]{2}`, "g");
      const value = key.value;

      text = text.replace(reg, value || "");
    });

    doc.body.innerHTML = text;
  }

  public parseFuncs(doc: Document) {
    var text = doc.body.innerHTML;

    this.funcs.forEach((func) => {
      const reg = new RegExp(
        `\\{{2}\\s?(${func.name})\\((.*?)\\)\\s?\\}{2}`,
        "g"
      );

      text.match(reg)?.forEach((trigger) => {
        const [key, params] = trigger.replace(reg, "$1\\$2").split("\\");
        const value = this.executeFunc(key as Func, params) || "";

        text = text.replace(trigger, value);
      });
    });

    doc.body.innerHTML = text;
  }

  public parseList(doc: Document) {
    this.lists.forEach((list) => {
      const reg = new RegExp(
        `(&lt;){2}\\s?\\$${list.name}\\((.*?)(,\\s?(.*?))?\\)\\s?(&gt;){2}`,
        "g"
      );

      doc.body.innerHTML.match(reg)?.forEach((trigger) => {
        const [id, title] = trigger.replace(reg, "$2\\$4").split("\\");

        if (id && doc.getElementById(id)) {
          doc.body.innerHTML = this.createList(doc, list.name, id).replace(
            trigger,
            title || ""
          );
        }
      });
    });
  }

  public parseAll(doc: Document) {
    this.parseKeys(doc);
    this.parseList(doc);
    this.parseFuncs(doc);
  }

  constructor(contract?: Contract) {
    const products = contract?.products?.filter((product) => !product.benefit);
    const benefits = contract?.products?.filter((product) => product.benefit);

    var productValues = {
      totalProducts: 0,
      totalBenefits: 0,
      totalProductsAmount: 0,
      totalBenefitsAmount: 0,
    };

    var contractValues = {
      compositions: [] as ParsedComposition[],
      totalCF: 0,
      totalSF: 0,
    };

    const productKeys: Array<ListKeyProp<ProductKeys>[]> = [];
    const benefitKeys: Array<ListKeyProp<ProductKeys>[]> = [];
    const phoneNumberKeys: Array<ListKeyProp<PhoneNumberKeys>[]> = [];
    const compositionKeys: Array<ListKeyProp<CompositionKeys>[]> = [];

    if (contract?.plan?.composition) {
      const values = this.parseCompositions(
        contract.plan.composition,
        contract.monthly_price,
        contract.monthly_benefit
      );

      contractValues = {
        compositions: values?.compositions || [],
        totalCF: values?.totalCF || 0,
        totalSF: values?.totalSF || 0,
      };
    }

    contract?.products?.forEach((product) => {
      if (product.benefit) {
        productValues.totalBenefits +=
          product.pivot.value * product.pivot.amount;
        productValues.totalBenefitsAmount += product.pivot.amount;
      } else {
        productValues.totalProducts +=
          product.pivot.value * product.pivot.amount;
        productValues.totalProductsAmount += product.pivot.amount;
      }
    });

    if (products?.length)
      products.forEach((product) => {
        productKeys.push([
          { name: "nome", value: product.name, description: "Nome do produto" },
          {
            name: "valor",
            value: product.pivot.value.toFixed(2),
            description: "valor do produto",
          },
          {
            name: "quantidade",
            value: product.pivot.amount.toString(),
            description: "Quantidade total de produtos",
          },
        ]);
      });
    else
      productKeys.push([
        { name: "nome", description: "Nome do produto" },
        { name: "valor", description: "Valor do produto" },
        { name: "quantidade", description: "Quantidade total de produtos" },
      ]);

    if (benefits?.length)
      benefits.forEach((benefit) => {
        benefitKeys.push([
          {
            name: "nome",
            value: benefit.name,
            description: "Nome do benefício",
          },
          {
            name: "valor",
            value: benefit.pivot.value.toFixed(2),
            description: "Valor do benefício",
          },
          {
            name: "quantidade",
            value: benefit.pivot.amount.toString(),
            description: "Quantidade total de benefícios",
          },
        ]);
      });
    else
      benefitKeys.push([
        { name: "nome", description: "Nome do benefício" },
        { name: "valor", description: "Valor do benefício" },
        { name: "quantidade", description: "Quantidade total de benefícios" },
      ]);

    if (contract?.phoneNumbers?.length) {
      if (contract.ddr) {
        const normalPhoneNumbers = contract.phoneNumbers
          .filter((phoneNumber) => !phoneNumber.portability)
          .sort((a, b) => {
            if (a.sufix > b.sufix) return 1;
            else if (a.sufix < b.sufix) return -1;

            return 0;
          });

        const portabilityPhoneNumbers = contract.phoneNumbers
          .filter((phoneNumber) => phoneNumber.portability)
          .sort((a, b) => {
            if (a.sufix > b.sufix) return 1;
            else if (a.sufix < b.sufix) return -1;

            return 0;
          });

        // Verify witch one is portability
        if (
          normalPhoneNumbers.length >= 2 &&
          portabilityPhoneNumbers.length >= 2
        )
          contract.phoneNumbers = [
            normalPhoneNumbers[0],
            normalPhoneNumbers[normalPhoneNumbers.length - 1],
            portabilityPhoneNumbers[0],
            portabilityPhoneNumbers[portabilityPhoneNumbers.length - 1],
          ];
        else if (normalPhoneNumbers.length >= 2)
          contract.phoneNumbers = [
            normalPhoneNumbers[0],
            normalPhoneNumbers[normalPhoneNumbers.length - 1],
            ...portabilityPhoneNumbers,
          ];
        else if (portabilityPhoneNumbers.length >= 2)
          contract.phoneNumbers = [
            portabilityPhoneNumbers[0],
            portabilityPhoneNumbers[portabilityPhoneNumbers.length - 1],
            ...normalPhoneNumbers,
          ];
      }

      contract.phoneNumbers.forEach((phoneNumber) =>
        phoneNumberKeys.push([
          {
            name: "ddd",
            value: phoneNumber.ddd,
            description: "DDD do número",
          },
          {
            name: "numero",
            value: phoneNumber.number,
            description: "Número completo",
          },
          {
            name: "prefixo",
            value: phoneNumber.prefix,
            description: "Prefixo do número",
          },
          {
            name: "sufixo",
            value: phoneNumber.sufix,
            description: "Sufixo do número",
          },
          {
            name: "tipo",
            value: phoneNumber.portability
              ? "PORTABILIDADE"
              : phoneNumber.gold
              ? "GOLD"
              : "",
            description: "Sufixo do número",
          },
        ])
      );
    } else
      phoneNumberKeys.push([
        { name: "ddd", description: "DDD do número" },
        { name: "numero", description: "Número completo" },
        { name: "prefixo", description: "Prefixo do número" },
        { name: "sufixo", description: "Sufixo do número" },
        {
          name: "tipo",
          description: "Tipo do número (PORTABILIDADE ou GOLD)",
        },
      ]);

    if (contractValues.compositions.length)
      contractValues.compositions.forEach((item) =>
        compositionKeys.push([
          {
            name: "nome",
            value: item.name,
            description: "Nome da composição (emitente)",
          },
          {
            name: "abreviacao",
            value: item.shortName,
            description: "Nome da composição (emitente) abreviado",
          },
          {
            name: "valor_cf",
            value: item.valueCF.toFixed(2),
            description: "Valor a pagar com benefício",
          },
          {
            name: "valor_sf",
            value: item.valueSF.toFixed(2),
            description: "Valor a pagar sem benefício",
          },
        ])
      );
    else
      compositionKeys.push([
        { name: "nome", description: "Nome da composição (emitente)" },
        {
          name: "abreviacao",
          description: "Nome da composição (emitente) abreviado",
        },
        { name: "valor_cf", description: "Valor a pagar com benefício" },
        { name: "valor_sf", description: "Valor a pagar sem benefício" },
      ]);

    this.keys = [
      {
        name: "codigo_contrato",
        value: contract?.contract_number.toString(),
        description: "Código do contrato importado",
      },
      {
        name: "cliente",
        value: contract?.client,
        description: "Nome completo do cliente",
      },
      {
        name: "tipo_pessoa",
        value:
          contract?.legal_person !== undefined
            ? contract.legal_person
              ? "Pessoa Jurídica"
              : "Pessoa Física"
            : undefined,
        description: "Tipo de pessoa (Física ou Jurídica) do cliente",
      },
      {
        name: "cpf_cnpj",
        value: contract?.cpf_cnpj,
        description: "CPF ou CNPJ do cliente",
      },
      {
        name: "nome_fantasia",
        value: contract?.fantasy_name,
        description: "Nome fantasia do cliente",
      },
      {
        name: "inscricao_municipal",
        value: contract?.municipal_registration,
        description: "Inscição Municipal do cliente",
      },
      {
        name: "nascimento_fundacao",
        value: contract?.birthday_foundation
          ? format(new Date(contract.birthday_foundation), "dd/MM/yyyy")
          : undefined,
        description: "Data de nascimento ou fundação do cliente",
      },
      {
        name: "rg_ie",
        value: contract?.rg_ie,
        description: "RG ou Inscrição Estadual do cliente",
      },
      {
        name: "email",
        value: contract?.email,
        description: "E-mail do cliente",
      },
      {
        name: "fone_residencial",
        value: contract?.phone01,
        description: "Telefone residencial do cliente",
      },
      {
        name: "fone_comercial",
        value: contract?.work_phone,
        description: "Telefone comercial do cliente",
      },
      {
        name: "fone_trabalho",
        value: contract?.work_place,
        description: "Telefone de trabalho do cliente",
      },
      {
        name: "celular",
        value: contract?.cellphone,
        description: "Celular do cliente",
      },
      {
        name: "nome_pai",
        value: contract?.father,
        description: "Nome do pai do cliente",
      },
      {
        name: "nome_mae",
        value: contract?.mother,
        description: "Nome da mãe do cliente",
      },
      {
        name: "local_trabalho",
        value: contract?.work_place,
        description: "Local de trabalho do cliente",
      },
      {
        name: "endereco",
        value: contract?.street,
        description: "Logradouro do cliente",
      },
      {
        name: "bairro",
        value: contract?.district,
        description: "Bairro do cliente",
      },
      {
        name: "complemento_endereco",
        value: contract?.complement,
        description: "Complemento de endereço do cliente",
      },
      {
        name: "cidade",
        value: contract?.city?.name,
        description: "Cidade do cliente",
      },
      {
        name: "uf",
        value: contract?.city?.state,
        description: "Unidade Federativa (UF) do cliente",
      },
      { name: "cep", value: contract?.zip_code, description: "CEP do cliente" },
      {
        name: "numero_endereco",
        value: contract?.number,
        description: "Número do endereço do cliente",
      },
      {
        name: "plano_internet",
        value: contract?.plan?.name,
        description: "Nome do plano",
      },
      {
        name: "velocidade_download",
        value: contract?.plan?.download,
        description: "Velocidade de download do plano",
      },
      {
        name: "velocidade_upload",
        value: contract?.plan?.upload,
        description: "Velocidade de upload do plano",
      },
      {
        name: "consultor_crm",
        value: contract?.seller,
        description: "Consultor CRM (Vendedor) do contrato",
      },
      {
        name: "mensalidade",
        value: contractValues.totalCF.toFixed(2),
        description: "Valor da mensalidade (R$) do contrato",
      },
      {
        name: "beneficio_mensal",
        value: (contractValues.totalSF - contractValues.totalCF).toFixed(2),
        description: "Valor do benefício mensal (R$) do contrato",
      },
      {
        name: "dia_vencimento",
        value: contract?.expiration_day.toString(),
        description: "Dia do vencimento do contrato",
      },
      {
        name: "duracao_fidelidade",
        value: contract?.month_amount.toString(),
        description: "Quantidade de meses da fidelidade do contrato",
      },
      {
        name: "taxa_instalacao",
        value: contract?.installationTax?.name,
        description: "Nome da taxa de instalação",
      },
      {
        name: "valor_taxa_instalacao",
        value: contract?.installation_tax_value.toFixed(2),
        description: "Valor da taxa de instalação",
      },
      {
        name: "isento_taxa_instalacao",
        value: contract?.free_installation_tax ? "Sim" : "Não",
        description: "Indica se a taxa de instalação é isenta ou não",
      },
      {
        name: "ddr",
        value: contract?.ddr ? "Sim" : "Não",
        description: "Indica se o contrato é do tipo DDR",
      },
      {
        name: "observacao",
        value: contract?.note,
        description: "Observações adicionais do contrato",
      },
      {
        name: "data_adesao",
        value: contract?.accession_date
          ? format(new Date(contract.accession_date), "dd/MM/yyyy")
          : undefined,
        description: "Data de adesão (início) do contrato",
      },
      {
        name: "data_termino",
        value: contract?.conclusion_date
          ? format(new Date(contract.conclusion_date), "dd/MM/yyyy")
          : undefined,
        description: "Data de término (fim) do contrato",
      },
      {
        name: "valor_total_produtos",
        value: productValues.totalProducts.toFixed(2),
        description: "Valor total de produtos",
      },
      {
        name: "quantidade_total_produtos",
        value: productValues.totalProductsAmount.toString(),
        description: "Quantidade total de produtos",
      },
      {
        name: "valor_total_beneficios",
        value: productValues.totalBenefits.toFixed(2),
        description: "Valor total de benefícios",
      },
      {
        name: "quantidade_total_beneficios",
        value: productValues.totalBenefitsAmount.toString(),
        description: "Quantidade total de benefícios",
      },
    ];

    this.funcs = [
      {
        name: "soma",
        method: (...args: Array<number | string>) => {
          return (args as number[])
            .reduce((a, b) => Number(a) + Number(b))
            .toFixed(2);
        },
        description: "Soma todos os números. Exemplo: soma(2, 2) == 4.00",
      },
      {
        name: "subtrai",
        method: (...args: Array<number | string>) => {
          return (args as number[])
            .reduce((a, b) => Number(a) - Number(b))
            .toFixed(2);
        },
        description: "Subtrai todos os números. Exemplo: subtrai(4, 2) == 2.00",
      },
      {
        name: "multiplica",
        method: (...args: Array<number | string>) => {
          return (args as number[])
            .reduce((a, b) => Number(a) * Number(b))
            .toFixed(2);
        },
        description:
          "Multiplica todos os números. Exemplo: multiplica(2, 3) == 6.00",
      },
      {
        name: "divide",
        method: (...args: Array<number | string>) => {
          return (args as number[])
            .reduce((a, b) => Number(a) / Number(b))
            .toFixed(2);
        },
        description: "Divide todos os números. Exemplo: divide(6, 2) == 3.00",
      },
      {
        name: "inteiro",
        method: (...args: Array<number | string>) => {
          return args.map((arg) => parseInt(String(arg)).toString()).join(" ");
        },
        description:
          "Transforma o número em um inteiro. Exemplo: inteiro(2.51) == 2",
      },
      {
        name: "compara",
        method: (...args: Array<number | string>) => {
          const [left, right, toReplaceTrue, toReplaceFalse] = args;

          if (left && right && toReplaceTrue)
            return String(
              padronize(left.toString()) == padronize(right.toString())
                ? toReplaceTrue
                : toReplaceFalse || ""
            );

          return "NaN";
        },
        description:
          "Recebe dois primeros parâmetros para serem comparados. Caso forem iguais, o terceiro parâmetro será exibido, caso contrário o quarto parâmetro será exibido. Exemplo: compara(a, b, Iguais, Diferentes) == Diferentes",
      },
    ];

    this.lists = [
      {
        name: "produtos",
        keys: productKeys,
        description: "Produtos inclusos no contrato",
      },
      {
        name: "beneficios",
        keys: benefitKeys,
        description: "Benefícios inclusos no contrato",
      },
      {
        name: "numeros_telefone",
        keys: phoneNumberKeys,
        description: "Números de telefone alocados no contrato",
      },
      {
        name: "composicoes",
        keys: compositionKeys,
        description: "Composições fiscais do plano contratado",
      },
    ];
  }
}

export default KeyTemplate;
