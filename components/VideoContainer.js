function createVideoContainer(id, includeCanvasContainer = false) {
    return `
        <div class="video-container" id="${id}" style="display: block">
            <div class="video-inner-container">
                <video class="video"></video>
                <canvas class="canvas"></canvas>
                <canvas class="top-canvas"></canvas>
                <button class="play-pause-button">
                    <span class="play-icon" style="display: none">&#9654;</span>
                    <span class="pause-icon">&#10074;&#10074;</span>
                </button>
                <div class="fps-display"></div>
            </div>
            ${includeCanvasContainer ? `
            <div class="canvas-container">
                <div class="canvas-wrapper">
                    <canvas class="pixel-canvas" width="150" height="150"></canvas>
                </div>
            </div>` : ''}
        </div>
    `;
}

export function setupVideoContainers() {
    const topSection = document.getElementById('top');
    topSection.innerHTML = `
        ${createVideoContainer('video-container1', true)}
        ${createVideoContainer('video-container2')}
    `;
}
