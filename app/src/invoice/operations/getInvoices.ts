import { HttpError } from 'wasp/server';

export const getUserInvoices = async (args: any, context: any) => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const invoices = await context.entities.Invoice.findMany({
    where: { userId: context.user.id },
    include: {
      lineItems: {
        orderBy: { lineNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return invoices;
};
