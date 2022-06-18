export const sleep = async (sleepTimeMs: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, sleepTimeMs))
}
