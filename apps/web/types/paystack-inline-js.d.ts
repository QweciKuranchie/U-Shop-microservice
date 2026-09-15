declare module "@paystack/inline-js" {
  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    accessCode?: string;
    channels?: string[];
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: { reference: string; [key: string]: unknown }) => void;
    onCancel?: () => void;
    onClose?: () => void;
    [key: string]: unknown;
  }

  export default class PaystackPop {
    constructor();
    newTransaction(options: PaystackTransactionOptions): void;
    checkout(options: PaystackTransactionOptions): void;
    [key: string]: unknown;
  }
}
