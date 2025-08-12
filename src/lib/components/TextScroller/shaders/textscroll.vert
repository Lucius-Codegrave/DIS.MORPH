precision mediump float;
attribute vec2 position;
varying vec2 v_uv;

/**
 * Vertex shader main function.
 * - Maps the input vertex position from [-1, 1] range to [0, 1] UV coordinates and assigns to v_uv.
 * - Sets the final vertex position for rendering by converting the 2D position to a 4D homogeneous coordinate.
 */
void main() {
    // Map position directly to UV coordinates
    v_uv = 0.5 * (position + 1.0);

    // Set the position of the vertex
    gl_Position = vec4(position, 0, 1);
}
