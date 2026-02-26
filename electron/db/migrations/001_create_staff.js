exports.up = function (knex) {
  return knex.schema.createTable('staff', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('role').notNullable().checkIn(['manager', 'cashier'])
    table.string('pin').notNullable()
    table.integer('is_active').defaultTo(1)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('staff')
}
