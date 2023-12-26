import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import axios from "axios";
import { JettonMinter } from "./JettonMinter";

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

  it("should read ipfs data", async () => {
    const minter = client.open(
      JettonMinter.createFromAddress(
        Address.parse("EQCcLAW537KnRg_aSPrnQJoyYjOZkzqYp6FVmRUvN1crSazV"),
        {
          fetchApi,
        }
      )
    );

    const data = await minter.getJettonData();

    expect(data.jettonContent?.name).toBe("Ambra");
    expect(data.jettonContent?.image).toBe(
      "ipfs://bafybeicsvozntp5iatwad32qgvisjxshop62erwohaqnajgsmkl77b6uh4"
    );
  });

  it("should read onchain data", async () => {
    const minter = client.open(
      JettonMinter.createFromAddress(
        Address.parse("EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi"),
        {
          fetchApi,
        }
      )
    );

    const data = await minter.getJettonData();

    expect(data.jettonContent?.name).toBe("Orbit Bridge Ton USD Tether");
    expect(data.jettonContent?.decimals).toBe("6");
  });

  it("should read semi onchain data", async () => {
    const minter = client.open(
      JettonMinter.createFromAddress(
        Address.parse("EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA"),
        {
          fetchApi,
        }
      )
    );

    const data = await minter.getJettonData();

    expect(data.jettonContent?.name).toBe("Tether USD");
    expect(data.jettonContent?.decimals).toBe("6");
  });

  it("should read offchain data", async () => {
    const minter = client.open(
      JettonMinter.createFromAddress(
        Address.parse("EQAfuJx-GWk0rn4T1r3g6SKmXRwBnW7I4jG2izu2qdoNH4aI"),
        {
          fetchApi,
        }
      )
    );

    const data = await minter.getJettonData();

    expect(data.jettonContent?.name).toBe("Wrapped USN");
    expect(data.jettonContent?.decimals).toBe("9");
  });
});
