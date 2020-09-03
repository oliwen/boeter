import * as React from "react";
import { Form } from "semantic-ui-react";
import { useField } from "formik";

export const FormField: React.FC<{ label: string; name: string }> = ({
  label,
  ...props
}) => {
  const [field, meta] = useField(props);

  return (
    <Form.Field>
      <label>{label}</label>
      <input placeholder={label} {...field} {...props} />
      {meta.touched && meta.error && <div className="error">{meta.error}</div>}
    </Form.Field>
  );
};
