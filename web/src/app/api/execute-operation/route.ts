import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { operation } = await request.json();

    const lineraEndpoint = process.env.LINERA_RPC_ENDPOINT || 'http://localhost:8080';
    const applicationId = process.env.LINERA_APPLICATION_ID;
    const chainId = process.env.LINERA_CHAIN_ID;

    if (!applicationId) {
      console.error('LINERA_APPLICATION_ID not configured');
      return NextResponse.json(
        { error: 'LINERA_APPLICATION_ID not configured' },
        { status: 500 }
      );
    }

    if (!chainId) {
      console.error('LINERA_CHAIN_ID not configured');
      return NextResponse.json(
        { error: 'LINERA_CHAIN_ID not configured' },
        { status: 500 }
      );
    }

    console.log(`Executing operation on chain ${chainId}, app ${applicationId}:`, operation);

    const response = await fetch(`${lineraEndpoint}/chains/${chainId}/applications/${applicationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Linera operation failed: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    if ('CreateAgent' in operation) {
      return NextResponse.json({ 
        success: true, 
        agentId: result.agent_id || `agent_${Date.now()}`,
      });
    } else if ('RequestService' in operation) {
      return NextResponse.json({
        success: true,
        requestId: result.request_id || `req_${Date.now()}`,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error executing Linera operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
