// Manual script to cleanup old transactions
// Run with: node scripts/cleanup-transactions.js

const mongoose = require('mongoose');

async function cleanupTransactions() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doy-again';
    await mongoose.connect(MONGODB_URI);
    
    console.log('✓ Connected to MongoDB');
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log(`\nDeleting transactions older than: ${thirtyDaysAgo.toISOString()}`);
    
    // Preview count
    const count = await mongoose.connection.collection('transactions').countDocuments({
      date: { $lt: thirtyDaysAgo }
    });
    
    console.log(`Found ${count} transactions to delete`);
    
    if (count === 0) {
      console.log('No transactions to delete. Exiting.');
      await mongoose.disconnect();
      return;
    }
    
    // Ask for confirmation (in production, you might want to skip this)
    console.log('\nDeleting in 3 seconds... Press Ctrl+C to cancel');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete old transactions
    const result = await mongoose.connection.collection('transactions').deleteMany({
      date: { $lt: thirtyDaysAgo }
    });
    
    console.log(`\n✓ Successfully deleted ${result.deletedCount} transactions`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

cleanupTransactions();
