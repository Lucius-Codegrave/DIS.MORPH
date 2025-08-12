export type RotationHandler = {
  currentRotationX: number;
  currentRotationY: number;
  targetRotationX: number;
  targetRotationY: number;
  handleMouseMove: (event: MouseEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  updateCurrentRotations: () => void;
};

/**
 * Creates a rotation handler for managing smooth rotation angles based on mouse movement.
 *
 * The handler calculates target rotation angles (`targetRotationX`, `targetRotationY`) based on the mouse position
 * relative to the window, and smoothly interpolates the current rotation angles (`currentRotationX`, `currentRotationY`)
 * towards the target values using a configurable smoothing factor.
 */
export function createRotationHandler(
  options: {
    baseRotationAngleX?: number;
    baseRotationAngleY?: number;
    maxRotationRangeX?: number;
    maxRotationRangeY?: number;
    rotationSmoothing?: number;
  } = {}
): RotationHandler {
  const {
    baseRotationAngleX = 0,
    baseRotationAngleY = -10,
    maxRotationRangeX = 30,
    maxRotationRangeY = 50,
    rotationSmoothing = 0.05,
  } = options;

  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = baseRotationAngleX;
  let currentRotationX = baseRotationAngleX;
  let targetRotationY = baseRotationAngleY;
  let currentRotationY = baseRotationAngleY;

  function updateTargetRotations() {
    const normalizedX = (mouseX / window.innerWidth) * 2 - 1;
    const normalizedY = (mouseY / window.innerHeight) * 2 - 1;
    targetRotationY = baseRotationAngleY + normalizedX * maxRotationRangeY;
    targetRotationX = baseRotationAngleX + normalizedY * maxRotationRangeX;
  }

  function updateCurrentRotations() {
    if (
      currentRotationX !== targetRotationX ||
      currentRotationY !== targetRotationY
    ) {
      currentRotationX +=
        (targetRotationX - currentRotationX) * rotationSmoothing;
      currentRotationY +=
        (targetRotationY - currentRotationY) * rotationSmoothing;
    }
  }

  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    updateTargetRotations();
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      mouseX = event.touches[0].clientX;
      mouseY = event.touches[0].clientY;
      updateTargetRotations();
    }
  }

  return {
    get currentRotationX() {
      return currentRotationX;
    },
    get currentRotationY() {
      return currentRotationY;
    },
    get targetRotationX() {
      return targetRotationX;
    },
    get targetRotationY() {
      return targetRotationY;
    },
    handleMouseMove,
    handleTouchMove,
    updateCurrentRotations,
  };
}
