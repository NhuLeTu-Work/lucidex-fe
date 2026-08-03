import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScanFace, IdCard, QrCode, Smartphone, Monitor, CheckCircle2, ArrowRight } from 'lucide-react';
import { useOwnerEkycStatus } from '@/hooks/owner/useOwnerEkycStatus';
import type { OwnerTab } from '@/types/owner';

interface OwnerEkycSetupProps {
  t: (k: string) => string;
  onTabChange?: (tab: OwnerTab) => void;
}

export function OwnerEkycSetup({ t, onTabChange }: OwnerEkycSetupProps) {
  const { isVerified, isLoading } = useOwnerEkycStatus();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto text-center">
        <Card className="shadow-sm border-border p-6 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-semibold">{t('ekycVerifiedAlready')}</h2>
          </div>
          {onTabChange && (
            <Button
              onClick={() => onTabChange('credentials')}
              className="mt-4 inline-flex items-center gap-2"
            >
              {t('goToCredentialsBtn')}
              <ArrowRight size={16} />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Card className="shadow-sm border-border">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center gap-4 mb-4 text-primary opacity-80">
            <IdCard size={40} strokeWidth={1.5} />
            <ScanFace size={40} strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-display mb-2">
            {t('ekycTitle')}
          </CardTitle>
          <CardDescription className="text-base max-w-2xl mx-auto">
            {t('ekycDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="web" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="web" className="flex items-center gap-2">
                <Monitor size={16} />
                {t('tabWeb')}
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone size={16} />
                {t('tabMobile')}
              </TabsTrigger>
            </TabsList>

            {/* TAB WEB: Hiển thị QR Code */}
            <TabsContent value="web" className="animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center p-6 border rounded-xl bg-muted/20">
                <h3 className="font-semibold text-lg mb-2">{t('qrInstructionTitle')}</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  {t('qrInstructionDesc')}
                </p>

                {/* Mockup QR Code */}
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/50">
                  <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center bg-muted/10">
                    <QrCode size={64} className="text-muted-foreground opacity-40 mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">MOCKUP QR</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}