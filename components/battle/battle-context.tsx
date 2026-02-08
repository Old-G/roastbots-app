"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";

/** Minimal agent info needed by battle UI (works for both house bots and fighters). */
export interface BattleAgent {
  id: string;
  name: string;
  initials: string;
  tagline: string;
  color: string;
}

export interface Roast {
  id: string;
  agentId: string;
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
  currentAgentId: string | null;
  isStreaming: boolean;
  isComplete: boolean;
  thinkingAgent: string | null;
  votedFor: string | null;
  voteResults: VoteResults | null;
  winner: string | null;
}

interface BattleActions {
  addRoast: (roast: Roast) => void;
  setStreamingText: (text: string) => void;
  setCurrentAgent: (agentId: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  setComplete: (winner: string | null) => void;
  setThinkingAgent: (agentId: string | null) => void;
  setVote: (agentId: string, results: VoteResults, winner: string | null) => void;
}

interface BattleMeta {
  battleId: string;
  topic: string;
  agent1: BattleAgent;
  agent2: BattleAgent;
  /** Look up agent by ID (returns agent1 or agent2). */
  getAgent: (id: string) => BattleAgent;
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
  agent1: BattleAgent;
  agent2: BattleAgent;
  initialRoasts?: Roast[];
  initialComplete?: boolean;
  initialWinner?: string | null;
  initialVoteResults?: VoteResults | null;
  children: React.ReactNode;
}

export function BattleProvider({
  battleId,
  topic,
  agent1,
  agent2,
  initialRoasts = [],
  initialComplete = false,
  initialWinner = null,
  initialVoteResults = null,
  children,
}: BattleProviderProps) {
  const [roasts, setRoasts] = useState<Roast[]>(initialRoasts);
  const [currentStreamingText, setCurrentStreamingText] = useState("");
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(initialComplete);
  const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResults | null>(
    initialVoteResults
  );
  const [winner, setWinner] = useState<string | null>(initialWinner);

  const addRoast = useCallback((roast: Roast) => {
    setRoasts((prev) => [...prev, roast]);
    setCurrentStreamingText("");
  }, []);
  const setStreamingTextFn = useCallback((text: string) => {
    setCurrentStreamingText(text);
  }, []);
  const setCurrentAgentFn = useCallback((agentId: string | null) => {
    setCurrentAgentId(agentId);
  }, []);
  const setStreamingFn = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
  }, []);
  const setCompleteFn = useCallback((winId: string | null) => {
    setIsComplete(true);
    setIsStreaming(false);
    setThinkingAgent(null);
    setWinner(winId);
  }, []);
  const setThinkingAgentFn = useCallback((agentId: string | null) => {
    setThinkingAgent(agentId);
  }, []);
  const setVoteFn = useCallback(
    (agentId: string, results: VoteResults, winId: string | null) => {
      setVotedFor(agentId);
      setVoteResults(results);
      setWinner(winId);
    },
    []
  );

  const actions = useMemo<BattleActions>(
    () => ({
      addRoast,
      setStreamingText: setStreamingTextFn,
      setCurrentAgent: setCurrentAgentFn,
      setStreaming: setStreamingFn,
      setComplete: setCompleteFn,
      setThinkingAgent: setThinkingAgentFn,
      setVote: setVoteFn,
    }),
    [addRoast, setStreamingTextFn, setCurrentAgentFn, setStreamingFn, setCompleteFn, setThinkingAgentFn, setVoteFn]
  );

  const meta = useMemo<BattleMeta>(
    () => ({
      battleId,
      topic,
      agent1,
      agent2,
      getAgent: (id: string) => (id === agent1.id ? agent1 : agent2),
    }),
    [battleId, topic, agent1, agent2]
  );

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
