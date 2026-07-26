import { useState } from 'react';
import { mockCredentials, currentOwner } from '../../data/mockData';

import { CredSnippet } from '../certificates/CredSnippet';
import { CredentialViewer } from '../certificates/CredentialViewer';
import { CredentialCoverReveal } from '../certificates/CredentialCoverReveal';

// Import component và type bạn đã cung cấp trước đó (Giả định đường dẫn)
import GraduationCertificate from '../certificates/ctuGraduation/GraduationCertificate';
import { sampleCertificateData } from '../certificates/ctuGraduation/certificateData'; 

export function OwnerCredentials({ t }: { t: (k: string) => string }) {
  const [openedCredId, setOpenedCredId] = useState<string | null>(null);

  // Lọc bằng cấp của chủ sở hữu hiện tại
  const myCreds = mockCredentials.filter(c => c.studentId === currentOwner.studentId);

  const selectedCred = myCreds.find(c => c.id === openedCredId);

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('myCredentials')}</h1>
      
      {myCreds.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>
          {t('noCredentials')}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {myCreds.map(cred => (
            <CredSnippet 
              key={cred.id} 
              name={cred.degreeType} 
              // Truyền đường dẫn logo nếu có trong dữ liệu (fallback icon nếu null)
              logoPath="../../../public/ctuGraduation/ctuLogo.png" 
              onClick={() => setOpenedCredId(cred.id)}
            />
          ))}
        </div>
      )}

      {/* Render Viewer Orchestrator nếu có bằng đang mở */}
      {openedCredId && selectedCred && (
        <CredentialViewer 
          onClose={() => setOpenedCredId(null)}
          // Truyền key vào cover để ép React mount lại mỗi lần mở chứng chỉ mới
          cover={
            <CredentialCoverReveal 
              key={selectedCred.id} 
              logoUrl="../../../public/snippet/logoParty.png" 
              title='BẰNG TỐT NGHIỆP ĐẠI HỌC'
            />
          }
          content={
            <div className="w-full h-full transform scale-90 md:scale-100">
               {/* GraduationCertificate của bạn cần được wrapper một chút nếu bị tràn */}
               <GraduationCertificate data={sampleCertificateData} />
            </div>
          }
        />
      )}
    </div>
  );
}