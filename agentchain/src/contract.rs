use async_trait::async_trait;
use linera_sdk::{
    base::{ApplicationId, ChainId, Timestamp},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};

use crate::state::{AgentChainState, AgentStrategy, ServiceStatus, TransactionType};

#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    CreateAgent {
        name: String,
        description: String,
        strategy: AgentStrategy,
        initial_balance: u128,
    },
    TransferTokens {
        to_agent: String,
        amount: u128,
    },
    RequestService {
        provider_agent: String,
        service_type: String,
        parameters: String,
        payment: u128,
    },
    AcceptService {
        request_id: String,
    },
    CompleteService {
        request_id: String,
        success: bool,
    },
    UpdateStrategy {
        agent_id: String,
        new_strategy: AgentStrategy,
    },
    DeactivateAgent {
        agent_id: String,
    },
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    ServiceRequest {
        request_id: String,
        requester_chain: ChainId,
        provider_agent: String,
        service_type: String,
        payment: u128,
    },
    ServiceResponse {
        request_id: String,
        success: bool,
        data: String,
    },
    TokenTransfer {
        from_agent: String,
        to_agent: String,
        amount: u128,
    },
}

pub struct AgentChainContract {
    state: AgentChainState<Self>,
    runtime: ContractRuntime<Self>,
}

#[async_trait]
impl Contract for AgentChainContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = AgentChainState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        AgentChainContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        self.runtime.application_parameters();
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::CreateAgent {
                name,
                description,
                strategy,
                initial_balance,
            } => {
                let owner = self.runtime.authenticated_signer()
                    .expect("Operation must be signed");
                let agent_id = format!("agent_{}_{}", owner, self.runtime.system_time().micros());
                
                self.state
                    .create_agent(
                        agent_id.clone(),
                        owner.to_string(),
                        name,
                        description,
                        strategy,
                        initial_balance,
                    )
                    .await
                    .expect("Failed to create agent");

                format!("Agent created: {}", agent_id)
            }

            Operation::TransferTokens { to_agent, amount } => {
                let owner = self.runtime.authenticated_signer()
                    .expect("Operation must be signed");
                let from_agent = format!("agent_{}", owner);

                self.state
                    .transfer_tokens(
                        &from_agent,
                        &to_agent,
                        amount,
                        TransactionType::Transfer,
                    )
                    .await
                    .expect("Failed to transfer tokens");

                format!("Transferred {} tokens to {}", amount, to_agent)
            }

            Operation::RequestService {
                provider_agent,
                service_type,
                parameters,
                payment,
            } => {
                let owner = self.runtime.authenticated_signer()
                    .expect("Operation must be signed");
                let requester_agent = format!("agent_{}", owner);

                let request_id = self.state
                    .create_service_request(
                        requester_agent.clone(),
                        provider_agent.clone(),
                        service_type.clone(),
                        parameters.clone(),
                        payment,
                    )
                    .await
                    .expect("Failed to create service request");

                let message = Message::ServiceRequest {
                    request_id: request_id.clone(),
                    requester_chain: self.runtime.chain_id(),
                    provider_agent: provider_agent.clone(),
                    service_type,
                    payment,
                };

                self.runtime
                    .prepare_message(message)
                    .send_to(self.runtime.chain_id());

                format!("Service request created: {}", request_id)
            }

            Operation::CompleteService { request_id, success } => {
                self.state
                    .complete_service(&request_id, success)
                    .await
                    .expect("Failed to complete service");

                format!("Service {} marked as {}", request_id, if success { "completed" } else { "failed" })
            }

            Operation::UpdateStrategy { agent_id, new_strategy } => {
                let mut agent = self.state.get_agent(&agent_id).await
                    .expect("Agent not found");
                
                agent.strategy = new_strategy;
                agent.last_active = self.runtime.system_time().micros() / 1_000_000;
                
                self.state.agents.insert(&agent_id, agent)
                    .expect("Failed to update agent");

                format!("Strategy updated for agent: {}", agent_id)
            }

            Operation::DeactivateAgent { agent_id } => {
                let mut agent = self.state.get_agent(&agent_id).await
                    .expect("Agent not found");
                
                agent.is_active = false;
                self.state.agents.insert(&agent_id, agent)
                    .expect("Failed to deactivate agent");

                format!("Agent deactivated: {}", agent_id)
            }

            Operation::AcceptService { request_id } => {
                let mut request = self.state.service_requests.get(&request_id).await
                    .expect("Failed to get request")
                    .expect("Request not found");
                
                request.status = ServiceStatus::Accepted;
                self.state.service_requests.insert(&request_id, request)
                    .expect("Failed to update request");

                format!("Service request accepted: {}", request_id)
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            Message::ServiceRequest {
                request_id,
                requester_chain,
                provider_agent,
                service_type,
                payment,
            } => {
                let mut agent = self.state.get_agent(&provider_agent).await
                    .expect("Provider agent not found");

                agent.last_active = self.runtime.system_time().micros() / 1_000_000;
                self.state.agents.insert(&provider_agent, agent)
                    .expect("Failed to update agent");
            }

            Message::ServiceResponse {
                request_id,
                success,
                data,
            } => {
                self.state.complete_service(&request_id, success).await
                    .expect("Failed to process service response");
            }

            Message::TokenTransfer {
                from_agent,
                to_agent,
                amount,
            } => {
                self.state
                    .transfer_tokens(&from_agent, &to_agent, amount, TransactionType::Transfer)
                    .await
                    .expect("Failed to execute cross-chain transfer");
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl AgentChainContract {
    fn get_current_timestamp(&self) -> u64 {
        self.runtime.system_time().micros() / 1_000_000
    }
}
