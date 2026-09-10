import {
    authors,
    customers_services,
    employees,
    materials_order,
    priorities,
    positions,
    services,
    supplies,
    sync_queue,
    tasks,
    types_tasks,
    units,
    users,
    work_orders,
} from './sql/tables';

const schemas = {
    author: authors,
    customers_services: customers_services,
    employee: employees,
    materials_order: materials_order,
    priority: priorities,
    position: positions,
    service: services,
    supplies: supplies,
    user: users,
    task: tasks,
    types_tasks: types_tasks,
    units: units,
    work_orders: work_orders,
    sync_queue: sync_queue
};

export default schemas;
