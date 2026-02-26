exports.up = function (knex) {
  return knex.schema.createTable('stock_entries', (table) => {
    table.increments('id').primary()
    table.integer('product_id').notNullable().references('id').inTable('products')
    table.string('type').notNullable().checkIn(['initial', 'restock', 'sale', 'adjustment'])
    table.integer('quantity').notNullable()
    table.string('supplier')
    table.string('notes')
    table.integer('staff_id').references('id').inTable('staff')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('stock_entries')
}
