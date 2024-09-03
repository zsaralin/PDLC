let typeBP = "lite"; // lite, full, heavy
export let model = "MoveNet"; // MoveNet, BlazePose

async function getDetectorConfig(model) {
    switch (model) {
        case "MoveNet":
            return {
                chosenModel: poseDetection.SupportedModels.MoveNet,
                detectorConfig: {
                    // minPoseScore  : .1, 
                    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
                }
            };
        case "BlazePose":
            return {
                chosenModel: poseDetection.SupportedModels.BlazePose,
                detectorConfig: {
                    runtime: 'mediapipe',
                    enableSegmentation: true,
                    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
                    type: typeBP,
                }
            };
        case "BodyPix":
            return {
                chosenModel: bodySegmentation.SupportedModels.BodyPix,
                detectorConfig: {
                    architecture: 'ResNet50',
                    runtime: 'tfjs',
                    modelType: 'general'
                }
            };
        default:
            throw new Error("Unsupported model: " + model);
    }
}

async function createPoseDetectors(model, detectorConfig) {
    const poseDetector0 = await poseDetection.createDetector(model, detectorConfig);
    const poseDetector1 = await poseDetection.createDetector(model, detectorConfig);
    return [poseDetector0, poseDetector1];
}

async function createBodyPixDetectors() {
    const bodyPixConfig = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        quantBytes: 4,
        numKeypointForMatching: 17,

    };
    const poseDetector0 = await bodySegmentation.createSegmenter(model, bodyPixConfig);
    const poseDetector1 = await bodySegmentation.createSegmenter(model, bodyPixConfig);
    return [poseDetector0, poseDetector1];
}

export async function createBackgroundSegmenter() {
    try {
        const { chosenModel, detectorConfig } = await getDetectorConfig(model);

        if (model === "BodyPix") {
            return await createBodyPixDetectors();
        } else {
            return await createPoseDetectors(chosenModel, detectorConfig);
        }
    } catch (error) {
        console.error(error.message);
        return [];
    }
}
