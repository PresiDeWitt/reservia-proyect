export interface SeatPosition {
  cx: number;
  cy: number;
  angle: number; // degrees, for rotating cinema-seat shape to face table center
}

export const SEAT_RADIUS = 18;
const SEAT_GAP = 22;

export function computeSeatPosition(
  table: { shape: string; x: number; y: number; width: number; height: number; capacity: number; rotation: number },
  seatIndex: number
): SeatPosition {
  const { shape, x, y, width, height, capacity, rotation } = table;
  const tableRotRad = (rotation * Math.PI) / 180;

  let localX = 0;
  let localY = 0;
  let localAngle = 0; // angle in local space (before table rotation)

  if (shape === 'round') {
    const radius = width / 2 + SEAT_GAP + SEAT_RADIUS;
    const angle = (2 * Math.PI * seatIndex) / capacity - Math.PI / 2;
    localX = radius * Math.cos(angle);
    localY = radius * Math.sin(angle);
    // Face toward table center (inward)
    localAngle = (angle * 180) / Math.PI + 90;
  } else {
    // square / rectangular: distribute seats along the perimeter
    const halfW = width / 2 + SEAT_GAP + SEAT_RADIUS;
    const halfH = height / 2 + SEAT_GAP + SEAT_RADIUS;
    const perimeter = 2 * (width + height);
    const step = perimeter / capacity;
    const pos = step * seatIndex + step / 2;

    if (pos < width) {
      // top edge
      localX = -width / 2 + pos;
      localY = -halfH;
      localAngle = 180; // facing down (toward table)
    } else if (pos < width + height) {
      // right edge
      localX = halfW;
      localY = -height / 2 + (pos - width);
      localAngle = 270; // facing left (toward table)
    } else if (pos < 2 * width + height) {
      // bottom edge
      localX = width / 2 - (pos - width - height);
      localY = halfH;
      localAngle = 0; // facing up (toward table)
    } else {
      // left edge
      localX = -halfW;
      localY = height / 2 - (pos - 2 * width - height);
      localAngle = 90; // facing right (toward table)
    }
  }

  // Apply table rotation to position
  const cx = x + localX * Math.cos(tableRotRad) - localY * Math.sin(tableRotRad);
  const cy = y + localX * Math.sin(tableRotRad) + localY * Math.cos(tableRotRad);
  const angle = localAngle + rotation;

  return { cx, cy, angle };
}
