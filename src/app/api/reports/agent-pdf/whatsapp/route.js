import { NextResponse } from 'next/server';
import { sendWhatsAppAgentReport } from '@/lib/msg91';
import { requireAdminApi } from '@/lib/apiAuth';

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { agentName, startDate, endDate, totalValue } = body;

    if (!agentName) {
      return NextResponse.json({ error: 'agentName is required' }, { status: 400 });
    }

    const adminPhone = process.env.ADMIN_ALERT_PHONE || '918870904994';

    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.herocrackers.com';
    if (baseUrl === 'https://herocrackers.com') {
      baseUrl = 'https://www.herocrackers.com';
    }

    const params = new URLSearchParams({ agentName });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const pdfUrl = `${baseUrl}/api/reports/agent-pdf/download?${params.toString()}`;

    const result = await sendWhatsAppAgentReport(
      adminPhone,
      agentName,
      totalValue,
      pdfUrl
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to trigger MSG91 WhatsApp notification.', details: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'WhatsApp report triggered successfully.' });

  } catch (error) {
    console.error('Error in WhatsApp trigger API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
