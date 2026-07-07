import type { RecordModel } from 'pocketbase';
import { pb } from '../lib/pocketbase';
import { AllowedAccount } from '../types';

function mapAccount(record: RecordModel): AllowedAccount {
  return {
    id: record.id,
    email: record.email ?? '',
    created: record.created,
    createdBy: record.created_by ?? '',
  };
}

export const accessService = {
  async listAllowedAccounts(): Promise<AllowedAccount[]> {
    const records = await pb
      .collection('allowed_accounts')
      .getFullList({ sort: '-created' });
    return records.map(mapAccount);
  },

  async listUsers(): Promise<import('../types').User[]> {
    const records = await pb.collection('users').getFullList({ sort: '-created' });
    return records.map(r => ({
      id: r.id,
      name: r.name ?? r.username ?? '',
      email: r.email ?? '',
      created: r.created,
    }));
  },

  async removeUser(id: string): Promise<void> {
    await pb.collection('users').delete(id);
  },

  async addAllowedAccount(email: string): Promise<AllowedAccount> {
    const data: Record<string, string> = { email };
    if (pb.authStore.model?.id) {
      data.created_by = pb.authStore.model.id;
    }
    const record = await pb.collection('allowed_accounts').create(data);
    return mapAccount(record);
  },

  async removeAllowedAccount(id: string): Promise<void> {
    await pb.collection('allowed_accounts').delete(id);
  },

  async getSignupSettings(): Promise<{ enabled: boolean }> {
    try {
      const result = await pb.collection('app_settings').getList(1, 1);
      if (!result.items.length) return { enabled: false };
      return { enabled: result.items[0].signups_enabled ?? false };
    } catch (error) {
      console.error('Failed to fetch signup settings:', error);
      return { enabled: false };
    }
  },

  async updateSignupSettings(enabled: boolean): Promise<{ enabled: boolean }> {
    const result = await pb.collection('app_settings').getList(1, 1);
    let updated;
    if (result.items.length) {
      updated = await pb
        .collection('app_settings')
        .update(result.items[0].id, { signups_enabled: enabled });
    } else {
      updated = await pb
        .collection('app_settings')
        .create({ signups_enabled: enabled });
    }
    return { enabled: updated.signups_enabled ?? false };
  },
};