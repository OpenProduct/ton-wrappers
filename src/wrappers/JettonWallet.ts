import { Address, Cell, Contract, ContractProvider } from "@ton/core";

export interface JettonWalletData {
  balance: bigint;
  ownerAddress: Address | null;
  jettonMinterAddress: Address | null;
  jettonWalletCode: Cell;
}

export class JettonWallet implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new JettonWallet(address);
  }

  async getBalance(provider: ContractProvider) {
    let state = await provider.getState();
    if (state.state.type !== "active") {
      return 0n;
    }
    let res = await provider.get("get_wallet_data", []);
    return res.stack.readBigNumber();
  }

  async getData(provider: ContractProvider): Promise<JettonWalletData> {
    let res = await provider.get("get_wallet_data", []);

    const balance = res.stack.readBigNumber();
    const ownerAddress = res.stack.readAddress();
    const jettonMinterAddress = res.stack.readAddress();
    const jettonWalletCode = res.stack.readCell();

    return { balance, ownerAddress, jettonMinterAddress, jettonWalletCode };
  }
}
