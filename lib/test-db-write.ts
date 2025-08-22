// Simple test script to verify database writes
import { getDatabase } from '@/lib/mongodb';
import { ObjectId, UpdateFilter, Document } from 'mongodb';

export async function testDirectWrite() {
  try {
    const db = await getDatabase();
    const collection = db.collection('projects');

    const projectId = '68a6f3a5fafcc0ce2e4dfdd3';
    const phaseId = 'd7fdd44a-760e-4450-aaf4-e67134008f9e';

    const testUpdate = {
      _id: new ObjectId().toString(),
      userId: 'test-user',
      userName: 'Test User',
      message: 'Direct test update',
      createdAt: new Date(),
    };

    console.log('Testing direct MongoDB write...');

    // First get the current document
    const beforeDoc = await collection.findOne({
      _id: new ObjectId(projectId),
    });
    console.log(
      'Before update - phase updates count:',
      (
        beforeDoc as { timeline?: Array<{ _id: string; updates?: unknown[] }> }
      )?.timeline?.find((p) => p._id === phaseId)?.updates?.length || 0
    );

    // Try the update using arrayFilters
    const result = await collection.updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: { 'timeline.$[elem].updates': testUpdate },
      } as unknown as UpdateFilter<Document>,
      {
        arrayFilters: [{ 'elem._id': phaseId }],
      }
    );

    console.log('Update result:', {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });

    // Check the document after update
    const afterDoc = await collection.findOne({ _id: new ObjectId(projectId) });
    console.log(
      'After update - phase updates count:',
      (
        afterDoc as { timeline?: Array<{ _id: string; updates?: unknown[] }> }
      )?.timeline?.find((p) => p._id === phaseId)?.updates?.length || 0
    );

    return result;
  } catch (error) {
    console.error('Test write error:', error);
    throw error;
  }
}
