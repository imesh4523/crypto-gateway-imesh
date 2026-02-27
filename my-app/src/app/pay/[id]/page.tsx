// This file re-exports the checkout page so that /pay/[id] serves the same UI
// as /checkout/[id] — cleaner, more professional URL structure
export { default } from '@/app/checkout/[id]/page';
