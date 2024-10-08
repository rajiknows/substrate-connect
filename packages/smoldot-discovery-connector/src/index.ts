import type {
  LightClientProvider,
  RawChain,
} from "@substrate/light-client-extension-helpers/web-page"
import {
  type Chain,
  type JsonRpcCallback,
  type SmoldotExtensionAPI,
  WellKnownChain,
} from "@substrate/smoldot-discovery/types"
export type { LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
export type * from "@substrate/smoldot-discovery/types"

export const defaultWellKnownChainGenesisHashes: Record<string, string> = {
  polkadot:
    "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  ksmcc3: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
  westend2:
    "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
  paseo: "0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f",
  rococo_v2_2:
    "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e",
}

export type MakeOptions = {
  wellKnownChainGenesisHashes?: Record<string, string>
}

export const make = (
  lightClientProvider: LightClientProvider,
  connectOptions?: MakeOptions,
): SmoldotExtensionAPI => {
  const wellKnownChainGenesisHashes =
    connectOptions?.wellKnownChainGenesisHashes ??
    defaultWellKnownChainGenesisHashes

  const internalAddChain = async (
    isWellKnown: boolean,
    chainSpecOrWellKnownName: string,
    jsonRpcCallback: JsonRpcCallback = () => {},
    relayChainGenesisHash?: string,
  ): Promise<Chain> => {
    let chain: RawChain
    if (isWellKnown) {
      const foundChain = Object.values(lightClientProvider.getChains()).find(
        ({ genesisHash }) =>
          genesisHash === wellKnownChainGenesisHashes[chainSpecOrWellKnownName],
      )
      if (!foundChain) throw new Error("Unknown well-known chain")
      chain = foundChain
    } else {
      chain = await lightClientProvider.getChain(
        chainSpecOrWellKnownName,
        relayChainGenesisHash,
      )
    }

    const jsonRpcConnection = chain.connect(jsonRpcCallback)

    return {
      sendJsonRpc(rpc: string): void {
        jsonRpcConnection.send(rpc)
      },
      remove() {
        jsonRpcConnection.disconnect()
      },
      addChain: function (
        chainSpec: string,
        jsonRpcCallback?: JsonRpcCallback | undefined,
      ): Promise<Chain> {
        return internalAddChain(
          false,
          chainSpec,
          jsonRpcCallback,
          chain.genesisHash,
        )
      },
    }
  }

  return {
    addChain: (chainSpec, jsonRpcCallback) =>
      internalAddChain(false, chainSpec, jsonRpcCallback),
    addWellKnownChain: (name, jsonRpcCallback) =>
      internalAddChain(true, name, jsonRpcCallback),
  }
}
