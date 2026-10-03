// Krótki sygnał dźwiękowy + wibracja dla alertów w aplikacji (bez push).
// Przeglądarki odtwarzają dźwięk dopiero po pierwszej interakcji użytkownika ze stroną.
let ctx: AudioContext | null = null

export function playAlert() {
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime
    for (const [i, freq] of [880, 660, 880].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.2, t + i * 0.18)
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t + i * 0.18)
      osc.stop(t + i * 0.18 + 0.17)
    }
  } catch {
    // brak audio w tej przeglądarce
  }
  navigator.vibrate?.([200, 100, 200])
}
