import { beginCell, toNano, Address } from "@ton/core";

export function buildJettonTransferPayload(to: string, amount: string, forwardComment?: string) {
  // https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md
  const amountUnits = toNano(amount); // amount in jetton units assuming 1 = 10^decimals if UI aligns with decimals
  const toAddr = Address.parse(to);
  const payload = beginCell()
    .storeUint(0xf8a7ea5, 32) // op::transfer
    .storeUint(0, 64) // query_id
    .storeCoins(amountUnits)
    .storeAddress(toAddr)
    .storeAddress(null) // response_destination
    .storeBit(false) // custom_payload: false
    .storeCoins(0) // forward_ton_amount
    .storeRef(beginCell().storeUint(0, 32).storeStringTail(forwardComment || "").endCell()) // forward_payload (text cell)
    .endCell();
  return payload.toBoc().toString("base64");
}
