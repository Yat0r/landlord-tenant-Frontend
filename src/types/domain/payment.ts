export interface Payment {
  id: string;
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  createdAt: string;
}
