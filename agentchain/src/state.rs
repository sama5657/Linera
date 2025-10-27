use linera_sdk::views::{MapView, RegisterView, RootView, View, ViewStorageContext};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AgentChainError {
    #[error("Agent not found: {0}")]
    AgentNotFound(String),
    
    #[error("Insufficient balance: required {required}, available {available}")]
    InsufficientBalance { required: u128, available: u128 },
    
    #[error("Unauthorized operation")]
    Unauthorized,
    
    #[error("Invalid strategy type")]
    InvalidStrategy,
    
    #[error("Service request failed: {0}")]
    ServiceRequestFailed(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AgentStrategy {
    Trading { risk_level: u8, min_profit: u128 },
    Oracle { data_sources: Vec<String>, update_frequency: u64 },
    Governance { voting_power: u128, delegation_enabled: bool },
    MarketMaker { spread_bps: u16, liquidity_depth: u128 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub owner: String,
    pub name: String,
    pub description: String,
    pub strategy: AgentStrategy,
    pub balance: u128,
    pub reputation: u64,
    pub services_completed: u64,
    pub services_failed: u64,
    pub created_at: u64,
    pub last_active: u64,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceRequest {
    pub id: String,
    pub requester_agent: String,
    pub provider_agent: String,
    pub service_type: String,
    pub parameters: String,
    pub payment: u128,
    pub status: ServiceStatus,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ServiceStatus {
    Pending,
    Accepted,
    InProgress,
    Completed,
    Failed,
    Disputed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub from_agent: String,
    pub to_agent: String,
    pub amount: u128,
    pub transaction_type: TransactionType,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    ServicePayment,
    Transfer,
    Reward,
    Penalty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketListing {
    pub agent_id: String,
    pub service_type: String,
    pub price: u128,
    pub capacity: u32,
    pub average_completion_time: u64,
    pub success_rate: f64,
}

#[derive(RootView)]
pub struct AgentChainState<C> {
    pub agents: MapView<C, String, Agent>,
    pub service_requests: MapView<C, String, ServiceRequest>,
    pub transactions: MapView<C, String, Transaction>,
    pub market_listings: MapView<C, String, MarketListing>,
    pub total_agents: RegisterView<C, u64>,
    pub total_transactions: RegisterView<C, u64>,
    pub total_volume: RegisterView<C, u128>,
}

impl<C: ViewStorageContext> AgentChainState<C> {
    pub async fn create_agent(
        &mut self,
        id: String,
        owner: String,
        name: String,
        description: String,
        strategy: AgentStrategy,
        initial_balance: u128,
    ) -> Result<(), AgentChainError> {
        let agent = Agent {
            id: id.clone(),
            owner,
            name,
            description,
            strategy,
            balance: initial_balance,
            reputation: 100,
            services_completed: 0,
            services_failed: 0,
            created_at: Self::current_timestamp(),
            last_active: Self::current_timestamp(),
            is_active: true,
        };

        self.agents.insert(&id, agent)?;
        
        let mut total = self.total_agents.get();
        *total += 1;
        self.total_agents.set(total);

        Ok(())
    }

    pub async fn get_agent(&self, agent_id: &str) -> Result<Agent, AgentChainError> {
        self.agents
            .get(agent_id)
            .await?
            .ok_or_else(|| AgentChainError::AgentNotFound(agent_id.to_string()))
    }

    pub async fn transfer_tokens(
        &mut self,
        from_agent_id: &str,
        to_agent_id: &str,
        amount: u128,
        transaction_type: TransactionType,
    ) -> Result<String, AgentChainError> {
        let mut from_agent = self.get_agent(from_agent_id).await?;
        let mut to_agent = self.get_agent(to_agent_id).await?;

        if from_agent.balance < amount {
            return Err(AgentChainError::InsufficientBalance {
                required: amount,
                available: from_agent.balance,
            });
        }

        from_agent.balance -= amount;
        to_agent.balance += amount;

        self.agents.insert(from_agent_id, from_agent.clone())?;
        self.agents.insert(to_agent_id, to_agent.clone())?;

        let transaction_id = format!("tx_{}", Self::current_timestamp());
        let transaction = Transaction {
            id: transaction_id.clone(),
            from_agent: from_agent_id.to_string(),
            to_agent: to_agent_id.to_string(),
            amount,
            transaction_type,
            timestamp: Self::current_timestamp(),
        };

        self.transactions.insert(&transaction_id, transaction)?;

        let mut total_txs = self.total_transactions.get();
        *total_txs += 1;
        self.total_transactions.set(total_txs);

        let mut total_vol = self.total_volume.get();
        *total_vol += amount;
        self.total_volume.set(total_vol);

        Ok(transaction_id)
    }

    pub async fn create_service_request(
        &mut self,
        requester_agent: String,
        provider_agent: String,
        service_type: String,
        parameters: String,
        payment: u128,
    ) -> Result<String, AgentChainError> {
        let request_id = format!("req_{}", Self::current_timestamp());
        
        let request = ServiceRequest {
            id: request_id.clone(),
            requester_agent,
            provider_agent,
            service_type,
            parameters,
            payment,
            status: ServiceStatus::Pending,
            created_at: Self::current_timestamp(),
            completed_at: None,
        };

        self.service_requests.insert(&request_id, request)?;
        Ok(request_id)
    }

    pub async fn complete_service(
        &mut self,
        request_id: &str,
        success: bool,
    ) -> Result<(), AgentChainError> {
        let mut request = self.service_requests
            .get(request_id)
            .await?
            .ok_or_else(|| AgentChainError::ServiceRequestFailed("Request not found".to_string()))?;

        if success {
            request.status = ServiceStatus::Completed;
            self.transfer_tokens(
                &request.requester_agent,
                &request.provider_agent,
                request.payment,
                TransactionType::ServicePayment,
            ).await?;

            let mut provider = self.get_agent(&request.provider_agent).await?;
            provider.services_completed += 1;
            provider.reputation = std::cmp::min(provider.reputation + 1, 1000);
            self.agents.insert(&request.provider_agent, provider)?;
        } else {
            request.status = ServiceStatus::Failed;
            
            let mut provider = self.get_agent(&request.provider_agent).await?;
            provider.services_failed += 1;
            provider.reputation = provider.reputation.saturating_sub(5);
            self.agents.insert(&request.provider_agent, provider)?;
        }

        request.completed_at = Some(Self::current_timestamp());
        self.service_requests.insert(request_id, request)?;

        Ok(())
    }

    pub async fn update_market_listing(&mut self, listing: MarketListing) -> Result<(), AgentChainError> {
        let listing_id = format!("{}_{}", listing.agent_id, listing.service_type);
        self.market_listings.insert(&listing_id, listing)?;
        Ok(())
    }

    fn current_timestamp() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }
}
