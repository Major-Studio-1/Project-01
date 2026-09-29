import { fetchOwneyData, processData } from './src/dataFetcher.js';
import { drawBarChart } from './src/barChart.js';
import { drawMapChart } from './src/mapChart.js';
import { drawDonutChart } from './src/donutChart.js';
import { buildGallery } from './src/gallery.js';

async function init() {
    try {
        // 1. Fetch raw data
        const rawData = await fetchOwneyData();
        
        // 2. Process data into usable datasets
        const { locationData, yearData, materialData, galleryItems } = processData(rawData);
        
        // 3. Render D3 Charts
        drawMapChart('#locationChart', locationData);
        drawBarChart('#yearChart', yearData, '#FF9F40');
        drawDonutChart('#materialChart', materialData);
        
        // 4. Render HTML Gallery
        buildGallery(galleryItems, '#itemGallery');

    } catch (error) {
        console.error("Initialization error:", error);
    }
}

init();