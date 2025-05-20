
export const formatBudget = (budget: string): string => {
  switch(budget) {
    case "<500000": return "Less than ₦500,000";
    case "500000-2000000": return "₦500,000 - ₦2,000,000";
    case "2000000-5000000": return "₦2,000,000 - ₦5,000,000";
    case "5000000-10000000": return "₦5,000,000 - ₦10,000,000";
    case "10000000+": return "Above ₦10,000,000";
    default: return budget;
  }
};

export const formatTimeframe = (timeframe: string): string => {
  switch(timeframe) {
    case "asap": return "As soon as possible";
    case "1-3months": return "1-3 months";
    case "3-6months": return "3-6 months";
    case "6months+": return "6+ months";
    default: return timeframe;
  }
};

// Helper to get service name from ID (in a real app, this would fetch from the database)
export const getServiceName = (id: string): string => {
  const services: Record<string, string> = {
    "1": "Web Design & Development",
    "2": "Mobile App Development",
    "3": "Digital Marketing",
    "4": "SEO Optimization",
    "5": "Social Media Management"
  };
  return services[id] || id;
};
