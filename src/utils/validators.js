/**
 * Validate a product form before submission.
 * Returns an object of field → error message (empty if valid).
 */
export function validateProduct(data) {
  const errors = {}

  if (!data.name?.trim()) {
    errors.name = 'Product name is required'
  }

  if (!data.category?.trim()) {
    errors.category = 'Category is required'
  }

  if (data.cost_price == null || data.cost_price < 0) {
    errors.cost_price = 'Cost price must be 0 or greater'
  }

  if (data.sale_price == null || data.sale_price <= 0) {
    errors.sale_price = 'Sale price must be greater than 0'
  }

  if (data.quantity == null || data.quantity < 0 || !Number.isInteger(data.quantity)) {
    errors.quantity = 'Quantity must be a whole number (0 or greater)'
  }

  return errors
}

/**
 * Validate a PIN (4-digit numeric string).
 */
export function validatePin(pin) {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return 'PIN must be exactly 4 digits'
  }
  return null
}
