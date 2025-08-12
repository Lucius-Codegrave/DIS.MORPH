export function textScrambler(
  text: string,
  onUpdate: (scrambled: string) => void,
  durationMs: number = 300,
  frameIntervalMs: number = 60,
  infinite: boolean = false
): { stop: () => void } {
  let step = 0;
  const maxStep = Math.round(durationMs / frameIntervalMs);
  let interval: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  function randomChar() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*' +
      '你好世界汉字测试' +
      'こんにちは世界日本語テスト' +
      '안녕하세요세계한글테스트';
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function scramble(progress: number) {
    return text
      .split('')
      .map((c) => {
        if (c.match(/[A-Za-z0-9]/)) {
          return Math.random() < progress ? randomChar() : c;
        }
        return c;
      })
      .join('');
  }

  interval = setInterval(() => {
    if (stopped) return;
    if (step < maxStep) {
      onUpdate(scramble(step / maxStep));
      step++;
    } else {
      if (infinite) {
        onUpdate(scramble(1));
      } else {
        onUpdate(text);
        stop();
      }
    }
  }, frameIntervalMs);

  function stop() {
    if (interval) clearInterval(interval);
    stopped = true;
    onUpdate(text);
  }

  return { stop };
}
