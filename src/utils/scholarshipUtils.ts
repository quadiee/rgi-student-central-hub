
import { supabase } from '../integrations/supabase/client';

export const initializeScholarshipEligibility = async (academicYear: string = '2024-25') => {
  try {
    console.log('Initializing scholarship eligibility...');
    
    // Get all active students
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, name, roll_number, community, first_generation')
      .eq('role', 'student')
      .eq('is_active', true);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    console.log(`Found ${students?.length || 0} active students`);

    if (!students || students.length === 0) {
      console.log('No active students found');
      return { success: false, message: 'No active students found' };
    }

    let updatedCount = 0;
    let scholarshipCount = 0;

    // Initialize scholarship records for eligible students
    for (const student of students) {
      // For demo purposes, assign some students SC/ST community and first generation status
      const needsUpdate = !student.community && !student.first_generation;
      let studentEligibilityUpdated = false;
      
      if (needsUpdate) {
        // Randomly assign some students to have scholarships for demo (30% total eligibility)
        const random = Math.random();
        let updateData: any = {};
        
        if (random < 0.12) { // 12% get SC community
          updateData.community = 'SC';
        } else if (random < 0.20) { // 8% get ST community  
          updateData.community = 'ST';
        } else if (random < 0.25) { // 5% get OBC community
          updateData.community = 'OBC';
        } else if (random < 0.30) { // 5% are first generation
          updateData.first_generation = true;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', student.id);

          if (updateError) {
            console.error(`Error updating student ${student.name}:`, updateError);
          } else {
            console.log(`Updated ${student.name} with scholarship eligibility`);
            updatedCount++;
            studentEligibilityUpdated = true;
          }
        }
      }

      // Calculate scholarship eligibility for students with eligibility data
      const hasEligibility = student.community || student.first_generation || studentEligibilityUpdated;
      
      if (hasEligibility) {
        try {
          const { error: eligibilityError } = await supabase
            .rpc('calculate_scholarship_eligibility', {
              p_student_id: student.id,
              p_academic_year: academicYear
            });

          if (eligibilityError) {
            console.error(`Error calculating eligibility for ${student.name}:`, eligibilityError);
          } else {
            scholarshipCount++;
          }
        } catch (rpcError) {
          console.error(`RPC error for ${student.name}:`, rpcError);
        }
      }
    }

    console.log(`Scholarship eligibility initialization completed. Updated ${updatedCount} students, processed ${scholarshipCount} scholarship calculations.`);
    
    return { 
      success: true, 
      message: `Successfully updated ${updatedCount} students and processed ${scholarshipCount} scholarship calculations`,
      updatedStudents: updatedCount,
      scholarshipsProcessed: scholarshipCount
    };
  } catch (error) {
    console.error('Error in scholarship initialization:', error);
    return { 
      success: false, 
      message: `Failed to initialize scholarships: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error 
    };
  }
};

export const getScholarshipStats = async (academicYear: string = '2024-25') => {
  try {
    // Get eligible students count
    const { data: eligibleStudents, error: eligibleError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .eq('is_active', true)
      .or('community.in.(SC,ST,OBC),first_generation.eq.true');

    if (eligibleError) throw eligibleError;

    // Get scholarship records count
    const { data: scholarships, error: scholarshipError } = await supabase
      .from('scholarships')
      .select('id')
      .eq('academic_year', academicYear);

    if (scholarshipError) throw scholarshipError;

    return {
      eligibleStudents: eligibleStudents?.length || 0,
      scholarshipRecords: scholarships?.length || 0
    };
  } catch (error) {
    console.error('Error getting scholarship stats:', error);
    return { eligibleStudents: 0, scholarshipRecords: 0 };
  }
};
