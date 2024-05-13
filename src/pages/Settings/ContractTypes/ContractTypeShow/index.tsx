import { useRef, useState, useCallback, useEffect } from "react";

import { IoCodeSlashOutline } from "react-icons/io5";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as EditorProps } from "tinymce";
import { FiAlertOctagon } from "react-icons/fi";
import { AppBar, CircularProgress, Tab, Tabs } from "@material-ui/core";
import { MdChevronLeft } from "react-icons/md";
import { useHistory, useParams } from "react-router-dom";

import { ContractCSS } from "../../../../global/globalStyles";
import { notificate } from "../../../../global/notificate";

import TinymceService from "../../../../services/TinymceService";
import Button from "../../../../components/Button";
import ContractType from "../../../../models/ContractType";
import ContractTypeService from "../../../../services/ContractTypeService";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import FunctionsTab from "./FuncionsTab";
import KeysTab from "./KeysTab";
import ListsTab from "./ListsTab";

import { Container, Header, Content, DialogContainer } from "./styles";

const ContractTypeShow: React.FC = () => {
  const { goBack } = useHistory();

  const { id } = useParams() as { id: string };

  const editorRef = useRef<EditorProps>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const [contractType, setContractType] = useState<ContractType>();

  const getToken = useCallback(async (success: any) => {
    const { token } = (await TinymceService.getToken()).data;

    success({ token });
  }, []);

  const handleSave = useCallback(() => {
    const editor = editorRef.current;

    if (id && editor) {
      const content = editor.getContent({
        format: "html",
      });

      const template = `
        ${content}
        <style>
          ${ContractCSS}
        </style>
      `;

      setIsLoading(true);

      ContractTypeService.update(Number(id), { template } as ContractType)
        .then(() => {
          editor.setDirty(false);
          setDirty(false);
        })
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status}`,
            message: "Ocorreu um erro ao salvar o template",
            type: "danger",
          });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, editorRef]);

  const handleDiscardChanges = useCallback(() => {
    if (dirty) window.confirm("Deseja descartar as alterações?") && goBack();
    else goBack();
  }, [dirty]);

  function refresh(id: number) {
    setIsLoading(true);

    ContractTypeService.show(id)
      .then((response) => setContractType(response.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          notificate({
            title: `Erro ${err.response?.status}`,
            message: "O tipo de contrato não foi encontrado",
            type: "danger",
          });
        } else
          notificate({
            title: `Erro ${err.response?.status}`,
            message: "Ocorreu um erro ao carregar o template",
            type: "danger",
          });

        goBack();
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (id) refresh(Number(id));
  }, [id]);

  return (
    <>
      <Container
        onSubmit={(ev) => {
          ev.preventDefault();
          handleSave();
        }}
      >
        <Header>
          <Button
            title="Voltar"
            icon={<MdChevronLeft />}
            onClick={handleDiscardChanges}
            iconSize={20}
            background="var(--secondary-dark)"
            disabled={isLoading}
            type="button"
          />

          <div className="title">
            {isLoading ? (
              <CircularProgress />
            ) : (
              <h2 title={contractType?.name}>{contractType?.name}</h2>
            )}
          </div>

          <Button
            title="Variáveis do template"
            icon={<IoCodeSlashOutline />}
            background="var(--info)"
            type="button"
            onClick={() => setDialogIsOpen(true)}
          >
            Variáveis
          </Button>

          <Button
            title="Salvar template"
            background="var(--success)"
            type="submit"
            disabled={!dirty || isLoading}
          >
            Salvar
          </Button>
        </Header>

        <Content>
          {dirty && (
            <div className="alert">
              <FiAlertOctagon color="var(--warning)" />{" "}
              <span>Existem modificações não salvas</span>
            </div>
          )}

          {contractType && (
            <Editor
              apiKey="qtb74017qg9mw7q886wwznhayolo96tu4mfxarw9fcvaxjkg"
              onInit={(ev, editor) => ((editorRef.current as any) = editor)}
              onDirty={() => setDirty(true)}
              disabled={isLoading}
              initialValue={contractType.template || ""}
              init={{
                width: "100%",
                height: "100%",
                language: "pt_BR",
                plugins:
                  "code print preview importcss tinydrive pagebreak searchreplace save autosave directionality visualblocks visualchars fullscreen image link table charmap hr toc advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons",
                menubar: "file edit view insert format tools table tc help",
                toolbar:
                  "fullscreen print code | undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | charmap emoticons | image link | ltr rtl | preview",
                save_onsavecallback: handleSave,
                content_style: ContractCSS,
                image_advtab: true,
                image_caption: true,
                importcss_append: true,
                tinydrive_token_provider: getToken,
                content_css: false,
                pagebreak_separator:
                  '<p style="page-break-after: always;"></p>',
                fontsize_formats:
                  "8pt 9pt 10pt 10.5pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
                quickbars_selection_toolbar:
                  "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                noneditable_noneditable_class: "mceNonEditable",
                toolbar_mode: "floating",
                spellchecker_ignore_list: ["Ephox", "Moxiecode"],
                contextmenu: "link image imagetools table",
              }}
            />
          )}
        </Content>
      </Container>

      <ConfirmDialog
        title="Variáveis do template"
        okLabel=""
        cancelLabel="Fechar"
        open={dialogIsOpen}
        onClose={() => setDialogIsOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ style: { height: "100%" } }}
      >
        <DialogContainer>
          <AppBar
            position="sticky"
            color="default"
            style={{ boxShadow: "none", margin: 0 }}
          >
            <Tabs
              value={tabIndex}
              onChange={(ev, index) => setTabIndex(Number(index))}
              style={{ background: "#fff" }}
            >
              <Tab label="Variáveis" value={0} />
              <Tab label="Funções" value={1} />
              <Tab label="Listas" value={2} />
            </Tabs>
          </AppBar>

          <KeysTab active={tabIndex === 0} />
          <FunctionsTab active={tabIndex === 1} />
          <ListsTab active={tabIndex === 2} />
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default ContractTypeShow;
