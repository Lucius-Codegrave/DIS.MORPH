precision mediump float;

attribute vec2 position;
varying vec2 v_uv;

/**
 * Vertex shader main function.
 *
 * - Maps the input vertex position to UV coordinates (`v_uv`), ensuring the aspect ratio is maintained.
 *   - The x-coordinate is mapped from [-1, 1] to [0, 1].
 *   - The y-coordinate is mapped from [-1, 1] to [1, 0] (flipped vertically).
 * - Sets the final position of the vertex (`gl_Position`) in clip space.
 *
 * Assumes `position` is a vec2 representing the vertex position in normalized device coordinates.
 */
void main() {
    // Map position directly to UV coordinates
    // This maintains the correct aspect ratio
    v_uv = vec2(0.5 * (position.x + 1.0), 1.0 - 0.5 * (position.y + 1.0));

    // Set the position of the vertex
    gl_Position = vec4(position, 0.0, 1.0);
}
