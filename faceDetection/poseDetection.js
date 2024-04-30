let model = "MoveNet"; // Model will always be "MoveNet"

export async function createPoseDetector() {
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox,
        enableSmoothing: true,
        multiPoseMaxDimension: 256,};

    // Create both pose detectors concurrently
    const [poseDetector0, poseDetector1] = await Promise.all([
        poseDetection.createDetector(poseDetection.SupportedModels[model], detectorConfig),
        poseDetection.createDetector(poseDetection.SupportedModels[model], detectorConfig)
    ]);

    return [poseDetector0, poseDetector1];
}