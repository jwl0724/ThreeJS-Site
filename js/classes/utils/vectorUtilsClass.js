export { VectorUtils }

class VectorUtils {
    static approxEqualsVector3(vector1, vector2, tolerance) {
        const diffX = Math.abs(vector1.x - vector2.x);
        const diffY = Math.abs(vector1.y - vector2.y);
        const diffZ = Math.abs(vector1.z - vector2.z);
        return diffX <= tolerance && diffY <= tolerance && diffZ <= tolerance;
    }
}