import type { ThenReply, ThenRequest } from '@celsian/vura-core';
import { healthSnapshot } from '../data/status';

export const route = {
  kind: 'serverless',
  compute: { class: 'function', memory: '1gb' },
};

export function GET(_req: ThenRequest, reply: ThenReply) {
  return reply.json({
    ...healthSnapshot(),
    feature: 'bounded-health-api',
    fictional: true,
  });
}
