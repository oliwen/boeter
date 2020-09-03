import * as React from "react";
import { Form, Button } from "semantic-ui-react";
import { Formik, FormikProps } from "formik";
import { FormField } from "../components/FormField";
import { db } from "../firebaseSetup";

export const AddPlayer: React.FC = () => {
  return (
    <div>
      <Formik
        initialValues={{
          name: "",
        }}
        onSubmit={async (values, formik) => {
          await db.collection("players").add(values);
          formik.resetForm();
          formik.setSubmitting(false);
        }}
      >
        {(props: FormikProps<any>) => (
          <Form onSubmit={props.submitForm} loading={props.isSubmitting}>
            <FormField name="name" label="Namn" />
            <Button primary fluid size="big">
              SPARA SPELARE
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
