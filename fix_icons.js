import { Jimp } from 'jimp';

async function main() {
    try {
        console.log("Reading original image...");
        // Use mushaf_cover.jpg or ai_feature_icon.jpg as the source
        const source = await Jimp.read('public/ai_feature_icon.jpg');
        
        console.log("Generating 192x192...");
        const img192 = source.clone();
        img192.cover({w: 192, h: 192}); // Cover to keep aspect ratio and crop
        await img192.write('public/icon-192.png');
        
        console.log("Generating 512x512...");
        const img512 = source.clone();
        img512.cover({w: 512, h: 512});
        await img512.write('public/icon-512.png');
        
        console.log("Generating 180x180 (Apple Touch Icon)...");
        const img180 = source.clone();
        img180.cover({w: 180, h: 180});
        await img180.write('public/apple-touch-icon.png');
        
        console.log("Done fixing icons!");
    } catch(e) {
        console.error("Error:", e);
    }
}
main();
