import { getHttpEndpoint } from "@orbs-network/ton-access";
import axios from "axios";
import { TonClient } from "ton";
import { Address } from "ton-core";
import { JettonMinter } from "./JettonMinter";
import { JettonWallet } from "./JettonWallet";

describe("JettonMinter", () => {
  let client: TonClient;

  const fetchApi: any = async (url: string) => {
    const result = await axios.get(url);
    return {
      json: async () => result.data,
    };
  };

  beforeAll(async () => {
    jest.setTimeout(10000);

    const endpoint = await getHttpEndpoint();
    client = new TonClient({ endpoint });
  });

  it("should read jetton wallet owner and admin addresses", async () => {
    const address = Address.parse(
      "EQAfuJx-GWk0rn4T1r3g6SKmXRwBnW7I4jG2izu2qdoNH4aI"
    );

    const user = Address.parse(
      "EQCV4FC_GjwyRDx4RAfI9-f1z3Tfi6JBxEOHol8SUpI2xTxT"
    );

    const minter = client.open(JettonMinter.createFromAddress(address));

    const jettonWalletAddress = await minter.getWalletAddress(user);

    const wallet = client.open(
      JettonWallet.createFromAddress(jettonWalletAddress)
    );

    const balance = await wallet.getBalance();

    expect(balance > 0).toBeTruthy();

    const jettonData = await wallet.getData();

    expect(address.toString()).toBe(jettonData.jettonMinterAddress?.toString());
    expect(user.toString()).toBe(jettonData.ownerAddress?.toString());
  });
});
