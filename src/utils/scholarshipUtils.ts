
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
      return;
    }

    console.log(`Found ${students?.length || 0} active students`);

    // Initialize scholarship records for eligible students
    for (const student of students || []) {
      // For demo purposes, assign some students SC/ST community and first generation status
      const needsUpdate = !student.community && !student.first_generation;
      
      if (needsUpdate) {
        // Randomly assign some students to have scholarships for demo
        const random = Math.random();
        let updateData: any = {};
        
        if (random < 0.15) { // 15% get SC community
          updateData.community = 'SC';
        } else if (random < 0.25) { // 10% get ST community  
          updateData.community = 'ST';
        } else if (random < 0.35) { // 10% get OBC community
          updateData.community = 'OBC';
        } else if (random < 0.5) { // 15% are first generation
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
          }
        }
      }

      // Calculate scholarship eligibility using the function
      if (student.community || student.first_generation) {
        const { error: eligibilityError } = await supabase
          .rpc('calculate_scholarship_eligibility', {
            p_student_id: student.id,
            p_academic_year: academicYear
          });

        if (eligibilityError) {
          console.error(`Error calculating eligibility for ${student.name}:`, eligibilityError);
        }
      }
    }

    console.log('Scholarship eligibility initialization completed');
  } catch (error) {
    console.error('Error in scholarship initialization:', error);
  }
};
