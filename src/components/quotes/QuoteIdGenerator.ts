
// Generate a unique quote ID
export const generateQuoteId = (quoteType: "digital" | "product") => {
  const prefix = quoteType === "digital" ? "DS" : "PQ";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};
