import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql';

export const graphQLClient = new GraphQLClient(endpoint);

export interface CreateAgentParams {
  name: string;
  description: string;
  strategy: 'Trading' | 'Oracle' | 'Governance' | 'MarketMaker';
  initialBalance: number;
  riskLevel?: number;
  minProfit?: number;
}

export async function createAgent(params: CreateAgentParams): Promise<{ success: boolean; agentId?: string; error?: string }> {
  try {
    const strategyConfig = params.strategy === 'Trading' 
      ? { Trading: { risk_level: params.riskLevel || 5, min_profit: params.minProfit || 100 } }
      : { [params.strategy]: {} };

    const operation = {
      CreateAgent: {
        name: params.name,
        description: params.description,
        strategy: strategyConfig,
        initial_balance: params.initialBalance,
      },
    };

    const response = await fetch('/api/execute-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, agentId: result.agentId };
  } catch (error) {
    console.error('Error creating agent:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function transferTokens(toAgent: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const operation = {
      TransferTokens: {
        to_agent: toAgent,
        amount,
      },
    };

    const response = await fetch('/api/execute-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation }),
    });

    if (!response.ok) {
      throw new Error(`Failed to transfer tokens: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function requestService(
  providerAgent: string,
  serviceType: string,
  parameters: string,
  payment: number
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const operation = {
      RequestService: {
        provider_agent: providerAgent,
        service_type: serviceType,
        parameters,
        payment,
      },
    };

    const response = await fetch('/api/execute-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request service: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, requestId: result.requestId };
  } catch (error) {
    console.error('Error requesting service:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
