/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trigger Web Speech API synthesized vocalization of text.
 * Falls back gracefully if SpeechSynthesis is not supported or accessible inside the iframe.
 */
export const speakCoachMessage = (text: string): void => {
  if (typeof window === "undefined") return;

  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("speechSynthesis is not supported by this browser.");
    return;
  }

  try {
    // Stop any existing vocal playbacks
    synth.cancel();

    const cleanText = text.replace(/[*_#`~[\]]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1.0;
    utterance.rate = 1.02; // Slightly snappier
    utterance.pitch = 1.05; // Friendly and bright coaching pitch

    // Dynamically look up available English voices
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Apple"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
  } catch (err) {
    console.error("Vocalization play failed", err);
  }
};

/**
 * Cancel any ongoing speech synthesis activities immediately.
 */
export const stopSpeaking = (): void => {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (synth) {
    synth.cancel();
  }
};
