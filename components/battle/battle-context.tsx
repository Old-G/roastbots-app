"use client";

import { createContext, use, useCallback, useState } from "react";
import type { AgentId, Agent } from "@/lib/agents";
import { AGENTS } from "@/lib/agents";

export interface Roast {
  id: string;
  agentId: AgentId;
  round: number;
  text: string;
  crowdScore: number;
  isFatality: boolean;
  isStreaming?: boolean;
}

export interface VoteResults {
  [agentId: string]: { votes: number; percentage: number };
}

interface BattleState {
  roasts: Roast[];
  currentStreamingText: string;
  currentAgentId: AgentId | null;
  isStreaming: boolean;
  isComplete: boolean;
  thinkingAgent: AgentId | null;
  votedFor: AgentId | null;
  voteResults: VoteResults | null;
  winner: string | null;
}

interface BattleActions {
  addRoast: (roast: Roast) => void;
  setStreamingText: (text: string) => void;
  setCurrentAgent: (agentId: AgentId | null) => void;
  setStreaming: (streaming: boolean) => void;
  setComplete: (winner: string | null) => void;
  setThinkingAgent: (agentId: AgentId | null) => void;
  setVote: (agentId: AgentId, results: VoteResults, winner: string | null) => void;
}

interface BattleMeta {
  battleId: string;
  topic: string;
  agent1: Agent;
  agent2: Agent;
}

interface BattleContextValue {
  state: BattleState;
  actions: BattleActions;
  meta: BattleMeta;
}

const BattleContext = createContext<BattleContextValue | null>(null);

export function useBattle(): BattleContextValue {
  const ctx = use(BattleContext);
  if (!ctx) throw new Error("useBattle must be used within BattleProvider");
  return ctx;
}

interface BattleProviderProps {
  battleId: string;
  topic: string;
  agent1Id: AgentId;
  agent2Id: AgentId;
  initialRoasts?: Roast[];
  initialComplete?: boolean;
  initialWinner?: string | null;
  initialVoteResults?: VoteResults | null;
  children: React.ReactNode;
}

export function BattleProvider({
  battleId,
  topic,
  agent1Id,
  agent2Id,
  initialRoasts = [],
  initialComplete = false,
  initialWinner = null,
  initialVoteResults = null,
  children,
}: BattleProviderProps) {
  const [roasts, setRoasts] = useState<Roast[]>(initialRoasts);
  const [currentStreamingText, setCurrentStreamingText] = useState("");
  const [currentAgentId, setCurrentAgentId] = useState<AgentId | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(initialComplete);
  const [thinkingAgent, setThinkingAgent] = useState<AgentId | null>(null);
  const [votedFor, setVotedFor] = useState<AgentId | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResults | null>(
    initialVoteResults
  );
  const [winner, setWinner] = useState<string | null>(initialWinner);

  const actions: BattleActions = {
    addRoast: useCallback((roast: Roast) => {
      setRoasts((prev) => [...prev, roast]);
      setCurrentStreamingText("");
    }, []),
    setStreamingText: useCallback((text: string) => {
      setCurrentStreamingText(text);
    }, []),
    setCurrentAgent: useCallback((agentId: AgentId | null) => {
      setCurrentAgentId(agentId);
    }, []),
    setStreaming: useCallback((streaming: boolean) => {
      setIsStreaming(streaming);
    }, []),
    setComplete: useCallback((winId: string | null) => {
      setIsComplete(true);
      setIsStreaming(false);
      setWinner(winId);
    }, []),
    setThinkingAgent: useCallback((agentId: AgentId | null) => {
      setThinkingAgent(agentId);
    }, []),
    setVote: useCallback(
      (agentId: AgentId, results: VoteResults, winId: string | null) => {
        setVotedFor(agentId);
        setVoteResults(results);
        setWinner(winId);
      },
      []
    ),
  };

  const meta: BattleMeta = {
    battleId,
    topic,
    agent1: AGENTS[agent1Id],
    agent2: AGENTS[agent2Id],
  };

  return (
    <BattleContext
      value={{
        state: {
          roasts,
          currentStreamingText,
          currentAgentId,
          isStreaming,
          isComplete,
          thinkingAgent,
          votedFor,
          voteResults,
          winner,
        },
        actions,
        meta,
      }}
    >
      {children}
    </BattleContext>
  );
}
