
precision mediump float;
uniform sampler2D tex;
uniform bool is_active;
uniform float transition;
varying vec2 v_uv;

/*
 * Fragment shader for text scrolling effect with optional blur and curved distortion.
 *
 * - Applies a horizontal Gaussian blur when `is_active` is true, using a 5-tap filter.
 * - Distorts the vertical UV coordinate to simulate a lens curve effect, controlled by `transition`.
 * - Samples the texture at multiple offsets to blend blurred and distorted colors.
 *
 * Uniforms/Inputs:
 *   - tex: Sampler2D for the input texture.
 *   - v_uv: Varying vec2 for the fragment's UV coordinates.
 *   - is_active: Boolean flag indicating if blur/distortion should be applied.
 *   - transition: Float controlling the strength of the curved distortion.
 *
 * Output:
 *   - gl_FragColor: Final color after blur and distortion effects.
 */
void main() {
    // Calculate blur amount based on star activity
    float blur_amount = is_active ? 0.000 : 0.000;
    vec2 blur_dir = vec2(blur_amount, 0.0);

    // Apply a curved distortion effect if the star is active
    // This simulates a simple lens distortion effect
    vec2 curved_uv = v_uv;
    float curve_offset = -0.08 * pow(curved_uv.x - 0.5, 2.0) * transition;
    curved_uv.y += curve_offset;

    // Apply a Gaussian blur using a 5-tap filter
    vec4 color_sum = vec4(0.0);
    color_sum += texture2D(tex, curved_uv - 2.0 * blur_dir) * 0.1;
    color_sum += texture2D(tex, curved_uv - 1.0 * blur_dir) * 0.2;
    color_sum += texture2D(tex, curved_uv) * 0.4;
    color_sum += texture2D(tex, curved_uv + 1.0 * blur_dir) * 0.2;
    color_sum += texture2D(tex, curved_uv + 2.0 * blur_dir) * 0.1;

    gl_FragColor = color_sum;
}
