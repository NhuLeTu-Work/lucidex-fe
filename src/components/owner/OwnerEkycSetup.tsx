import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScanFace, IdCard, QrCode, Smartphone, Monitor } from 'lucide-react';

interface OwnerEkycSetupProps {
  t: (k: string) => string;
//   showToast: 
}

export function OwnerEkycSetup({ t  }: OwnerEkycSetupProps) {
  const handleStartMobileEkyc = () => {
    // Giả lập gọi API chuyển hướng sang hệ thống eKYC
    // showToast('success', t('ekycMobileStarted'));
  };

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

            {/* TAB MOBILE: Nút gọi API */}
            <TabsContent value="mobile" className="animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-muted/20 min-h-[300px]">
                <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                  <Smartphone size={32} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('mobileInstructionTitle')}</h3>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  {t('mobileInstructionDesc')}
                </p>
                
                <Button 
                  onClick={handleStartMobileEkyc}
                  style={{ backgroundColor: 'rgba(255,153,190,1)', color: '#000' }}
                  className="w-full sm:w-auto font-semibold hover:opacity-80 transition-opacity shadow-sm"
                  size="lg"
                >
                  {t('startEkycBtn')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}