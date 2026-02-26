exports.up = function (knex) {
  return knex.schema.createTable('sales', (table) => {
    table.increments('id').primary()
    table.float('subtotal').notNullable()
    table.float('discount_amount').defaultTo(0)
    table.float('total').notNullable()
    table.string('payment_method').notNullable().checkIn(['cash', 'card', 'mixed'])
    table.float('cash_tendered')
    table.float('change_given')
    table.integer('staff_id').references('id').inTable('staff')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sales')
}
