
export async function createPoseDetector() {
    const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
    const postDetector0 = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    const poseDetector1 = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    return [postDetector0, poseDetector1]
}
  