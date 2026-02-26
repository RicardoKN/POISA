exports.seed = async function (knex) {
  await knex('staff').del()

  await knex('staff').insert([
    { name: 'Admin Manager', role: 'manager', pin: '1234', is_active: 1 },
    { name: 'Jane Cashier', role: 'cashier', pin: '5678', is_active: 1 },
    { name: 'Thabo Moeti', role: 'cashier', pin: '4321', is_active: 1 },
  ])
}
