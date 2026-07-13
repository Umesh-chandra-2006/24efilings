import { Lead } from '../types';

export const calculateLeadScore = (lead: Lead): number => {
  let score = 0;

  // Priority Points (Max 30)
  switch (lead.priority) {
    case 'Hot':
      score += 30;
      break;
    case 'Warm':
      score += 15;
      break;
    case 'Cold':
      score += 5;
      break;
  }

  // Engagement Points (Max 30)
  const activityScore = (lead.activities?.length || 0) * 3;
  const completedTaskScore = (lead.tasks?.filter(t => t.is_completed).length || 0) * 4;
  score += Math.min(activityScore + completedTaskScore, 30);

  // Qualification Points (Max 25)
  const documentScore = (lead.documents?.length || 0) * 10;
  const paymentScore = (lead.total_payment && lead.total_payment > 0) ? 20 : 0;
  score += Math.min(documentScore + paymentScore, 25);
  
  // Source Points (Max 15)
  switch (lead.source) {
    case 'Referral':
      score += 15;
      break;
    case 'Website':
      score += 10;
      break;
    case 'Social Media':
       score += 5;
       break;
  }
  
  return Math.min(Math.round(score), 100); // Cap score at 100 and round it
};

export const getScoreCategory = (score: number): { category: 'Hot' | 'Warm' | 'Cold'; color: string; textColor: string } => {
  if (score > 70) {
    return { category: 'Hot', color: 'bg-red-100', textColor: 'text-red-800' };
  }
  if (score > 40) {
    return { category: 'Warm', color: 'bg-yellow-100', textColor: 'text-yellow-800' };
  }
  return { category: 'Cold', color: 'bg-blue-100', textColor: 'text-blue-800' };
};

// Function for detailed score breakdown
export const getScoreBreakdown = (lead: Lead): { label: string; points: number }[] => {
    const breakdown: { label: string; points: number }[] = [];

    // Priority
    let priorityPoints = 0;
    switch (lead.priority) {
        case 'Hot': priorityPoints = 30; break;
        case 'Warm': priorityPoints = 15; break;
        case 'Cold': priorityPoints = 5; break;
    }
    if (priorityPoints > 0) breakdown.push({ label: `Priority: ${lead.priority}`, points: priorityPoints });

    // Activities
    const activityCount = lead.activities?.length || 0;
    if (activityCount > 0) breakdown.push({ label: `${activityCount} Activities`, points: activityCount * 3 });

    // Completed Tasks
    const completedTasksCount = lead.tasks?.filter(t => t.is_completed).length || 0;
    if (completedTasksCount > 0) breakdown.push({ label: `${completedTasksCount} Completed Tasks`, points: completedTasksCount * 4 });

    // Documents
    const documentCount = lead.documents?.length || 0;
    if (documentCount > 0) breakdown.push({ label: `${documentCount} Documents`, points: documentCount * 10 });
    
    // Payment Set
    if (lead.total_payment && lead.total_payment > 0) {
        breakdown.push({ label: 'Payment Info Added', points: 20 });
    }
    
    // Source
    let sourcePoints = 0;
    switch (lead.source) {
        case 'Referral': sourcePoints = 15; break;
        case 'Website': sourcePoints = 10; break;
        case 'Social Media': sourcePoints = 5; break;
    }
    if (sourcePoints > 0) breakdown.push({ label: `Source: ${lead.source}`, points: sourcePoints });

    return breakdown;
}
