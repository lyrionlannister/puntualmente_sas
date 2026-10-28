import React, { useState, FormEvent, useRef } from "react";

import Input from "./inputDark";
import InputBaseProps from "../types/inputTypes";
import FormBaseProps from "../types/formBaseTypes";
import controller from "../controllers/controller";
import showResponse from "../utilities/showResponse";
import formStyles from "../assets/css/darkForm.module.css";

const FormBase: React.FC<FormBaseProps> = ({
  title,
  children,
  textContent,
  onValidate,
  onSubmitSuccess,
}) => {
  const [fieldValidity, setFieldValidity] = useState<Record<string, boolean>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleInputValidation = (name: string, isValid: boolean) => {
    setFieldValidity((prev) => ({
      ...prev,
      [name]: isValid,
    }));
  };

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
    setSubmitError(null);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const isFormValid = React.Children.toArray(children)
      .filter(
        (child) =>
          React.isValidElement<InputBaseProps>(child) && child.props.required
      )
      .every(
        (child) =>
          React.isValidElement<InputBaseProps>(child) &&
          fieldValidity[child.props.name]
      );

    const termsCheckbox = document.querySelector<HTMLInputElement>(
      'input[name="terms"]'
    );
    const isTermsAccepted = termsCheckbox?.checked || false;

    if (onValidate) {
      onValidate("submit", isFormValid && isTermsAccepted);
    }

    if (!isFormValid || !isTermsAccepted) {
      console.error("Formulario inválido o términos no aceptados");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      const dataWithTerms: {
        [key: string]: unknown;
        amount?: string | number;
        terms: boolean;
      } = { ...data, terms: isTermsAccepted };

      if (dataWithTerms.amount) {
        dataWithTerms.amount = parseFloat(dataWithTerms.amount.toString());
      }

      const response = (await controller.create("/payments", dataWithTerms)) as { id?: unknown };
      console.log(response);
      console.log(submitSuccess);
      if (response.id) {
        resetForm();
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        window.open(
          "https://portalpagos.davivienda.com/#/comercio/10924/PUNTUALMENTE"
        );
        showResponse(
          "Éxito",
          "En breve serás redireccionado al portal de pagos"
        );
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Error desconocido al enviar el formulario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={formStyles.formContainer}>
      <div className={formStyles.formHeader}>
        <h3 className={formStyles.formTitle}>{title}</h3>
        {textContent && <p className={formStyles.formText}>{textContent}</p>}
      </div>

      {/* {submitSuccess && (
        <div className={formStyles.successMessage}>
          ¡Formulario enviado correctamente!
        </div>
      )} */}

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
          return null;
        })}

        <Input
          type="checkbox"
          name="terms"
          label={`De acuerdo con la Ley 1581 de 2012 sobre Protección de Datos Personales, autorizo el tratamiento de mis datos conforme a la política de privacidad.
            Al proporcionar mi información, acepto los términos y condiciones establecidos para su uso y almacenamiento`}
          required={true}
          dataType="terms"
        />

        {submitError && (
          <div className={formStyles.errorMessage}>{submitError}</div>
        )}

        <div className={formStyles.formButtons}>
          <button
            className={formStyles.formButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBase;
