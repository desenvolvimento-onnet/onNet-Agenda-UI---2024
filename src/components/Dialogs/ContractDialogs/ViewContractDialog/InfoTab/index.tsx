import format from "date-fns/format";

import { ptBR } from "date-fns/locale";
import { Accordion, AccordionSummary } from "@material-ui/core";
import { MdExpandMore } from "react-icons/md";
import { FiInfo, FiMapPin } from "react-icons/fi";
import { FaRegAddressCard } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";

import TabBar, { TabBarProps } from "../TabBar";
import Contract from "../../../../../models/Contract";
import LabelGroup from "../../../../LabelGroup";
import Divider from "../../../../Divider";
import { BsPersonCheck } from "react-icons/bs";

export interface InfoTabProps extends Omit<TabBarProps, "children"> {
  contract: Contract;
}

const InfoTab: React.FC<InfoTabProps> = ({ contract, ...props }) => {
  return (
    <TabBar {...props}>
      <Accordion className="accordion-container">
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <div className="header">
            <FiInfo />
            <h3>Informações</h3>
          </div>
        </AccordionSummary>

        <section className="accordion">
          <div className="line">
            <LabelGroup label="Cliente" content={contract.client} />

            {contract.client_number && (
              <LabelGroup
                className="center"
                label="N° Cliente"
                content={contract.client_number}
              />
            )}

            <LabelGroup
              className="end"
              label="Tipo de pessoa"
              content={
                contract.legal_person
                  ? "Pessoa Jurídica (PJ)"
                  : "Pessoa Física (PF)"
              }
            />
          </div>

          <div className="line">
            <LabelGroup
              label={contract.legal_person ? "CNPJ" : "CPF"}
              content={contract.cpf_cnpj}
            />

            {contract.rg_ie && (
              <LabelGroup
                className="center"
                label={contract.legal_person ? "Inscrição Estadual" : "RG"}
                content={contract.rg_ie}
              />
            )}

            <LabelGroup
              className="end"
              label={contract.legal_person ? "Fundação" : "Nascimento"}
              content={
                contract.birthday_foundation &&
                format(new Date(contract.birthday_foundation), "dd/MM/yyyy")
              }
            />
          </div>

          {contract.legal_person
            ? (contract.fantasy_name || contract.municipal_registration) && (
                <div className="line">
                  {contract.fantasy_name && (
                    <LabelGroup
                      label="Nome Fantasia"
                      content={contract.fantasy_name}
                    />
                  )}

                  {contract.municipal_registration && (
                    <LabelGroup
                      className="end"
                      label="Inscrição Municipal"
                      content={contract.municipal_registration}
                    />
                  )}
                </div>
              )
            : (contract.father || contract.mother) && (
                <div className="line">
                  {contract.father && (
                    <LabelGroup label="Nome do pai" content={contract.father} />
                  )}

                  {contract.mother && (
                    <LabelGroup
                      className="end"
                      label="Nome da mãe"
                      content={contract.mother}
                    />
                  )}
                </div>
              )}
        </section>
      </Accordion>

      <Accordion className="accordion-container">
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <div className="header">
            <IoDocumentTextOutline />
            <h3>Contrato</h3>
          </div>
        </AccordionSummary>

        <section className="accordion">
          <div className="line">
            <LabelGroup
              label="N° Contrato"
              content={contract.contract_number}
            />

            {contract.seller && (
              <LabelGroup
                className="center"
                label="Vendedor"
                content={contract.seller}
              />
            )}

            <LabelGroup
              className="end"
              label="Tipo de Contrato"
              content={contract.contractType?.name}
            />
          </div>

          <div className="line">
            <LabelGroup
              label="Dia de vencimento"
              content={contract.expiration_day}
            />

            <LabelGroup
              className="center"
              label="Duração do contrato"
              content={`${contract.month_amount} meses`}
            />

            <LabelGroup
              className="center"
              label="Início"
              content={
                contract.accession_date &&
                format(new Date(contract.accession_date), "dd/MM/yyyy")
              }
            />

            <LabelGroup
              className="end"
              label="Término"
              content={
                contract.conclusion_date &&
                format(new Date(contract.conclusion_date), "dd/MM/yyyy")
              }
            />
          </div>

          {contract.note && (
            <div className="line detach">
              <LabelGroup label="Observação" content={contract.note} />
            </div>
          )}

          <Divider />

          <div className="line">
            <LabelGroup
              label="Plano"
              content={`(${contract.plan?.id}) ${contract.plan?.name}`}
            />

            <LabelGroup
              className="center"
              label="Mensalidade"
              content={`R$ ${contract.monthly_price.toFixed(2)}`}
            />

            <LabelGroup
              className="center"
              label="Benefício mensal"
              content={`R$ ${contract.monthly_benefit.toFixed(2)}`}
            />

            <LabelGroup
              className="end"
              label="Benefício total"
              content={`R$ ${(
                contract.monthly_benefit * contract.month_amount
              ).toFixed(2)}`}
            />
          </div>

          <Divider />

          <div className="line">
            <LabelGroup
              label="Taxa de instalação"
              content={contract.installationTax?.name}
            />

            <LabelGroup
              className="center"
              label="Valor"
              content={`R$ ${contract.installation_tax_value.toFixed(2)}`}
            />

            <LabelGroup
              className="end"
              label="Isento"
              content={contract.free_installation_tax ? "Sim" : "Não"}
            />
          </div>
        </section>
      </Accordion>

      <Accordion className="accordion-container">
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <div className="header">
            <FaRegAddressCard />
            <h3>Contato</h3>
          </div>
        </AccordionSummary>

        <section className="accordion">
          <div className="line">
            <LabelGroup label="Celular" content={contract.cellphone} />

            {contract.email && (
              <LabelGroup
                className="end"
                label="E-mail"
                content={contract.email}
              />
            )}
          </div>

          {(contract.phone01 || contract.phone02) && (
            <div className="line">
              {contract.phone01 && (
                <LabelGroup
                  label="Telefone comercial"
                  content={contract.phone01}
                />
              )}

              {contract.phone02 && (
                <LabelGroup
                  className="end"
                  label="Telefone residencial"
                  content={contract.phone02}
                />
              )}
            </div>
          )}

          {(contract.work_place || contract.work_phone) && (
            <div className="line">
              {contract.work_place && (
                <LabelGroup
                  label="Local de Trabalho"
                  content={contract.work_place}
                />
              )}

              {contract.work_phone && (
                <LabelGroup
                  className="end"
                  label="Telefone de Trabalho"
                  content={contract.work_phone}
                />
              )}
            </div>
          )}
        </section>
      </Accordion>

      <Accordion className="accordion-container">
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <div className="header">
            <FiMapPin />
            <h3>Endereço</h3>
          </div>
        </AccordionSummary>

        <section className="accordion">
          <div className="line">
            <LabelGroup label="Logradouro" content={contract.street} />

            <LabelGroup
              className="center"
              label="Bairro"
              content={contract.district}
            />

            <LabelGroup
              className="end"
              label="Número"
              content={contract.number}
            />
          </div>

          <div className="line">
            <LabelGroup
              label="Cidade"
              content={`${contract.city?.name}/${contract.city?.state}`}
            />

            {contract.complement && (
              <LabelGroup
                className="center"
                label="Complemento"
                content={contract.complement}
              />
            )}

            <LabelGroup
              className="end"
              label="CEP"
              content={contract.zip_code}
            />
          </div>
        </section>
      </Accordion>

      <Divider />

      <section>
        <div className="line">
          <LabelGroup
            label="Usuário de importação"
            content={contract?.user?.short_name}
            icon={<BsPersonCheck />}
          />

          <LabelGroup
            className="center"
            label="Sistema de Origem"
            content={contract.system?.name}
          />

          <LabelGroup
            className="end"
            label="Data de importação"
            content={
              contract?.created_at &&
              format(
                new Date(contract?.created_at),
                "dd MMM, yyyy || HH:mm'h'",
                {
                  locale: ptBR,
                }
              )
            }
          />
        </div>
      </section>
    </TabBar>
  );
};

export default InfoTab;
