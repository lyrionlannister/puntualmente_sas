import React, { useState, FormEvent, useRef } from "react";
import Input from "./input";
import FormBaseProps from "../types/formBaseTypes";
import formStyles from "../assets/css/form.module.css";
import InputBaseProps from "../types/inputTypes";
import controller from "../controllers/controller";
import showResponse from "../utilities/showResponse";

const FormBase: React.FC<FormBaseProps> = ({
  title,
  children,
  textContent,
  onValidate,
}) => {
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [fieldValidity, setFieldValidity] = useState<Record<string, boolean>>(
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setFieldValidity({});
    const termsCheckbox = document.querySelector<HTMLInputElement>(
      'input[name="terms"]'
    );
    if (termsCheckbox) {
      termsCheckbox.checked = false;
    }
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  const handleInputValidation = (name: string, isValid: boolean) => {
    setFieldValidity((prev) => ({
      ...prev,
      [name]: isValid,
    }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isFormValid = React.Children.toArray(children)
      .filter(
        (child) =>
          React.isValidElement<InputBaseProps>(child) && child.props.required
      )
      .every(
        (child) =>
          React.isValidElement<InputBaseProps>(child) &&
          fieldValidity[child.props.name] === true
      );

    const isTermsAccepted = fieldValidity["terms"] === true;

    if (onValidate) {
      onValidate("submit", isFormValid && isTermsAccepted);
    }

    if (!isFormValid || !isTermsAccepted) {
      return;
    }

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      const dataWithTerms: {
        [key: string]: unknown;
        terms: boolean;
      } = { ...data, terms: isTermsAccepted };

      const response = (await controller.create("/contacts", dataWithTerms)) as { id?: unknown };
      if (response.id) {
        console.log(submitSuccess);
        showResponse("Éxito", "Formulario enviado con éxito");
        resetForm();
      }
    } catch (e) {
      showResponse("Error", "Ocurrió un error al enviar el formulario", true);
      console.error(e);
    }
  };

  return (
    <div className={formStyles.formContainer}>
      <div className={formStyles.formHeader}>
        <h3 className={formStyles.formTitle}>{title}</h3>
        {textContent && <p className={formStyles.formText}>{textContent}</p>}
      </div>

      <form
        ref={formRef}
        className={formStyles.form}
        onSubmit={handleFormSubmit}
        noValidate
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<InputBaseProps>(child)) {
            return React.cloneElement(child, {
              ...child.props,
              onValidate: (name: string, isValid: boolean) => {
                if (child.props.onValidate) {
                  child.props.onValidate(name, isValid);
                }
                handleInputValidation(name, isValid);
              },
            });
          }
          return child;
        })}

        <div>
          <Input
            type="checkbox"
            name="terms"
            label="De acuerdo con la Ley 1581 de 2012 sobre Protección de Datos Personales, autorizo el tratamiento de mis datos conforme a la política de privacidad. Al proporcionar mi información, acepto los términos y condiciones establecidos para su uso y almacenamiento."
            required={true}
            dataType="terms"
            onValidate={handleInputValidation}
          />
        </div>
        <div className={formStyles.formButtons}>
          <button className={formStyles.formButton} type="submit">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBase;
