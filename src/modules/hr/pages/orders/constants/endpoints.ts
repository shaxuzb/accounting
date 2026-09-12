export const hrOrderEndpoints = {
  list: "hr/orders",
  detail: (id: string | number) => `hr/orders/${id}`,
  print: (id: string | number) => `hr/orders/${id}/print`,
  create: "hr/orders",
  update: (id: string | number) => `hr/orders/${id}`,
  confirm: (id: string | number) => `hr/orders/${id}/confirm`,
  cancel: (id: string | number) => `hr/orders/${id}/cancel`,
  delete: (id: string | number) => `hr/orders/${id}`,
} as const;
