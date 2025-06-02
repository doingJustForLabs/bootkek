export function sizeToResolution(size) {
    if (0 <= size < 64) return "256";
    if (64 <= size < 128) return "128";
    if (128 <= size) return "256";
}