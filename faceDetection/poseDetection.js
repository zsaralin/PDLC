
let typeBP = "heavy"; // lite, full, heavy
export let model = "MoveNet"; // MoveNet, BlazePose

export async function createPoseDetector() {
    let detectorConfig = {};
    let chosenModel;

    switch (model) {
        case "MoveNet":
            chosenModel = poseDetection.SupportedModels.MoveNet;
            detectorConfig = {
                modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
                enableSegmentation: true,
            };
            break;
        case "BlazePose":
            chosenModel = poseDetection.SupportedModels.BlazePose;
            detectorConfig = {
                runtime: 'mediapipe',
                enableSegmentation: true,
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
                type: typeBP,
                numPoses: 5
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