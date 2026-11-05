export interface LeadData {
  name: string;
  businessName: string;
  phone: string;
  industry: string;
  serviceInterest?: string;
  transcript?: Array<{ role: string; text: string; timestamp: number }>;
}

export interface LeadResponse {
  success: boolean;
  leadId?: string;
  error?: string;
}

export async function submitLead(data: LeadData): Promise<LeadResponse> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}
