let typeBP = "lite"; // lite, full, heavy
export let model = "BodyPix"; // MoveNet, BlazePose

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
        case "BodyPix":
            chosenModel = bodySegmentation.SupportedModels.BodyPix;
            detectorConfig = {
                architecture: 'ResNet50',
                runtime: 'tfjs',
                modelType: 'general'
            };
            break;
        default:
            console.error("Unsupported model:", model);
            return [];
    }

    if (model !== "BodyPix") {
        const poseDetector0 = await poseDetection.createDetector(chosenModel, detectorConfig);
        const poseDetector1 = await poseDetection.createDetector(chosenModel, detectorConfig);
        return [poseDetector0, poseDetector1];
    } else {
        const bodyPixConfig = {
            architecture: 'MobileNetV1',
            outputStride: 16,
            quantBytes: 4
        };
        const poseDetector0 = await bodySegmentation.createSegmenter(model, bodyPixConfig);
        const poseDetector1 = await bodySegmentation.createSegmenter(model, bodyPixConfig);
        return [poseDetector0, poseDetector1];
    }
}
