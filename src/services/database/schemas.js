const schemas = {
    user: {
        tableName: 'user',
        columns: {
            user_id: 'INTEGER PRIMARY KEY',
            employee_id: 'INTEGER',
            user_type_id: 'INTEGER',
            username: 'TEXT',
            password: 'TEXT',
            user_status: 'TEXT',
            observation: 'TEXT',
            photo_name: 'TEXT',
            user_registration: 'TEXT'
        }
    },

    employee: {
        tableName: 'employee',
        columns: {
            employee_id: 'INTEGER PRIMARY KEY',
            user_id: 'INTEGER',
            id_municipio: 'INTEGER',
            nombre_empleado: 'TEXT',
            apellido_empleado: 'TEXT',
            dui_empleado: 'TEXT',
            nit_empleado: 'TEXT',
            tipo_afp: 'TEXT',
            isss_empleado: 'TEXT',
            nup_empleado: 'TEXT',
            direccion_empleado: 'TEXT',
            sexo_empleado: 'TEXT',
            estado_civil_empleado: 'TEXT',
            nacionalidad_empleado: 'TEXT',
            fecha_nacimiento: 'TEXT',
            correo_empleado: 'TEXT',
            telefono_empleado: 'TEXT',
            celular_empleado: 'TEXT',
            numero_cuenta_empleado: 'TEXT',
            estado_empleado: 'TEXT',
            registro_empleado: 'TEXT'
        }
    },

    position: {
        tableName: 'position',
        columns: {
            position_id: 'INTEGER PRIMARY KEY',
            employee_id: 'INTEGER',
            id_tipo_empleado: 'INTEGER',
            id_cargo: 'INTEGER',
            id_departamento_empresa: 'INTEGER',
            id_forma_pago: 'INTEGER',
            fecha_inicio_puesto_empleado: 'TEXT',
            fecha_fin_puesto_empleado: 'TEXT',
            salario_ordinario: 'TEXT',
            tipo_contrato: 'TEXT',
            estado_puesto_empleado: 'TEXT',
            registro_puesto_empleado: 'TEXT'
        }
    },

    customer_service: {
        tableName: 'customer_service',
        columns: {
            id: 'INTEGER PRIMARY KEY',
            id_servicio_cliente: 'INTEGER', 
            id_cliente: 'INTEGER',
            id_servicio: 'INTEGER',
            id_tipo_facturacion: 'TEXT NULL', // Puedes ajustar el tipo de datos según corresponda
            id_forma_pago: 'TEXT NULL', // Puedes ajustar el tipo de datos según corresponda
            descripcion_servicio_cliente: 'TEXT',
            estado_servicio_cliente: 'TEXT',
            registro_servicio_cliente: 'TEXT' // Aquí podrías usar TIMESTAMP si prefieres un formato de fecha específico
        }
    },

    priority: {
        tableName: 'priority',
        columns: {
            id_prioridad_tarea: 'INTEGER PRIMARY KEY',
            prioridad_tarea: 'TEXT',
            dia_solucion: 'INTEGER', // Ajusta según corresponda, quizás TIMESTAMP
            efectividad: 'TEXT',
            color_prioridad_tarea: 'TEXT',
            estado_prioridad: 'TEXT',
            registro_prioridad: 'TEXT' // Ajusta según corresponda, quizás TIMESTAMP
        }
    },

    author: {
        tableName: 'author',
        columns: {
            id_usuario: 'INTEGER PRIMARY KEY',
            id_tipo_usuario: 'INTEGER',
            usuario: 'TEXT',
            clave: 'TEXT',
            estado_usuario: 'TEXT',
            observacion: 'TEXT',
            foto_nombre: 'TEXT',
            registro_usuario: 'TEXT' // Ajusta según corresponda, quizás TIMESTAMP
        }
    },

    service: {
        tableName: 'service',
        columns: {
            id_servicio: 'INTEGER PRIMARY KEY', // Identificador único para el servicio
            id_empresa: 'INTEGER', // Relación con la empresa
            codigo_servicio: 'TEXT', // Código del servicio
            servicio: 'TEXT', // Nombre del servicio
            descripcion_servicio: 'TEXT NULL', // Descripción opcional del servicio
            estado_servicio: 'TEXT', // Estado del servicio (activo, inactivo, etc.)
            registro_servicio: 'TEXT' // Fecha de registro del servicio
        }
    },

    task: {
        tableName: 'task',
        columns: {
            id: 'INTEGER PRIMARY KEY',
            id_tarea: 'INTEGER NULL',
            id_tipo_tarea: 'INTEGER NULL',
            id_servicio_cliente: 'INTEGER NULL',
            id_prioridad_tarea: 'INTEGER NULL',
            id_usuario: 'INTEGER NULL',
            id_autorizacion_tarea: 'INTEGER NULL',
            id_usuario_revision: 'INTEGER NULL',
            id_municipio: 'INTEGER NULL',
            codigo_tarea: 'TEXT NULL',
            puesto_trabajo: 'INTEGER NULL',
            descripcion_tarea: 'TEXT NULL',
            comentario_tarea: 'TEXT NULL',
            direccion_tarea: 'TEXT NULL',
            progreso_tarea: 'TEXT NULL',
            orden_requerida: 'INTEGER NULL',
            orden_completada: 'INTEGER NULL',
            correo_solicitud: 'INTEGER NULL',
            correo_inicio: 'INTEGER NULL',
            correo_completo: 'INTEGER NULL',
            fecha_inicio_tarea: 'TEXT NULL',
            fecha_fin_tarea: 'TEXT NULL',
            fecha_programacion: 'TEXT NULL',
            solicitud_programacion: 'TEXT NULL',
            comentario_programacion: 'TEXT NULL',
            id_autorizacion_programacion: 'INTEGER NULL',
            fecha_revision: 'TEXT NULL',
            comentario_rechazo: 'TEXT NULL',
            numero_solicitud: 'INTEGER NULL',
            estado_tarea: 'TEXT NULL',
            registro_fecha: 'TEXT NULL',
            id_cuenta: 'INTEGER NULL',
            id_servicio_cliente: 'INTEGER NULL',
            FOREIGN_KEYS: {
                customer_service_id: {
                    tableName: 'customer_service',
                    foreignKey: 'id_servicio_cliente',
                },
                priority_id: {
                    tableName: 'priority',
                    foreignKey: 'id_prioridad_tarea',
                },
                user_id: {
                    tableName: 'user',
                    foreignKey: 'id_usuario',
                },
                authorization_id: {
                    tableName: 'authorization',
                    foreignKey: 'id_autorizacion_tarea',
                },
                review_user_id: {
                    tableName: 'user',
                    foreignKey: 'id_usuario_revision',
                },
                municipality_id: {
                    tableName: 'municipality',
                    foreignKey: 'id_municipio',
                },
            }
        }
    },
};

export default schemas;
