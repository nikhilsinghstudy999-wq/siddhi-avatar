import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'edge';

let _sb: SupabaseClient | null | undefined;

function getSupabase(): SupabaseClient | null {
  if (_sb !== undefined) return _sb;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    _sb = null;
    return null;
  }

  _sb = createClient(url, key);
  return _sb;
}

export async function POST(req: NextRequest) {
  try {
    const { name, businessName, phone, industry, serviceInterest, transcript } =
      await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit number required', success: false },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    if (!supabase) {
      console.warn('[Lead] Supabase not configured — returning local ack');
      return NextResponse.json({
        success: true,
        leadId: 'local-' + Date.now(),
        warning: 'Database not configured — lead not persisted',
      });
    }

    const { data, error } = await supabase
      .from('avatar_leads')
      .insert([
        {
          lead_name: name || 'Indian Founder',
          business_name: businessName || 'Not Specified',
          business_type: industry || 'General Inquiry',
          phone: cleanPhone,
          service_interest: serviceInterest || null,
          conversation_transcript: transcript || [],
          ip_location:
            req.headers.get('x-vercel-ip-city') || 'Madhya Pradesh',
          status: 'new',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, leadId: data[0].id });
  } catch (err: any) {
    console.error('[Lead API Error]', err.message);
    return NextResponse.json(
      { error: err.message, success: false },
      { status: 500 },
    );
  }
}
