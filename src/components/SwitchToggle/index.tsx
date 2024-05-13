import {
  FormControlLabel,
  FormControlLabelProps,
  Switch,
  SwitchProps,
} from "@material-ui/core";
import { ChangeEvent } from "react";

interface SwitchToggleProps extends SwitchProps {
  value?: boolean;
  name?: string;
  label: string;
  formControlLabelProps?: Omit<
    FormControlLabelProps,
    "control" | "label" | "name" | "onChange"
  >;
  onChange?: (
    ev: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
    >,
    checked?: boolean
  ) => void;
}

const SwitchToggle: React.FC<SwitchToggleProps> = ({
  value,
  name,
  label,
  onChange,
  formControlLabelProps,
  ...props
}) => {
  return (
    <FormControlLabel
      style={{ margin: 0 }}
      {...formControlLabelProps}
      label={label}
      name={name}
      onChange={onChange}
      checked={Boolean(value)}
      control={<Switch color="primary" {...props} checked={Boolean(value)} />}
    />
  );
};

export default SwitchToggle;
