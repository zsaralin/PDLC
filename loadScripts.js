function loadScript(src, type = "text/javascript", async = false) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = type;
        script.async = async;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.head.appendChild(script);
    });
}

async function loadScripts() {
    try {
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@^4.20.0");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@^4.20.0");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@^4.20.0");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@^4.20.0");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/body-segmentation");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose");
        await loadScript("filters/opencv.js", "text/javascript", true);
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js");
    } catch (error) {
        console.error("Error loading scripts:", error);
    }
}

loadScripts();