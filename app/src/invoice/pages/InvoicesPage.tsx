import { useState } from 'react';
import { InvoiceUpload } from '../components/InvoiceUpload';
import { InvoiceDetail } from '../components/InvoiceDetail';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { processPendingInvoice, deleteInvoice, getUserInvoices, useQuery } from 'wasp/client/operations';
import { FileText, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

export default function InvoicesPage() {
  const [processingId, setProcessingId] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<string>('');

  const { data: invoices, isLoading, refetch } = useQuery(getUserInvoices);

  const handleUploadSuccess = () => {
    setMessage('Upload successful!');
    refetch();
  };

  const handleProcess = async (invoiceId: string) => {
    setProcessingId(invoiceId);
    setMessage('Processing...');

    try {
      await processPendingInvoice({ invoiceId });
      setMessage('Processing complete!');
      refetch();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setProcessingId('');
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice({ invoiceId });
      setMessage('Invoice deleted');
      setSelectedInvoice(null);
      refetch();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PROCESSING_OCR':
      case 'PROCESSING_LLM':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredInvoices = invoices?.filter((inv: any) =>
    inv.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedInvoice) {
    return (
      <div className="py-10 lg:mt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <InvoiceDetail
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-primary">Invoice</span> Processing
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg leading-8">
          Upload your invoices for AI-powered OCR and data extraction.
        </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {message && (
          <p className="text-center mt-4 text-sm font-medium">{message}</p>
        )}

        <Card className="mx-auto mt-8 max-w-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Invoices</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : filteredInvoices && filteredInvoices.length > 0 ? (
              <div className="space-y-3">
                {filteredInvoices.map((invoice: any) => (
                  <Card
                    key={invoice.id}
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(invoice.status)}
                        <div className="flex-1">
                          <p className="font-medium">{invoice.fileName}</p>
                          {invoice.vendorName && (
                            <p className="text-sm text-muted-foreground">
                              {invoice.vendorName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {invoice.status} • {invoice.totalAmount ? `$${invoice.totalAmount}` : 'Processing...'}
                          </p>
                        </div>
                      </div>
                      {invoice.status === 'UPLOADED' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProcess(invoice.id);
                          }}
                          disabled={processingId === invoice.id}
                        >
                          {processingId === invoice.id ? 'Processing...' : 'Process'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm ? 'No invoices found' : 'No invoices uploaded yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
