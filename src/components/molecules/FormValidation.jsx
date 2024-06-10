import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { View } from 'react-native';

// Componente de validación de formularios
const FormValidation = ({ children, initialValues, validationInput, onSubmit }) => {
    // Crear el esquema de validación basado en validationInput
    const validationSchema = yup.object().shape(
        validationInput.reduce((schema, input) => {
            let validator;

            switch (input.type) {
                case 'string':
                    validator = yup.string();
                    break;
                case 'number':
                    validator = yup.number();
                    break;
                case 'boolean':
                    validator = yup.boolean();
                    break;
                case 'date':
                    validator = yup.date();
                    break;
                case 'array':
                    validator = yup.array();
                    break;
                case 'object':
                    validator = yup.object();
                    break;
                default:
                    validator = yup.mixed(); // Tipo predeterminado si no se especifica
            }

            schema[input.key] = validator.required(input.message);
            return schema;
        }, {})
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
                <View>
                    {children({ handleChange, handleBlur, handleSubmit, values, touched, errors })}
                </View>
            )}
        </Formik>
    );
}

export default FormValidation;
