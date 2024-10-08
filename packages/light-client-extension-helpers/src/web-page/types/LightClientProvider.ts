import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export interface LightClientProvider {
  // Allows dApp developers to request the provider to register their chain
  getChain: (
    chainSpec: string,
    relayChainGenesisHash?: string,
  ) => Promise<RawChain>

  // Retrieves the current list of available Chains
  getChains: () => RawChains

  // Registers a callback invoked when the list of available chains changes
  addChainsChangeListener: (listener: Callback<RawChains>) => UnsubscribeFn
}

// The key is the genesis hash
type RawChains = Record<string, RawChain>

export interface RawChain {
  genesisHash: string
  name: string
  connect: JsonRpcProvider
}

export type { JsonRpcProvider }
