import {
    authors,
    customers_services,
    employees,
    equipment_location_images,
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
    work_order_photos,
} from './sql/tables';

const schemas = {
    author: authors,
    customers_services: customers_services,
    employee: employees,
    equipment_location_images: equipment_location_images,
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
    work_order_photos: work_order_photos,
    sync_queue: sync_queue
};

export default schemas;
