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
        case "BodyPix":
            console.log('hey')

            chosenModel = bodySegmentation.SupportedModels.BodyPix;
            detectorConfig = {
                architecture: 'ResNet50',
                outputStride: parseFloat(16),
                multiplier: parseFloat(1.0),
                quantBytes: parseFloat(1)
            };
            break;

        default:
            console.error("Unsupported model:", model);
            return [];
    }

    if(model !== "BodyPix"){
        const poseDetector0 = await poseDetection.createDetector(chosenModel, detectorConfig);
        const poseDetector1 = await poseDetection.createDetector(chosenModel, detectorConfig);
        return [poseDetector0, poseDetector1];
    } else {
        const poseDetector0 = await bodySegmentation.createSegmenter(chosenModel, detectorConfig);
        const poseDetector1 = await bodySegmentation.createSegmenter(chosenModel, detectorConfig);
        return [poseDetector0, poseDetector1];

    }
}