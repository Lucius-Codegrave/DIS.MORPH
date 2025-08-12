// Flubber types
declare module 'flubber' {
  export function interpolate(
    fromPath: string,
    toPath: string,
    options?: {
      maxSegmentLength?: number;
      string?: boolean;
    }
  ): (t: number) => string;
}
