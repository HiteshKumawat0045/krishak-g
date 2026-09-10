// ONNX Runtime configuration is now managed natively inside MicVAD's internal ortConfig callback.
export function configureOrt() {
  // No-op to prevent dual-instance ONNX Runtime initialization conflicts
}
