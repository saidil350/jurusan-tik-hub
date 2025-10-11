import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const ExportDatabase = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'sql' | 'json') => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-database', {
        body: { format }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], {
        type: format === 'json' ? 'application/json' : 'text/plain'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Database berhasil di-export sebagai ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Gagal export database: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Export Database</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Export Data ke Supabase Pribadi
              </CardTitle>
              <CardDescription>
                Export semua data dari Lovable Cloud untuk diimport ke Supabase project Anda sendiri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleExport('sql')}
                  disabled={isExporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download SQL File (.sql)
                </Button>
                <p className="text-sm text-muted-foreground ml-6">
                  Format SQL INSERT statements - siap dijalankan di SQL Editor Supabase
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON File (.json)
                </Button>
                <p className="text-sm text-muted-foreground ml-6">
                  Format JSON - untuk backup atau processing manual
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Panduan Import ke Supabase Pribadi</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Buat project baru di <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">supabase.com</a></li>
                <li>Copy semua file dari folder <code className="bg-muted px-1 py-0.5 rounded">supabase/migrations/</code></li>
                <li>Jalankan migrations di SQL Editor Supabase Anda (berurutan sesuai timestamp)</li>
                <li>Download dan jalankan SQL export file ini di SQL Editor</li>
                <li>Verifikasi data sudah ter-import dengan benar</li>
                <li>Update connection string di project Anda</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportDatabase;
