import { getObservableClient } from "@polkadot-api/observable-client"
import { getViewBuilder } from "@polkadot-api/view-builder"
import { createClient } from "@polkadot-api/substrate-client"
import { helper } from "@substrate/light-client-extension-helpers/extension-page"
import { filter, firstValueFrom } from "rxjs"
import { getLookupFn } from "@polkadot-api/metadata-builders"

export const decodeCallData = async (chainId: string, callData: string) => {
  const chains = await helper.getChains()
  const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
  if (!chain) throw new Error("unknown chain")
  const client = getObservableClient(createClient(chain.provider))
  const { metadata$, unfollow } = client.chainHead$()
  try {
    const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
    return getViewBuilder(getLookupFn(metadata)).callDecoder(callData)
  } finally {
    unfollow()
    client.destroy()
  }
}
