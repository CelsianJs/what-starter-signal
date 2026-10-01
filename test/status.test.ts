import { describe, expect, it } from 'vitest';
import { findIncident, healthSnapshot, statusSummary } from '../src/data/status';

describe('Signal dataset', () => {
  it('summarizes operational and degraded services', () => {
    expect(statusSummary()).toMatchObject({
      degradedCount: 2,
      operationalCount: 3,
      incidentCount: 2,
    });
  });

  it('returns routeable incident details', () => {
    expect(findIncident('aurora-latency')?.timeline).toHaveLength(3);
    expect(findIncident('missing')).toBeUndefined();
  });

  it('builds bounded health snapshots', () => {
    const snapshot = healthSnapshot(new Date('2026-10-01T00:00:00.000Z'));
    expect(snapshot).toEqual({
      ok: false,
      checkedAt: '2026-10-01T00:00:00.000Z',
      services: 5,
      degraded: 2,
      incidents: 2,
    });
  });
});
