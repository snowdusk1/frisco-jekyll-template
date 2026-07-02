document.addEventListener('DOMContentLoaded', function() {
    // We expect bottomHeroData to be a real array of objects now
    if (typeof bottomHeroData !== 'undefined' && bottomHeroData.length > 0) {
        
        // 1. Select a random index and the full data object
        const randomIndex = Math.floor(Math.random() * bottomHeroData.length);
        const randomItem = bottomHeroData[randomIndex];

        // 2. Select the target HTML elements
        const heroSection = document.getElementById('bottom-hero-js-target');
        const attribution = heroSection.querySelector('.image-attribution i');

        // 3. Apply the background style (Path)
        if (heroSection) {
            heroSection.style.backgroundImage = `url(${randomItem.path})`;
        }
        
        // 4. Apply the attribution text (Description)
        if (attribution && randomItem.description) {
            attribution.textContent = randomItem.description;
        }
    }
});
