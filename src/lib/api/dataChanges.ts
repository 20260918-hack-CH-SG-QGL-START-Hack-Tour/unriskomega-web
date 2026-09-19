const eventName = "uro-data-changed";
const channelName = "uro-data-changes";

export function publishDataChange() {
  window.dispatchEvent(new Event(eventName));
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(channelName);
  channel.postMessage("changed");
  channel.close();
}

export function subscribeDataChanges(refresh: () => void) {
  window.addEventListener(eventName, refresh);
  const focus = () => {
    if (document.visibilityState === "visible") refresh();
  };
  window.addEventListener("focus", focus);
  const channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(channelName);
  if (channel)
    channel.onmessage = (event) => {
      if (event.data === "changed") refresh();
    };
  return () => {
    window.removeEventListener(eventName, refresh);
    window.removeEventListener("focus", focus);
    channel?.close();
  };
}
