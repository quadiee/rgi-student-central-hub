
// Utility to identify mock data usage and provide real alternatives
export class MockDataRemovalHelper {
  static logMockDataUsage(componentName: string, mockDataSource: string) {
    console.warn(
      `🚨 MOCK DATA DETECTED in ${componentName}: Using ${mockDataSource}. ` +
      `This should be replaced with real Supabase data.`
    );
  }

  static validateRealData(data: any, source: string) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.info(`✅ Real data source ${source} returned empty result - this is expected for new systems.`);
      return false;
    }
    console.info(`✅ Successfully loaded real data from ${source}`);
    return true;
  }

  static createEmptyStateMessage(dataType: string) {
    return {
      title: `No ${dataType} Data Available`,
      description: `No ${dataType.toLowerCase()} records found in the database. This is normal for a new system.`,
      action: `Start by adding some ${dataType.toLowerCase()} data through the management interface.`
    };
  }

  // Helper to detect if data looks like mock data
  static isMockData(data: any): boolean {
    if (!data) return false;
    
    // Check for common mock data patterns
    const dataStr = JSON.stringify(data);
    const mockIndicators = [
      'mock',
      'example.com',
      'test@',
      'lorem ipsum',
      'sample',
      'dummy',
      'placeholder'
    ];
    
    return mockIndicators.some(indicator => 
      dataStr.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  static reportDataSource(componentName: string, data: any, source: string) {
    if (this.isMockData(data)) {
      this.logMockDataUsage(componentName, source);
    } else {
      console.info(`✅ ${componentName} using real data from ${source}`);
    }
  }
}
