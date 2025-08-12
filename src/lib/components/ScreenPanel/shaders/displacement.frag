
precision mediump float;

uniform sampler2D u_video;
uniform sampler2D u_noise;
uniform sampler2D u_image;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_video_size;
uniform float u_size_percent;
uniform float u_rotation_angle_y;      // Y-axis rotation angle in degrees (mouse X)
uniform float u_rotation_angle_x;      // X-axis rotation angle in degrees (mouse Y)
uniform float u_displacement_strength; // Noise displacement intensity
uniform float u_star_active;
uniform float u_left;
uniform float star_transition;
uniform vec2 u_image_size;
varying vec2 v_uv;

/**
 * Fragment shader for video displacement and morphing effects.
 *
 * Features:
 * - Maintains aspect ratio for video and displacement image.
 * - Fits video within a target area, scaling and centering UV coordinates.
 * - Applies 3D-like rotation (Y and X axes) controlled by uniform angles.
 * - Simulates perspective projection based on rotation.
 * - Generates complex displacement using noise textures and morphs between video/image displacement.
 * - Handles left/right morphing logic via uniforms.
 * - Inverts video colors for visual effect.
 * - Calculates luminance to detect white pixels in the original video.
 * - Applies a smooth transparency mask to white pixels for soft edges.
 *
 * Uniforms:
 * - u_video_size: vec2, size of the video texture.
 * - u_resolution: vec2, size of the rendering canvas.
 * - u_size_percent: float, percentage of canvas to use for video.
 * - u_left: bool/int, controls morphing direction.
 * - u_star_active: float, controls morphing state.
 * - star_transition: float, transition value for morphing.
 * - u_rotation_angle_x/y: float, rotation angles in degrees.
 * - u_displacement_strength: float, strength of displacement effect.
 * - u_noise: sampler2D, noise texture for displacement.
 * - u_video: sampler2D, video texture.
 * - u_image: sampler2D, displacement image texture.
 * - u_image_size: vec2, size of the displacement image.
 * - u_time: float, time for animation.
 *
 * Varyings:
 * - v_uv: vec2, interpolated UV coordinates.
 *
 * Output:
 * - gl_FragColor: vec4, final color with displacement, morphing, inversion, and transparency mask applied.
 */
void main() {
    // Calculate video aspect ratio
    float videoAspect = u_video_size.x / u_video_size.y;
    float canvasAspect = u_resolution.x / u_resolution.y;

    // Calculate target dimensions
    vec2 targetSize = u_resolution * u_size_percent;
    float targetAspect = targetSize.x / targetSize.y;

    // Fit video within target area maintaining aspect ratio
    vec2 scale;
    if(targetAspect > videoAspect) {
        // Target is wider - fit by height
        scale.y = u_size_percent;
        scale.x = scale.y * videoAspect / canvasAspect;
    } else {
        // Target is taller - fit by width
        scale.x = u_size_percent;
        scale.y = scale.x * canvasAspect / videoAspect;
    }

    // Center the video
    vec2 center = vec2(0.5, 0.5 );

    // Scale UV coordinates to fit the video within the target area
    vec2 scaledUV = (v_uv - center) / scale + center;

    // Position in normalized coordinates for 3D transformation
    vec3 pos = vec3(scaledUV - center, (!bool(u_left) && u_star_active > 0.0) ? star_transition * 1.25 : 0.25);

    // Rotate around Y axis (mouse X controls this)
    float angleY = radians(u_rotation_angle_y);
    mat3 rotY = mat3(cos(angleY), 0.0, sin(angleY), 0.0, 1.0, 0.0, -sin(angleY), 0.0, cos(angleY));

    // Rotate around X axis (mouse Y controls this)
    float angleX = radians(u_rotation_angle_x);
    mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cos(angleX), -sin(angleX), 0.0, -sin(angleX), cos(angleX));

    // Apply both rotations: first Y, then X
    vec3 rotated = rotX * (rotY * pos);

    // Add perspective projection (simulated)
    float perspective = 1.0 + rotated.z * 0.5;          // Adjust perspective strength
    vec2 finalUV = (rotated.xy / perspective) + center; // Adjust UV based on perspective

    // Apply bounds checking to rotated UV
    if(finalUV.x < 0.0 || finalUV.x > 1.0 || finalUV.y < 0.0 || finalUV.y > 1.0) {
        // discard; // Don't render outside video bounds
    }



    // --- Respect du ratio de l'image displacement ---
    float imageAspect = u_image_size.x / u_image_size.y;
    vec2 imageUV;
    if (canvasAspect > imageAspect) {
        // Canvas plus large, fit par la hauteur, crop sur X
        float scale = imageAspect / canvasAspect;
        float xOffset = (1.0 - scale) * 0.5;
        imageUV = vec2((v_uv.x - xOffset) / scale, v_uv.y);
    } else {
        // Canvas plus haut, fit par la largeur, crop sur Y
        float scale = canvasAspect / imageAspect;
        float yOffset = (1.0 - scale) * 0.5;
        imageUV = vec2(v_uv.x, (v_uv.y - yOffset) / scale);
    }

    // Apply noise displacement using video texture
    // Use multiple samples for more complex displacement
    vec2 noiseUV1 = v_uv + vec2(u_time * 0.03, u_time * 0.02);
    vec2 noiseUV2 = v_uv + vec2(-u_time * 0.04, u_time * 0.05);
    vec2 noiseUV3 = mat2(cos(u_time), -sin(u_time), sin(u_time), cos(u_time)) * (imageUV - 0.5) + 0.5;
    vec2 noise1, noise2, noise3Video, noise3Image;
    noise1 = texture2D(u_noise, noiseUV1).rg;
    noise2 = texture2D(u_noise, noiseUV2).gb;
    noise3Video = texture2D(u_noise, noiseUV3).rg;
    noise3Image = texture2D(u_image, noiseUV3).rg;

    vec2 offset;
    if (!bool(u_left)) {

        vec2 morphDisp = mix(noise3Video, noise3Image, u_star_active / 2.0);

        vec2 firstOffset = (morphDisp - 0.5) * u_displacement_strength;
        
        vec2 noise3Video2 = mix(texture2D(u_video, finalUV + firstOffset).rg, texture2D(u_video, finalUV + firstOffset).gb, 0.5);
        offset = firstOffset + (noise3Video2 - 0.5) * u_displacement_strength * 0.5;
    } else {
        vec2 combinedNoise = mix(noise1, noise2, 0.5);
        offset = (combinedNoise - 0.5) * u_displacement_strength;
    }

    // // Generate a chaotic edge mask
    // float blobMask = texture2D(u_noise, v_uv * 2.0 + u_time * 0.1).r; 
    // float edge = smoothstep(0.15, 0.25, blobMask); 
    // float edgeMask = (u_star_active == 1.0) ? edge : 1.0;

    // Sample the video texture
    vec4 color = texture2D(u_video, finalUV + offset);

    // Invert colors
    color.rgb = 1.0 - color.rgb;

    // Calculate luminance of the original (non-inverted) color to detect white pixels
    vec3 originalColor = 1.0 - color.rgb;                            // Get back original color
    float luminance = dot(originalColor, vec3(0.299, 0.587, 0.114)); // Luminance calculation

    // Create transparency mask for white pixels (high luminance in original)
    // Smooth transition between white (transparent) and non-white (opaque)
    float whiteMask = smoothstep(0.8, 0.7, luminance);

    // Apply the mask to the alpha channel
    color.a = mix(0.9, 0.0, whiteMask);

    gl_FragColor = color;
}
