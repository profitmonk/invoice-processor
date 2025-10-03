import { useState } from 'react';
import { InvoiceUpload } from '../components/InvoiceUpload';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { processPendingInvoice, getUserInvoices, useQuery } from 'wasp/client/operations';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function InvoicesPage() {
  const [processingId, setProcessingId] = useState<string>('');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSING_LLM':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PROCESSING_OCR':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

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
            <CardTitle>Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : invoices && invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice: any) => (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(invoice.status)}
                        <div className="flex-1">
                          <p className="font-medium">{invoice.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {invoice.status}
                          </p>
                          {invoice.ocrText && (
                            <p className="text-xs text-muted-foreground mt-1">
                              OCR extracted: {invoice.ocrText.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                      {invoice.status === 'UPLOADED' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcess(invoice.id)}
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
                No invoices uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
