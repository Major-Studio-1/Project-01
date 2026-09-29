export function buildGallery(items, containerSelector) {
    const galleryContainer = document.querySelector(containerSelector);
    galleryContainer.innerHTML = ''; // Clear out loading text

    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        
        const title = document.createElement('h3');
        title.textContent = item.title;
        
        card.appendChild(img);
        card.appendChild(title);
        galleryContainer.appendChild(card);
    });
}