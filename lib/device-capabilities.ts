export type PerformanceNavigator = Navigator & {
  deviceMemory?: number;
  connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
};

export function constrainedDevice(device: PerformanceNavigator) {
  return (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
    device.connection?.saveData === true ||
    ["slow-2g", "2g"].includes(device.connection?.effectiveType || "");
}
