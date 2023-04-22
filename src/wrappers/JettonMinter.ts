import { Address, beginCell, Cell, Contract, ContractProvider } from "ton-core";
import {
  readOffChainMetadata,
  readOnchainMetadata,
  ONCHAIN_CONTENT_PREFIX,
} from "../libs/onchainContent";
import { requestJson, RequestOptions } from "../libs/request";

export interface JettonMinterContent {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  decimals?: string;
}

export interface JettonMinterData {
  totalSupply: bigint;
  isMutable: boolean;
  adminAddress: Address | null;
  jettonContentCell: Cell;
  jettonWalletCode: Cell;
  jettonContent: Partial<JettonMinterContent> | null;
}

const getJettonNameState = async (jettonContentUri: string, options?: RequestOptions) => {
  let state: Partial<JettonMinterContent> = {};

  if (jettonContentUri) {
    state = await requestJson<Partial<JettonMinterContent>>(jettonContentUri, options);
  }
  if (state.name) {
    state.name = state.name.replace(/\0.*$/g, ""); // remove null bytes
  }
  if (state.decimals && typeof state.decimals == "number") {
    state.decimals = String(state.decimals);
  }

  return state;
};

const getJettonContent = async (jettonContentCell: Cell, options?: RequestOptions) => {
  try {
    const contentSlice = jettonContentCell.beginParse();
    const prefix = contentSlice.loadUint(8);

    if (prefix === ONCHAIN_CONTENT_PREFIX) {
      const { uri } = readOnchainMetadata<{ uri: string }>(jettonContentCell, [
        "uri",
      ]);

      const jettonContent = readOnchainMetadata<JettonMinterContent>(
        jettonContentCell,
        ["name", "description", "image", "symbol", "decimals"]
      );

      if (uri) {
        const state = await getJettonNameState(uri, options);
        return {
          ...state,
          ...jettonContent,
        };
      } else {
        return jettonContent;
      }
    } else {
      const contentUrl = readOffChainMetadata(contentSlice);

      if (contentUrl) {
        const state = await getJettonNameState(contentUrl.toString("utf8"), options);
        return state;
      } else {
        throw new Error("Unexpected jetton metadata content prefix");
      }
    }
  } catch (e) {
    return null;
  }
};

export class JettonMinter implements Contract {
  constructor(
    readonly address: Address,
    readonly options?: RequestOptions
  ) {}

  static createFromAddress(address: Address, options?: RequestOptions) {
    return new JettonMinter(address, options);
  }

  async getJettonData(provider: ContractProvider): Promise<JettonMinterData> {
    let res = await provider.get("get_jetton_data", []);

    const totalSupply = res.stack.readBigNumber();
    const isMutable = res.stack.readNumber() === -1;
    let adminAddress = null;
    try {
      adminAddress = res.stack.readAddress();
    } catch (e) {}
    const jettonContentCell = res.stack.readCell();
    const jettonWalletCode = res.stack.readCell();

    const jettonContent = await getJettonContent(jettonContentCell, this.options);

    return {
      totalSupply,
      isMutable,
      adminAddress,
      jettonContentCell,
      jettonWalletCode,
      jettonContent,
    };
  }

  async getWalletAddress(
    provider: ContractProvider,
    wallet: Address
  ): Promise<Address> {
    let res = await provider.get("get_wallet_address", [
      { type: "slice", cell: beginCell().storeAddress(wallet).endCell() },
    ]);
    return res.stack.readAddress();
  }
}
