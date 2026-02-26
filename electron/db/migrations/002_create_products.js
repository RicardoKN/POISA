exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable().unique()
    table.string('category')
    table.string('barcode')
    table.float('cost_price').notNullable()
    table.float('sale_price').notNullable()
    table.integer('quantity').defaultTo(0)
    table.integer('min_threshold').defaultTo(5)
    table.integer('is_active').defaultTo(1)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products')
}
