import { useState, useEffect } from 'react';
import { getAdminResetRequests } from '@/api/endpoints/super/getAdminResetRequestApi';

export interface FlattenedRequest {
  id: string;           // ID duy nhất cho UI render (ví dụ: adminId-password)
  accountId: string;    // ID thực của admin
  username: string;
  type: 'password' | 'totp';
  timestamp: string;
}

export function useAdminResetRequests() {
  const [requests, setRequests] = useState<FlattenedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorKey(null);
    try {
      const data = await getAdminResetRequests.getAdminRequests();
      
      // Xử lý dữ liệu: Tách các request ra thành từng dòng riêng biệt
      const flatRequests: FlattenedRequest[] = data.flatMap(acc => {
        const items: FlattenedRequest[] = [];
        
        if (acc.password_reset_requested) {
          items.push({
            id: `${acc.id}-pwd`,
            accountId: acc.id,
            username: acc.username,
            type: 'password',
            timestamp: acc.password_reset_requested_at || '',
          });
        }
        
        if (acc.totp_reset_requested) {
          items.push({
            id: `${acc.id}-totp`,
            accountId: acc.id,
            username: acc.username,
            type: 'totp',
            timestamp: acc.totp_reset_requested_at || '',
          });
        }
        
        return items;
      });

      flatRequests.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      setRequests(flatRequests);
    } catch (err: any) {
      setErrorKey(err.message === 'errorServer' ? 'errorServer' : 'errorNetwork');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    isLoading,
    errorKey,
    refetch: fetchRequests
  };
}