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
                // outputStride: parseFloat(16),
                // multiplier: parseFloat(1.0),
                // quantBytes: parseFloat(1),
                runtime: 'tfjs',
                modelType: 'general'
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
        const poseDetector0 = await bodyPix.load(
            {
                architecture: 'ResNet50',
                outputStride: 32,
                quantBytes: 2
            }
        )//bodySegmentation.createSegmenter(chosenModel, detectorConfig);
        const poseDetector1 = await bodyPix.load({
            architecture: 'ResNet50',
            outputStride: 32,
            quantBytes: 2
        })//bodySegmentation.createSegmenter(chosenModel, detectorConfig);
        return [poseDetector0, poseDetector1];

    }
}