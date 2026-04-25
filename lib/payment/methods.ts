import type { PaymentMethod } from "@/lib/actions/schemas"

export interface PaymentMethodMeta {
  value: PaymentMethod
  label: string
  description: string
  icon: string // Material Symbols icon name
}

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Transfer to a virtual account from any Indonesian bank.",
    icon: "account_balance",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, JCB. 3DS verification simulated.",
    icon: "credit_card",
  },
  {
    value: "GOPAY",
    label: "GoPay",
    description: "Pay instantly with your GoPay balance via QR.",
    icon: "wallet",
  },
  {
    value: "OVO",
    label: "OVO",
    description: "Pay with OVO balance via push notification.",
    icon: "smartphone",
  },
  {
    value: "QRIS",
    label: "QRIS",
    description: "Scan with any e-wallet or banking app that supports QRIS.",
    icon: "qr_code_2",
  },
]

export function getPaymentMethodMeta(value: string | null): PaymentMethodMeta | null {
  if (!value) return null
  return PAYMENT_METHODS.find((m) => m.value === value) ?? null
}
