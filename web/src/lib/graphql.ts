import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql';

const client = new GraphQLClient(endpoint);

export async function fetchMarketplaceStats() {
  const query = gql`
    query {
      marketplaceStats {
        totalAgents
        activeAgents
        totalTransactions
        totalVolume
        averageReputation
      }
    }
  `;

  try {
    const data: any = await client.request(query);
    return data.marketplaceStats;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchAgents() {
  const query = gql`
    query {
      agents {
        id
        name
        description
        strategyType
        balance
        reputation
        servicesCompleted
        servicesFailed
        successRate
        isActive
        createdAt
        lastActive
      }
    }
  `;

  try {
    const data: any = await client.request(query);
    return data.agents;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchActiveAgents() {
  const query = gql`
    query {
      activeAgents {
        id
        name
        description
        strategyType
        balance
        reputation
        servicesCompleted
        servicesFailed
        successRate
        isActive
        createdAt
        lastActive
      }
    }
  `;

  try {
    const data: any = await client.request(query);
    return data.activeAgents;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchAgentsByStrategy(strategyType: string) {
  const query = gql`
    query GetAgentsByStrategy($strategyType: String!) {
      agentsByStrategy(strategyType: $strategyType) {
        id
        name
        description
        strategyType
        balance
        reputation
        servicesCompleted
        servicesFailed
        successRate
        isActive
      }
    }
  `;

  try {
    const data: any = await client.request(query, { strategyType });
    return data.agentsByStrategy;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchTransactions(limit: number = 10) {
  const query = gql`
    query GetTransactions($limit: Int) {
      transactions(limit: $limit) {
        id
        fromAgent
        toAgent
        amount
        transactionType
        timestamp
      }
    }
  `;

  try {
    const data: any = await client.request(query, { limit });
    return data.transactions;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchPendingRequests() {
  const query = gql`
    query {
      pendingRequests {
        id
        requesterAgent
        providerAgent
        serviceType
        parameters
        payment
        status
        createdAt
        completedAt
      }
    }
  `;

  try {
    const data: any = await client.request(query);
    return data.pendingRequests;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}

export async function fetchMarketListings() {
  const query = gql`
    query {
      marketListings {
        agentId
        serviceType
        price
        capacity
        averageCompletionTime
        successRate
      }
    }
  `;

  try {
    const data: any = await client.request(query);
    return data.marketListings;
  } catch (error) {
    console.error('GraphQL error:', error);
    throw error;
  }
}
