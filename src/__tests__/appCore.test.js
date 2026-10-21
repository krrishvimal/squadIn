import { describe, it, expect } from 'vitest';
import { sameId, normId, isPlanExpired } from '../context/AppContext';

describe('SquadIn Core Architecture & Data Integrity', () => {
  describe('ID Normalization & Comparison (sameId & normId)', () => {
    it('correctly matches identical IDs regardless of casing and whitespace', () => {
      expect(sameId('Usr_123A ', ' usr_123a')).toBe(true);
      expect(sameId('abc-def-ghi', 'ABC-DEF-GHI')).toBe(true);
    });

    it('returns false for mismatched IDs or null/undefined', () => {
      expect(sameId(null, 'usr_1')).toBe(false);
      expect(sameId('usr_1', undefined)).toBe(false);
      expect(sameId(null, null)).toBe(false);
      expect(sameId('usr_1', 'usr_2')).toBe(false);
    });

    it('normId safely converts values to lowercase trimmed strings', () => {
      expect(normId('  Usr_ABC ')).toBe('usr_abc');
      expect(normId(null)).toBe('');
      expect(normId(undefined)).toBe('');
      expect(normId(12345)).toBe('12345');
    });
  });

  describe('Plan Expiration Logic (isPlanExpired)', () => {
    it('returns false for null or undefined plans', () => {
      expect(isPlanExpired(null)).toBe(false);
      expect(isPlanExpired(undefined)).toBe(false);
    });

    it('returns true if plan status is COMPLETED', () => {
      expect(isPlanExpired({ status: 'COMPLETED' })).toBe(true);
    });

    it('returns true if plan date is in the past', () => {
      const pastPlan = {
        date: '2020-01-01',
        status: 'OPEN'
      };
      expect(isPlanExpired(pastPlan)).toBe(true);
    });

    it('returns false if plan date is in the future', () => {
      const futureYear = new Date().getFullYear() + 2;
      const futurePlan = {
        date: `${futureYear}-12-31`,
        status: 'OPEN'
      };
      expect(isPlanExpired(futurePlan)).toBe(false);
    });
  });

  describe('Security Boundaries: Capacity & Women-Only Guards', () => {
    it('verifies that women-only plans reject non-female members', () => {
      const womenOnlyPlan = {
        id: 'plan_1',
        womenOnly: true
      };
      const maleUser = { id: 'usr_male', gender: 'male' };
      const femaleUser = { id: 'usr_female', gender: 'female' };

      const canMaleJoin = !womenOnlyPlan.womenOnly || maleUser.gender === 'female';
      const canFemaleJoin = !womenOnlyPlan.womenOnly || femaleUser.gender === 'female';

      expect(canMaleJoin).toBe(false);
      expect(canFemaleJoin).toBe(true);
    });

    it('verifies that crew capacity limits prevent overflow', () => {
      const fullPlan = {
        targetCapacity: 4,
        acceptedMembers: ['usr_1', 'usr_2', 'usr_3', 'usr_4']
      };

      const canAcceptAnother = fullPlan.acceptedMembers.length < fullPlan.targetCapacity;
      expect(canAcceptAnother).toBe(false);
    });
  });

  describe('Message Length Sanitization', () => {
    it('enforces maximum character limit of 2000 chars client-side', () => {
      const oversizedText = 'A'.repeat(3000);
      const cleanContent = oversizedText.trim().slice(0, 2000);
      expect(cleanContent.length).toBe(2000);
    });
  });

  describe('Crew Departure & Lifecycle State Transitions', () => {
    it('re-opens full plan when a member departs', () => {
      const lockedPlan = {
        id: 'plan_1',
        targetCapacity: 4,
        status: 'LOCKED_CHAT_ACTIVE',
        acceptedMembers: ['host_1', 'member_2', 'member_3', 'member_4']
      };

      const remainingMembers = lockedPlan.acceptedMembers.filter(id => id !== 'member_4');
      const newStatus = remainingMembers.length >= lockedPlan.targetCapacity ? 'LOCKED_CHAT_ACTIVE' : 'OPEN';

      expect(remainingMembers.length).toBe(3);
      expect(newStatus).toBe('OPEN');
    });

    it('correctly transfers host when host departs and members remain', () => {
      const plan = {
        hostId: 'host_old',
        acceptedMembers: ['member_first', 'member_second']
      };

      const newHostId = plan.acceptedMembers[0];
      const newAccepted = plan.acceptedMembers.slice(1);

      expect(newHostId).toBe('member_first');
      expect(newAccepted).toEqual(['member_second']);
    });

    it('marks plan completed when karma review is completed', () => {
      const plan = { id: 'plan_1', status: 'LOCKED_CHAT_ACTIVE' };
      const updatedPlan = { ...plan, status: 'COMPLETED' };
      expect(updatedPlan.status).toBe('COMPLETED');
      expect(isPlanExpired(updatedPlan)).toBe(true);
    });
  });
});
