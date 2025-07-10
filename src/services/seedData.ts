
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/types';
import { createSampleScholarshipData } from '../utils/scholarshipUtils';

type Department = Database['public']['Enums']['department'];
type PaymentMethod = Database['public']['Enums']['payment_method'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

export class SeedDataService {
  static async seedFeeStructures() {
    console.log('Seeding fee structures...');
    
    const feeStructures = [
      // CSE Department
      {
        academic_year: '2024-25',
        semester: 1,
        department: 'CSE' as Department,
        fee_categories: [
          { id: '1', name: 'Tuition Fee', amount: 45000, mandatory: true },
          { id: '2', name: 'Lab Fee', amount: 8000, mandatory: true },
          { id: '3', name: 'Library Fee', amount: 2000, mandatory: true },
          { id: '4', name: 'Development Fee', amount: 5000, mandatory: true },
          { id: '5', name: 'Sports Fee', amount: 1500, mandatory: false }
        ],
        total_amount: 61500,
        due_date: '2024-08-15',
        late_fee_percentage: 5.0,
        installment_allowed: true,
        max_installments: 3,
        is_active: true
      },
      {
        academic_year: '2024-25',
        semester: 2,
        department: 'CSE' as Department,
        fee_categories: [
          { id: '1', name: 'Tuition Fee', amount: 45000, mandatory: true },
          { id: '2', name: 'Lab Fee', amount: 8000, mandatory: true },
          { id: '3', name: 'Library Fee', amount: 2000, mandatory: true },
          { id: '4', name: 'Exam Fee', amount: 3000, mandatory: true }
        ],
        total_amount: 58000,
        due_date: '2025-01-15',
        late_fee_percentage: 5.0,
        installment_allowed: true,
        max_installments: 2,
        is_active: true
      },
      // ECE Department
      {
        academic_year: '2024-25',
        semester: 1,
        department: 'ECE' as Department,
        fee_categories: [
          { id: '1', name: 'Tuition Fee', amount: 42000, mandatory: true },
          { id: '2', name: 'Lab Fee', amount: 12000, mandatory: true },
          { id: '3', name: 'Library Fee', amount: 2000, mandatory: true },
          { id: '4', name: 'Development Fee', amount: 5000, mandatory: true }
        ],
        total_amount: 61000,
        due_date: '2024-08-15',
        late_fee_percentage: 5.0,
        installment_allowed: true,
        max_installments: 3,
        is_active: true
      },
      // MECH Department
      {
        academic_year: '2024-25',
        semester: 1,
        department: 'MECH' as Department,
        fee_categories: [
          { id: '1', name: 'Tuition Fee', amount: 40000, mandatory: true },
          { id: '2', name: 'Workshop Fee', amount: 15000, mandatory: true },
          { id: '3', name: 'Library Fee', amount: 2000, mandatory: true },
          { id: '4', name: 'Development Fee', amount: 5000, mandatory: true }
        ],
        total_amount: 62000,
        due_date: '2024-08-15',
        late_fee_percentage: 5.0,
        installment_allowed: true,
        max_installments: 3,
        is_active: true
      }
    ];

    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .insert(feeStructures)
        .select();

      if (error) {
        console.error('Error seeding fee structures:', error);
        throw error;
      }

      console.log('Fee structures seeded successfully:', data?.length);
      return data;
    } catch (error) {
      console.error('Error in seedFeeStructures:', error);
      throw error;
    }
  }

  static async seedSampleProfiles() {
    console.log('Note: Sample profiles will be created when users sign up through authentication.');
    console.log('The profiles table is linked to Supabase auth.users and will auto-populate.');
    
    // Sample profile data that would be created during user registration
    const sampleProfiles = [
      {
        name: 'Admin User',
        email: 'admin@rgce.edu.in',
        role: 'admin',
        department: 'ADMIN',
        employee_id: 'EMP001'
      },
      {
        name: 'Dr. John Smith',
        email: 'john.smith@rgce.edu.in',
        role: 'principal',
        department: 'ADMIN',
        employee_id: 'EMP002'
      },
      {
        name: 'Dr. CSE HOD',
        email: 'cse.hod@rgce.edu.in',
        role: 'hod',
        department: 'CSE',
        employee_id: 'EMP003'
      }
    ];

    console.log('Sample profiles that will be created:', sampleProfiles);
    return sampleProfiles;
  }

  static async initializeSystem() {
    console.log('Initializing RGCE Finance System...');
    
    try {
      // Seed fee structures
      await this.seedFeeStructures();
      
      // Log sample profiles info
      await this.seedSampleProfiles();
      
      // Initialize scholarship data
      console.log('Creating sample scholarship data...');
      const scholarshipResult = await createSampleScholarshipData('2024-25');
      console.log('Scholarship initialization result:', scholarshipResult);
      
      console.log('System initialization completed successfully!');
      console.log('Next steps:');
      console.log('1. Users need to sign up through the authentication system');
      console.log('2. Admin users can create fee records for students');
      console.log('3. Students can view and pay their fees');
      console.log('4. HODs and Admins can generate reports');
      console.log('5. Scholarship data has been initialized for eligible students');
      
      return {
        success: true,
        message: 'Finance system initialized with sample data including scholarships',
        scholarshipResult
      };
    } catch (error) {
      console.error('Error initializing system:', error);
      throw error;
    }
  }
}
