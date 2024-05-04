# RPC="https://base-sepolia.g.alchemy.com/v2/xC7gy-WyxYdV48GlxEyP4n6xuVfYRTK3"
RPC="https://base-sepolia-rpc.publicnode.com"
# RPC="https://optimism-sepolia.blockpi.network/v1/rpc/public"
# RPC="https://ethereum-sepolia-rpc.publicnode.com"

include .env
export

none:

deploy-reputation:
	forge script DeployReputation --fork-url ${RPC} --broadcast --private-key $(PRIVATE_KEY)

test-register:
	forge test --match-test "testRepuationRegister" -vvvv --fork-url ${RPC} 
test-vote:
	forge test --match-test "testRepuation" -vvvv
test-worldcoin:
	forge test --match-test "testVerification" --fork-url ${RPC} -vvvv

.PHONY: test

