attribute vec2 position;

/**
 * Handles the following
 *
 *   - scaling
 *   - rotation
 *   - translation
 */
uniform mat3 transform;

void main() {
  // performs transform
  vec2 coord = (transform * vec3(position, 1)).xy;

  // update the position
  gl_Position = vec4(coord, 0.0, 1.0);
}
