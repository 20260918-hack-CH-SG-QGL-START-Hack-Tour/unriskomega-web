export async function installVoiceProbe(context) {
  await context.addInitScript(() => {
    const captured = { peers: [], channels: [], streams: [] };
    window.__uroVoiceQa = captured;
    const NativePeer = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends NativePeer {
      constructor(...args) {
        super(...args);
        captured.peers.push(this);
      }
      createDataChannel(...args) {
        const channel = super.createDataChannel(...args);
        captured.channels.push(channel);
        return channel;
      }
    };
    const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (...args) => {
      const stream = await nativeGetUserMedia(...args);
      captured.streams.push(stream);
      return stream;
    };
  });
}
export async function assertVoiceConnected(page) {
  await page.waitForFunction(
    () => {
      const captured = window.__uroVoiceQa;
      return (
        captured.peers.at(-1)?.connectionState === "connected" &&
        captured.channels.at(-1)?.readyState === "open"
      );
    },
    undefined,
    { timeout: 30000 },
  );
}
export async function assertVoiceStopped(page) {
  await page.waitForFunction(
    () => {
      const captured = window.__uroVoiceQa;
      return (
        captured.peers.at(-1)?.connectionState === "closed" &&
        captured.channels.at(-1)?.readyState === "closed" &&
        captured.streams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === "ended"),
        )
      );
    },
    undefined,
    { timeout: 5000 },
  );
}

export async function assertVoiceMuted(page, muted) {
  await page.waitForFunction(
    (muted) => {
      const captured = window.__uroVoiceQa;
      return (
        captured.peers.at(-1)?.connectionState === "connected" &&
        captured.streams
          .at(-1)
          ?.getAudioTracks()
          .every(
            (track) => track.readyState === "live" && track.enabled === !muted,
          )
      );
    },
    muted,
    { timeout: 5000 },
  );
}
