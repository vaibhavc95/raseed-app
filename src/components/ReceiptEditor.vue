<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="receipt-editor-card">
      <!-- Error State -->
      <template v-if="receipt && receipt.error">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">Receipt Processing Error</div>
        </q-card-section>
        
        <q-card-section class="q-pa-md">
          <p class="text-body1 q-mb-md">We encountered an error while processing this receipt:</p>
          <q-banner class="bg-grey-3 q-pa-md">
            <pre class="text-caption">{{ getSimplifiedErrorMessage(receipt.error) }}</pre>
          </q-banner>
        </q-card-section>
        
        <q-separator />
        
        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="Close" color="primary" v-close-popup @click="$emit('cancel')" />
        </q-card-actions>
      </template>
      
      <!-- Normal Editor State -->
      <template v-else-if="receipt">
        <q-card-section class="receipt-editor-header">
          <div class="text-h6">Edit Receipt Details</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            @click="cancelEdit"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="receipt-editor-content q-pa-md">
          <div class="receipt-form-container">
            <!-- Receipt Header Section -->
            <div class="receipt-section merchant-section">
              <div class="receipt-section-title">Merchant Information</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="formData.merchant_name"
                    label="Merchant Name"
                    :rules="[val => !!val || 'Field is required']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="formData.merchant_gstin"
                    label="GSTIN"
                    hint="15-digit GST Identification Number"
                    mask="## AAAAA#### A #A#"
                  />
                </div>
              </div>
            </div>

            <!-- Invoice Details Section -->
            <div class="receipt-section invoice-section">
              <div class="receipt-section-title">Invoice Information</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    filled
                    v-model="formData.invoice_number"
                    label="Invoice Number"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <!-- Remove this standalone date picker -->
                  <!-- <q-date
                    v-model="formData.invoice_date"
                    mask="YYYY-MM-DD"
                    class="full-width"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date> -->
                  
                  <!-- Keep only this input with the popup date picker -->
                  <q-input
                    filled
                    v-model="formData.invoice_date"
                    label="Invoice Date"
                    mask="####-##-##"
                    hint="YYYY-MM-DD"
                    clearable
                    @click="$refs.qDateProxy.show()"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="formData.invoice_date"
                            mask="YYYY-MM-DD"
                            today-btn
                          >
                            <div class="row items-center justify-end q-gutter-sm q-pr-md q-pb-md">
                              <q-btn label="Cancel" color="grey-7" flat v-close-popup />
                              <q-btn label="OK" color="primary" flat v-close-popup />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    filled
                    v-model="formData.invoice_place_of_supply"
                    label="Place of Supply"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    filled
                    v-model="formData.platform_name"
                    label="Platform"
                    hint="e.g. Zomato, Amazon, etc."
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    filled
                    v-model="formData.payment_method"
                    :options="paymentMethods"
                    label="Payment Method"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    filled
                    v-model="formData.category_name"
                    :options="categories"
                    label="Category"
                  />
                </div>
              </div>
            </div>

            <!-- Items Section -->
            <div class="receipt-section items-section">
              <div class="receipt-section-title">
                Items
                <q-btn
                  round
                  flat
                  dense
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addItem"
                  class="q-ml-sm"
                />
              </div>
              <div class="items-table">
                <q-table
                  :rows="formData.metadata.items"
                  :columns="itemColumns"
                  row-key="id"
                  flat
                  bordered
                  hide-pagination
                  :pagination="{ rowsPerPage: 0 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="name" :props="props">
                        <q-input
                          v-model="props.row.name"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Item name"
                        />
                      </q-td>
                      <q-td key="quantity" :props="props">
                        <q-input
                          v-model.number="props.row.quantity"
                          type="number"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Qty"
                          @update:model-value="updateItemPrice(props.row)"
                        />
                      </q-td>
                      <q-td key="price_per_unit" :props="props">
                        <q-input
                          v-model.number="props.row.price_per_unit"
                          type="number"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Price/unit"
                          @update:model-value="updateItemPrice(props.row)"
                        />
                      </q-td>
                      <q-td key="price" :props="props">
                        <q-input
                          v-model.number="props.row.price"
                          type="number"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Total price"
                          @update:model-value="updateFromTotalPrice(props.row)"
                        />
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          @click="removeItem(props.rowIndex)"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </div>

            <!-- Taxes Section -->
            <div class="receipt-section taxes-section">
              <div class="receipt-section-title">
                Taxes & Charges
                <q-btn
                  round
                  flat
                  dense
                  icon="add"
                  color="primary"
                  size="sm"
                  @click="addTax"
                  class="q-ml-sm"
                />
              </div>
              <div class="taxes-table">
                <q-table
                  :rows="formData.taxes"
                  :columns="taxColumns"
                  row-key="id"
                  flat
                  bordered
                  hide-pagination
                  :pagination="{ rowsPerPage: 0 }"
                >
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="name" :props="props">
                        <q-input
                          v-model="props.row.name"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Tax name"
                        />
                      </q-td>
                      <q-td key="rate" :props="props">
                        <q-input
                          v-model.number="props.row.rate"
                          type="number"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Rate %"
                          @update:model-value="updateTaxAmount(props.row)"
                        />
                      </q-td>
                      <q-td key="amount" :props="props">
                        <q-input
                          v-model.number="props.row.amount"
                          type="number"
                          dense
                          outlined
                          class="no-border-input"
                          placeholder="Amount"
                        />
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="negative"
                          @click="removeTax(props.rowIndex)"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </div>

            <!-- Payment Details -->
            <div class="receipt-section payment-section">
              <div class="receipt-section-title">Payment Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    filled
                    v-model.number="formData.total_amount"
                    type="number"
                    label="Total Amount"
                    prefix="₹"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    filled
                    v-model="formData.currency"
                    :options="currencies"
                    label="Currency"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    filled
                    v-model="formData.customer_name"
                    label="Customer Name"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="Cancel" color="negative" v-close-popup @click="cancelEdit" />
          <q-btn flat label="Save" color="primary" @click="saveReceipt" />
        </q-card-actions>
      </template>

      <!-- Loading or empty state -->
      <template v-else>
        <q-card-section class="bg-grey-2">
          <div class="text-h6 text-center">No Receipt Data</div>
          <p class="text-center">No receipt data is available to edit.</p>
        </q-card-section>
        <q-card-actions align="right" class="bg-white">
          <q-btn flat label="Close" color="primary" v-close-popup @click="$emit('cancel')" />
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  receipt: {
    type: Object,
    required: false,
    default: () => null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:isOpen', 'save', 'cancel'])

// Deep clone receipt data to avoid mutating the original
const formData = ref({
  merchant_name: '',
  merchant_gstin: '',
  invoice_date: '',
  invoice_number: '',
  invoice_place_of_supply: '',
  platform_name: '',
  taxes: [],
  total_amount: 0,
  currency: 'INR',
  payment_method: '',
  language: 'English',
  customer_name: '',
  category_name: '',
  metadata: {
    items: [],
    raw_text_extracted: ''
  }
})

// Initialize from props
watch(() => props.receipt, (newValue) => {
  if (!newValue) return; // Skip processing if receipt is null
  
  // Check if this is an error response first
  if (newValue.error) {
    // Do not process this as a regular receipt
    return;
  }
  
  // Create a deep copy of the receipt data
  formData.value = JSON.parse(JSON.stringify({
    ...newValue.extracted,
    metadata: {
      ...newValue.extracted.metadata
    }
  }))
  
  // Ensure items array exists and has unique IDs for the table
  formData.value.metadata.items = formData.value.metadata?.items?.map(item => ({
    ...item,
    id: uuidv4()
  })) || [];
  
  // Ensure taxes array exists and has unique IDs for the table
  formData.value.taxes = formData.value.taxes?.map(tax => ({
    ...tax,
    id: uuidv4()
  })) || [];
}, { deep: true, immediate: true })

// Table columns for items
const itemColumns = [
  {
    name: 'name',
    label: 'Item Name',
    field: 'name',
    align: 'left'
  },
  {
    name: 'quantity',
    label: 'Qty',
    field: 'quantity',
    align: 'right'
  },
  {
    name: 'price_per_unit',
    label: 'Price/Unit',
    field: 'price_per_unit',
    align: 'right'
  },
  {
    name: 'price',
    label: 'Total',
    field: 'price',
    align: 'right'
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center'
  }
]

// Table columns for taxes
const taxColumns = [
  {
    name: 'name',
    label: 'Tax Name',
    field: 'name',
    align: 'left'
  },
  {
    name: 'rate',
    label: 'Rate %',
    field: 'rate',
    align: 'right'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right'
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center'
  }
]

// Options for form selects
const paymentMethods = [
  'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NETBANKING',
  'WALLET', 'CHEQUE', 'OTHER'
]

const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']

const categories = [
  'Dining & Food Delivery', 'Groceries', 'Shopping', 'Travel',
  'Utilities', 'Entertainment', 'Health & Medical', 'Education',
  'Business Expenses', 'Others'
]

// Add new item row
function addItem() {
  formData.value.metadata.items.push({
    id: uuidv4(),
    name: '',
    quantity: 1,
    price_per_unit: 0,
    price: 0
  })
}

// Remove an item
function removeItem(index) {
  formData.value.metadata.items.splice(index, 1)
  updateTotal()
}

// Add new tax row
function addTax() {
  formData.value.taxes.push({
    id: uuidv4(),
    name: '',
    rate: null,
    amount: 0
  })
}

// Remove a tax
function removeTax(index) {
  formData.value.taxes.splice(index, 1)
  updateTotal()
}

// Calculate total when item changes
function updateItemPrice(item) {
  if (item.quantity && item.price_per_unit) {
    item.price = parseFloat((item.quantity * item.price_per_unit).toFixed(2))
  }
  updateTotal()
}

// Update price per unit when total price changes
function updateFromTotalPrice(item) {
  if (item.quantity && item.price) {
    item.price_per_unit = parseFloat((item.price / item.quantity).toFixed(2))
  }
  updateTotal()
}

// Calculate tax amount based on rate and total
function updateTaxAmount(tax) {
  if (tax.rate !== null) {
    const subtotal = formData.value.metadata.items.reduce((sum, item) => sum + (item.price || 0), 0)
    tax.amount = parseFloat((subtotal * tax.rate / 100).toFixed(2))
  }
}

// Calculate total amount
function updateTotal() {
  // Sum up all item prices
  const itemsTotal = formData.value.metadata.items.reduce(
    (sum, item) => sum + (item.price || 0), 0
  )
  
  // Sum up all tax amounts
  const taxesTotal = formData.value.taxes.reduce(
    (sum, tax) => sum + (tax.amount || 0), 0
  )
  
  // Update total amount
  formData.value.total_amount = parseFloat((itemsTotal + taxesTotal).toFixed(2))
}

// Save the edited receipt
function saveReceipt() {
  // Check if receipt exists
  if (!props.receipt) {
    console.error('Cannot save: Receipt data is null');
    emit('update:isOpen', false);
    return;
  }
  
  // Create a formatted object to match the expected structure
  const resultData = {
    identifier: props.receipt.identifier,
    extracted: {
      ...formData.value,
      metadata: {
        ...formData.value.metadata,
        // Ensure raw_text_extracted is preserved from the original
        raw_text_extracted: props.receipt.extracted?.metadata?.raw_text_extracted || ''
      }
    }
  }
  
  // Remove any ID fields we added for the table
  resultData.extracted.taxes.forEach(tax => delete tax.id)
  resultData.extracted.metadata.items.forEach(item => delete item.id)
  
  emit('save', resultData)
  emit('update:isOpen', false)
}

// Cancel editing
function cancelEdit() {
  emit('cancel')
  emit('update:isOpen', false)
}

// Simplified error message function
function getSimplifiedErrorMessage(errorMsg) {
  if (!errorMsg) return 'Unknown error';
  
  // If it's a string representation of JSON, try to extract useful parts
  if (typeof errorMsg === 'string' && (errorMsg.includes('{') || errorMsg.includes('}'))) {
    try {
      // Try to find a user-friendly message in the error structure
      if (errorMsg.includes('message')) {
        const match = errorMsg.match(/'message':\s*'([^']+)'/);
        if (match && match[1]) {
          return match[1].split('.')[0]; // Just the first sentence
        }
      }
      
      // Fall back to a simplified version
      return 'Processing error. Please try again later.';
    } catch (e) {
      // If parsing fails, return a shortened version
      return errorMsg.substring(0, 100) + (errorMsg.length > 100 ? '...' : '');
    }
  }
  
  return errorMsg;
}
</script>

<style scoped>
.receipt-editor-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.receipt-editor-content {
  flex: 1;
  overflow: auto;
}

.receipt-form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.receipt-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
}

.receipt-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: #333;
  display: flex;
  align-items: center;
}

.no-border-input :deep(.q-field__control) {
  box-shadow: none !important;
  background: transparent !important;
}

.merchant-section {
  background-color: #f9fbfe;
  border-left: 4px solid #1976d2;
}

.items-section {
  background-color: #fafff9;
  border-left: 4px solid #21ba45;
}

.taxes-section {
  background-color: #fffcf7;
  border-left: 4px solid #f2c037;
}

.payment-section {
  background-color: #fdf9ff;
  border-left: 4px solid #9c27b0;
}

/* Responsive design */
@media (max-width: 767px) {
  .receipt-section {
    padding: 1rem;
  }
}
</style>