# RPC="https://base-sepolia.g.alchemy.com/v2/xC7gy-WyxYdV48GlxEyP4n6xuVfYRTK3"
# RPC="https://base-sepolia-rpc.publicnode.com"
RPC="https://optimism-sepolia.blockpi.network/v1/rpc/public"

# include .env
# export

none:

test-worldcoin:
	forge test --match-test "testVerification" --fork-url ${RPC} -vvvv

.PHONY: test-worldcoin
