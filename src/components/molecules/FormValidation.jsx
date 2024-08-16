import React, { useMemo, useCallback } from "react";
import { View } from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import PropTypes from "prop-types";

/**
 * Componente de validación de formularios utilizando Formik y Yup.
 *
 * @param {Object} props
 * @param {Object} props.initialValues Valores iniciales del formulario.
 * @param {Array} props.validationInput Array de objetos que define la validación para cada campo.
 * @param {Function} props.onSubmit Función que se llama al enviar el formulario.
 * @param {Function} props.children Función que recibe las props del formulario y renderiza el formulario.
 */
const FormValidation = ({
  initialValues,
  validationInput,
  onSubmit,
  children,
}) => {
  // Crear el esquema de validación basado en validationInput
  const validationSchema = useMemo(() => {
    const buildValidator = (input) => {
      let validator;

      switch (input.type) {
        case "string":
          validator = yup.string();
          if (input.min)
            validator = validator.min(
              input.min,
              input.minMessage || `Debe tener al menos ${input.min} caracteres`
            );
          if (input.max)
            validator = validator.max(
              input.max,
              input.maxMessage ||
                `Debe tener como máximo ${input.max} caracteres`
            );
          if (input.email)
            validator = validator.email(
              input.emailMessage ||
                "El formato del correo electrónico es inválido"
            );
          if (input.matches)
            validator = validator.matches(
              input.matches.regex,
              input.matchesMessage || "Formato inválido"
            );
          break;
        case "number":
          validator = yup.number();
          if (input.min)
            validator = validator.min(
              input.min,
              input.minMessage || `Debe ser al menos ${input.min}`
            );
          if (input.max)
            validator = validator.max(
              input.max,
              input.maxMessage || `Debe ser como máximo ${input.max}`
            );
          if (input.integer)
            validator = validator.integer(
              input.integerMessage || "Debe ser un número entero"
            );
          break;
        case "boolean":
          validator = yup.boolean();
          break;
        case "date":
          validator = yup.date();
          if (input.min)
            validator = validator.min(
              input.min,
              input.minMessage || `La fecha debe ser después de ${input.min}`
            );
          if (input.max)
            validator = validator.max(
              input.max,
              input.maxMessage || `La fecha debe ser antes de ${input.max}`
            );
          break;
        case "array":
          validator = yup.array();
          if (input.of)
            validator = validator.of(yup.lazy(() => buildValidator(input.of))); // Validación de los elementos del array
          if (input.min)
            validator = validator.min(
              input.min,
              input.minMessage || `Debe tener al menos ${input.min} elementos`
            );
          if (input.max)
            validator = validator.max(
              input.max,
              input.maxMessage ||
                `Debe tener como máximo ${input.max} elementos`
            );
          break;
        case "object":
          validator = yup.object();
          if (input.shape) validator = validator.shape(input.shape); // Validación de objetos anidados
          break;
        default:
          validator = yup.mixed();
          break;
      }

      return validator.required(input.message || "Este campo es obligatorio");
    };

    return yup.object().shape(
      validationInput.reduce((schema, input) => {
        schema[input.key] = buildValidator(input);
        return schema;
      }, {})
    );
  }, [validationInput]);

  const handleFormSubmit = useCallback(
    (values) => onSubmit(values),
    [onSubmit]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        touched,
        errors,
      }) => (
        <View>
          {children({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          })}
        </View>
      )}
    </Formik>
  );
};

FormValidation.propTypes = {
  initialValues: PropTypes.object.isRequired,
  validationInput: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        "string",
        "number",
        "boolean",
        "date",
        "array",
        "object",
      ]).isRequired,
      min: PropTypes.number,
      max: PropTypes.number,
      email: PropTypes.bool,
      integer: PropTypes.bool,
      matches: PropTypes.shape({
        regex: PropTypes.instanceOf(RegExp).isRequired,
        message: PropTypes.string,
      }),
      of: PropTypes.object,
      shape: PropTypes.object,
      message: PropTypes.string,
      minMessage: PropTypes.string,
      maxMessage: PropTypes.string,
      emailMessage: PropTypes.string,
      integerMessage: PropTypes.string,
      matchesMessage: PropTypes.string,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
};

export default React.memo(FormValidation);
