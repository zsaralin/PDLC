let typeBP = "lite"; // lite, full, heavy
export let model = "BlazePose"; // MoveNet, BlazePose

export async function createBackgroundSegmenter() {
    let detectorConfig = {};
    let chosenModel;

    switch (model) {
        case "MoveNet":
            chosenModel = poseDetection.SupportedModels.MoveNet;
            detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            };
            break;
        case "BlazePose":
            chosenModel = poseDetection.SupportedModels.BlazePose;
            detectorConfig = {
                runtime: 'mediapipe',
                enableSegmentation: true,
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
                type: typeBP,
            };
            break;
        default:
            console.error("Unsupported model:", model);
            return [];
    }

    const poseDetector0 = await poseDetection.createDetector(chosenModel, detectorConfig);
    const poseDetector1 = await poseDetection.createDetector(chosenModel, detectorConfig);
    return [poseDetector0, poseDetector1];
}