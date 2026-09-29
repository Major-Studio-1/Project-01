import { API_URL } from './config.js';

export async function fetchOwneyData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        console.log("Full API Response:", data);
        if (data.response?.rows?.length > 0) {
            console.log("First item record:", data.response.rows[0]);
        }

        const totalCount = data.response.rowCount;
        const fetchedCount = data.response.rows.length;
        document.querySelector('#recordCountDisplay').textContent = 
            `Total records found: ${totalCount} (Showing data for ${fetchedCount} items)`;

        return data.response.rows;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector('#recordCountDisplay').textContent = "Error loading data.";
        return [];
    }
}

export function processData(rows) {
    const locationCounts = {};
    const yearCounts = {};
    const materialCounts = {};
    const galleryItems = [];

    rows.forEach(row => {
        // Location
        let placeName = "Unknown";
        if (row.content?.indexedStructured?.place) {
            const places = row.content.indexedStructured.place.filter(p => p !== "United States of America");
            if (places.length > 0) placeName = places[0];
        }
        if (placeName !== "Unknown") locationCounts[placeName] = (locationCounts[placeName] || 0) + 1;

        // Year
        let year = "Unknown";
        if (row.content?.freetext?.date) {
            const dateStr = row.content.freetext.date.map(d => d.content).join(" ");
            const match = dateStr.match(/\b(18\d{2}|19\d{2})\b/);
            if (match) year = match[0];
        }
        if (year !== "Unknown") yearCounts[year] = (yearCounts[year] || 0) + 1;

        // Material
        let material = "Unknown";
        if (row.content?.freetext?.physicalDescription) {
            const mediumObj = row.content.freetext.physicalDescription.find(d => d.label === "Medium");
            if (mediumObj) {
                const rawMat = mediumObj.content.toLowerCase();
                if (rawMat.includes('brass')) material = 'Brass';
                else if (rawMat.includes('silver')) material = 'Silver';
                else if (rawMat.includes('copper')) material = 'Copper';
                else if (rawMat.includes('aluminum')) material = 'Aluminum';
                else if (rawMat.includes('metal')) material = 'Metal (General)';
                else if (rawMat.includes('leather')) material = 'Leather';
                else material = rawMat.charAt(0).toUpperCase() + rawMat.slice(1);
            }
        }
        if (material !== "Unknown") materialCounts[material] = (materialCounts[material] || 0) + 1;

        // Gallery Data
        try { 
            const thumbnailUrl = row.content.descriptiveNonRepeating.online_media.media[0].thumbnail;
            if (thumbnailUrl) {
                galleryItems.push({ title: row.title, image: thumbnailUrl });
            }
        } catch (e) { /* Skip if no media */ }
    });

    // Helper to format dictionaries into D3-friendly arrays [{label: 'Ohio', value: 5}]
    const formatForD3 = (dict, sortChronological = false) => {
        let arr = Object.keys(dict).map(key => ({ label: key, value: dict[key] }));
        if (sortChronological) return arr.sort((a, b) => parseInt(a.label) - parseInt(b.label));
        return arr.sort((a, b) => b.value - a.value);
    };

    return {
        locationData: formatForD3(locationCounts),
        yearData: formatForD3(yearCounts, true),
        materialData: formatForD3(materialCounts),
        galleryItems: galleryItems
    };
}