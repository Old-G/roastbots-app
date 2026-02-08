-- Migrate old agent IDs to new branded names
-- Run this against your Supabase database after deploying the code changes.
--
-- Old IDs: claude, gpt, gemini, llama, mistral, deepseek
-- New IDs: inferno, viper, phantom, havoc, frostbyte, cipher

BEGIN;

-- battles.agent1_id
UPDATE battles SET agent1_id = 'inferno'  WHERE agent1_id = 'claude';
UPDATE battles SET agent1_id = 'viper'    WHERE agent1_id = 'gpt';
UPDATE battles SET agent1_id = 'phantom'  WHERE agent1_id = 'gemini';
UPDATE battles SET agent1_id = 'havoc'    WHERE agent1_id = 'llama';
UPDATE battles SET agent1_id = 'frostbyte' WHERE agent1_id = 'mistral';
UPDATE battles SET agent1_id = 'cipher'   WHERE agent1_id = 'deepseek';

-- battles.agent2_id
UPDATE battles SET agent2_id = 'inferno'  WHERE agent2_id = 'claude';
UPDATE battles SET agent2_id = 'viper'    WHERE agent2_id = 'gpt';
UPDATE battles SET agent2_id = 'phantom'  WHERE agent2_id = 'gemini';
UPDATE battles SET agent2_id = 'havoc'    WHERE agent2_id = 'llama';
UPDATE battles SET agent2_id = 'frostbyte' WHERE agent2_id = 'mistral';
UPDATE battles SET agent2_id = 'cipher'   WHERE agent2_id = 'deepseek';

-- battles.winner_id
UPDATE battles SET winner_id = 'inferno'  WHERE winner_id = 'claude';
UPDATE battles SET winner_id = 'viper'    WHERE winner_id = 'gpt';
UPDATE battles SET winner_id = 'phantom'  WHERE winner_id = 'gemini';
UPDATE battles SET winner_id = 'havoc'    WHERE winner_id = 'llama';
UPDATE battles SET winner_id = 'frostbyte' WHERE winner_id = 'mistral';
UPDATE battles SET winner_id = 'cipher'   WHERE winner_id = 'deepseek';

-- roasts.agent_id
UPDATE roasts SET agent_id = 'inferno'  WHERE agent_id = 'claude';
UPDATE roasts SET agent_id = 'viper'    WHERE agent_id = 'gpt';
UPDATE roasts SET agent_id = 'phantom'  WHERE agent_id = 'gemini';
UPDATE roasts SET agent_id = 'havoc'    WHERE agent_id = 'llama';
UPDATE roasts SET agent_id = 'frostbyte' WHERE agent_id = 'mistral';
UPDATE roasts SET agent_id = 'cipher'   WHERE agent_id = 'deepseek';

-- votes.voted_for_agent_id
UPDATE votes SET voted_for_agent_id = 'inferno'  WHERE voted_for_agent_id = 'claude';
UPDATE votes SET voted_for_agent_id = 'viper'    WHERE voted_for_agent_id = 'gpt';
UPDATE votes SET voted_for_agent_id = 'phantom'  WHERE voted_for_agent_id = 'gemini';
UPDATE votes SET voted_for_agent_id = 'havoc'    WHERE voted_for_agent_id = 'llama';
UPDATE votes SET voted_for_agent_id = 'frostbyte' WHERE voted_for_agent_id = 'mistral';
UPDATE votes SET voted_for_agent_id = 'cipher'   WHERE voted_for_agent_id = 'deepseek';

COMMIT;
