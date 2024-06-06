let model = "MoveNet"; // Model will always be "MoveNet"

let poseDetectors;

export async function createPoseDetector() {
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableTracking: false,
        trackerType: poseDetection.TrackerType.BoundingBox,
        enableSmoothing: true,
        multiPoseMaxDimension: 192,};

    // Create both pose detectors concurrently
    const [poseDetector0, poseDetector1] = await Promise.all([
        poseDetection.createDetector(poseDetection.SupportedModels[model], detectorConfig),
        poseDetection.createDetector(poseDetection.SupportedModels[model], detectorConfig)
    ]);

    poseDetectors = [poseDetector0, poseDetector1];
}

export async function getPoseDetection(canvas, i) {
    if (!poseDetectors) await createPoseDetector()
    return poseDetectors[i].estimatePoses(canvas)
}