import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../storage/database';
import { Alert } from 'react-native';

export const BackupService = {
  async exportBackup(): Promise<void> {
    try {
      const db = await getDatabase();

      const households = await db.getAllAsync('SELECT * FROM households');
      const household_members = await db.getAllAsync('SELECT * FROM household_members');
      const grocery_lists = await db.getAllAsync('SELECT * FROM grocery_lists');
      const grocery_items = await db.getAllAsync('SELECT * FROM grocery_items');
      const expense_categories = await db.getAllAsync('SELECT * FROM expense_categories');
      const expenses = await db.getAllAsync('SELECT * FROM expenses');
      const bills = await db.getAllAsync('SELECT * FROM bills');
      const task_categories = await db.getAllAsync('SELECT * FROM task_categories');
      const tasks = await db.getAllAsync('SELECT * FROM tasks');
      const reminders = await db.getAllAsync('SELECT * FROM reminders');
      const important_dates = await db.getAllAsync('SELECT * FROM important_dates');
      const notes = await db.getAllAsync('SELECT * FROM notes');

      const backupData = {
        version: 1,
        exportDate: new Date().toISOString(),
        data: {
          households,
          household_members,
          grocery_lists,
          grocery_items,
          expense_categories,
          expenses,
          bills,
          task_categories,
          tasks,
          reminders,
          important_dates,
          notes,
        },
      };

      const fileName = `home-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${Paths.cache.uri}/${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Home Manager Backup',
        UTI: 'public.json',
      });
    } catch (error: any) {
      console.error('Backup export error:', error);
      Alert.alert('Backup Failed', error?.message || 'Could not generate backup file.');
    }
  },
};
