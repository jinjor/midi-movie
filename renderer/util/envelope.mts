type EnvelopeOptions = {
  base: number;
  peak: number;
  active: number;
  end?: number;
  decaySec: number;
  releaseSec: number;
  fromSec: number;
  toSec: number;
  elapsedSec: number;
};
export function calcEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}: EnvelopeOptions) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
      ? active + (peak - active) * Math.exp(-(elapsedSec - fromSec) / decaySec)
      : end + (active - end) * Math.exp(-(elapsedSec - toSec) / releaseSec);
}
export function calcLinearEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}: EnvelopeOptions) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
      ? peak - (peak - active) * ((elapsedSec - fromSec) / decaySec)
      : active - (active - end) * ((elapsedSec - toSec) / releaseSec);
}

export function calcQuadraticEnvelope({
  base,
  peak,
  active,
  end,
  decaySec,
  releaseSec,
  fromSec,
  toSec,
  elapsedSec,
}: EnvelopeOptions) {
  end ??= base;
  return elapsedSec < fromSec
    ? base
    : elapsedSec < toSec
      ? peak -
        (peak - active) *
          (1 - ((decaySec - (elapsedSec - fromSec)) / decaySec) ** 2)
      : active -
        (active - end) *
          (1 - ((decaySec - (elapsedSec - toSec)) / releaseSec) ** 2);
}
