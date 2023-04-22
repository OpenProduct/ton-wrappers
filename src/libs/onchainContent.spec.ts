
import { buildOnchainMetadata, readOnchainMetadata } from "./onchainContent";

describe('onchainContent', () => {
    it('should build and parse onchain metadata', () => {

        const source = { name: "name", image: "image", decimals: "18" };
        const cellData = buildOnchainMetadata(source);

        const data = readOnchainMetadata<typeof source>(cellData, ["name", "image", "decimals"]);

        expect(data.name).toBe(source.name);
        expect(data.image).toBe(source.image);
        expect(data.decimals).toBe(source.decimals);
    });
    
    for (let size of [127, 128, 500]) {
        it(`should build and parse onchain ${size} length metadata`, () => {
            const name = "n".repeat(size);
            const image = "i".repeat(size);
            const source = { name, image };
            const cellData = buildOnchainMetadata(source);
    
            const data = readOnchainMetadata<typeof source>(cellData, ["name", "image"]);
    
            expect(data.name).toBe(source.name);
            expect(data.image).toBe(source.image);
        });
    }
});