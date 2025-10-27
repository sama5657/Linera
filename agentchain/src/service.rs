use async_graphql::{Context, EmptySubscription, Object, Schema, SimpleObject};
use linera_sdk::{
    base::ChainId,
    Service, ServiceRuntime,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::state::{Agent, AgentChainState, AgentStrategy, MarketListing, ServiceRequest, Transaction};

#[derive(SimpleObject)]
struct AgentInfo {
    id: String,
    owner: String,
    name: String,
    description: String,
    strategy_type: String,
    balance: String,
    reputation: u64,
    services_completed: u64,
    services_failed: u64,
    success_rate: f64,
    is_active: bool,
    created_at: u64,
    last_active: u64,
}

impl From<Agent> for AgentInfo {
    fn from(agent: Agent) -> Self {
        let total_services = agent.services_completed + agent.services_failed;
        let success_rate = if total_services > 0 {
            (agent.services_completed as f64 / total_services as f64) * 100.0
        } else {
            0.0
        };

        let strategy_type = match agent.strategy {
            AgentStrategy::Trading { .. } => "Trading".to_string(),
            AgentStrategy::Oracle { .. } => "Oracle".to_string(),
            AgentStrategy::Governance { .. } => "Governance".to_string(),
            AgentStrategy::MarketMaker { .. } => "MarketMaker".to_string(),
        };

        AgentInfo {
            id: agent.id,
            owner: agent.owner,
            name: agent.name,
            description: agent.description,
            strategy_type,
            balance: agent.balance.to_string(),
            reputation: agent.reputation,
            services_completed: agent.services_completed,
            services_failed: agent.services_failed,
            success_rate,
            is_active: agent.is_active,
            created_at: agent.created_at,
            last_active: agent.last_active,
        }
    }
}

#[derive(SimpleObject)]
struct ServiceRequestInfo {
    id: String,
    requester_agent: String,
    provider_agent: String,
    service_type: String,
    parameters: String,
    payment: String,
    status: String,
    created_at: u64,
    completed_at: Option<u64>,
}

#[derive(SimpleObject)]
struct TransactionInfo {
    id: String,
    from_agent: String,
    to_agent: String,
    amount: String,
    transaction_type: String,
    timestamp: u64,
}

#[derive(SimpleObject)]
struct MarketplaceStats {
    total_agents: u64,
    active_agents: u64,
    total_transactions: u64,
    total_volume: String,
    average_reputation: f64,
}

#[derive(SimpleObject)]
struct MarketListingInfo {
    agent_id: String,
    service_type: String,
    price: String,
    capacity: u32,
    average_completion_time: u64,
    success_rate: f64,
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn agent(&self, ctx: &Context<'_>, agent_id: String) -> Option<AgentInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok()?;
        let agent = state.agents.get(&agent_id).await.ok()??;
        Some(agent.into())
    }

    async fn agents(&self, ctx: &Context<'_>) -> Vec<AgentInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut agents = Vec::new();
        
        state.agents.for_each_index_value(|_key, agent| {
            agents.push(agent.into());
            Ok(())
        }).await.ok();

        agents
    }

    async fn active_agents(&self, ctx: &Context<'_>) -> Vec<AgentInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut agents = Vec::new();
        
        state.agents.for_each_index_value(|_key, agent| {
            if agent.is_active {
                agents.push(agent.into());
            }
            Ok(())
        }).await.ok();

        agents
    }

    async fn agents_by_strategy(&self, ctx: &Context<'_>, strategy_type: String) -> Vec<AgentInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut agents = Vec::new();
        
        state.agents.for_each_index_value(|_key, agent| {
            let agent_strategy_type = match &agent.strategy {
                AgentStrategy::Trading { .. } => "Trading",
                AgentStrategy::Oracle { .. } => "Oracle",
                AgentStrategy::Governance { .. } => "Governance",
                AgentStrategy::MarketMaker { .. } => "MarketMaker",
            };

            if agent_strategy_type == strategy_type {
                agents.push(agent.into());
            }
            Ok(())
        }).await.ok();

        agents
    }

    async fn service_request(&self, ctx: &Context<'_>, request_id: String) -> Option<ServiceRequestInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok()?;
        let request = state.service_requests.get(&request_id).await.ok()??;
        
        Some(ServiceRequestInfo {
            id: request.id,
            requester_agent: request.requester_agent,
            provider_agent: request.provider_agent,
            service_type: request.service_type,
            parameters: request.parameters,
            payment: request.payment.to_string(),
            status: format!("{:?}", request.status),
            created_at: request.created_at,
            completed_at: request.completed_at,
        })
    }

    async fn pending_requests(&self, ctx: &Context<'_>) -> Vec<ServiceRequestInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut requests = Vec::new();
        
        state.service_requests.for_each_index_value(|_key, request| {
            if matches!(request.status, crate::state::ServiceStatus::Pending) {
                requests.push(ServiceRequestInfo {
                    id: request.id,
                    requester_agent: request.requester_agent,
                    provider_agent: request.provider_agent,
                    service_type: request.service_type,
                    parameters: request.parameters,
                    payment: request.payment.to_string(),
                    status: format!("{:?}", request.status),
                    created_at: request.created_at,
                    completed_at: request.completed_at,
                });
            }
            Ok(())
        }).await.ok();

        requests
    }

    async fn transactions(&self, ctx: &Context<'_>, limit: Option<i32>) -> Vec<TransactionInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut transactions = Vec::new();
        let limit = limit.unwrap_or(100) as usize;
        
        state.transactions.for_each_index_value(|_key, tx| {
            if transactions.len() < limit {
                transactions.push(TransactionInfo {
                    id: tx.id,
                    from_agent: tx.from_agent,
                    to_agent: tx.to_agent,
                    amount: tx.amount.to_string(),
                    transaction_type: format!("{:?}", tx.transaction_type),
                    timestamp: tx.timestamp,
                });
            }
            Ok(())
        }).await.ok();

        transactions
    }

    async fn marketplace_stats(&self, ctx: &Context<'_>) -> MarketplaceStats {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        
        let total_agents = state.total_agents.get();
        let total_transactions = state.total_transactions.get();
        let total_volume = state.total_volume.get();

        let mut active_count = 0u64;
        let mut total_reputation = 0u64;
        
        state.agents.for_each_index_value(|_key, agent| {
            if agent.is_active {
                active_count += 1;
            }
            total_reputation += agent.reputation;
            Ok(())
        }).await.ok();

        let average_reputation = if total_agents > 0 {
            total_reputation as f64 / total_agents as f64
        } else {
            0.0
        };

        MarketplaceStats {
            total_agents,
            active_agents: active_count,
            total_transactions,
            total_volume: total_volume.to_string(),
            average_reputation,
        }
    }

    async fn market_listings(&self, ctx: &Context<'_>) -> Vec<MarketListingInfo> {
        let state = ctx.data::<Arc<AgentChainState<ServiceRuntime>>>().ok().unwrap();
        let mut listings = Vec::new();
        
        state.market_listings.for_each_index_value(|_key, listing| {
            listings.push(MarketListingInfo {
                agent_id: listing.agent_id,
                service_type: listing.service_type,
                price: listing.price.to_string(),
                capacity: listing.capacity,
                average_completion_time: listing.average_completion_time,
                success_rate: listing.success_rate,
            });
            Ok(())
        }).await.ok();

        listings
    }
}

pub struct AgentChainService {
    state: Arc<AgentChainState<ServiceRuntime>>,
}

impl Service for AgentChainService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = AgentChainState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        AgentChainService {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, query: &[u8]) -> Vec<u8> {
        let schema = Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
            .data(self.state.clone())
            .finish();

        let query_str = String::from_utf8_lossy(query);
        let response = schema.execute(&*query_str).await;
        serde_json::to_vec(&response).unwrap_or_default()
    }
}

struct EmptyMutation;

#[Object]
impl EmptyMutation {}
