import { InvoiceUpload } from '../components/InvoiceUpload';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function InvoicesPage() {
  const handleUploadSuccess = () => {
    console.log('Invoice uploaded successfully!');
    // We'll add invoice list refresh here later
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
          We'll automatically extract vendor information, line items, and totals.
        </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <Card className="mx-auto mt-8 max-w-3xl">
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Invoice list will appear here after upload
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
