import { 
    authors,
    customers_services,
    employees,
    priorities,
    positions,
    services,
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
    priority: priorities,
    position: positions,
    service: services,
    user: users,
    task: tasks,
    types_tasks: types_tasks,
    units: units,
    work_orders: work_orders,
    sync_queue: sync_queue
};

export default schemas;
