
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductReviewFormData } from "@/types/productReviews";
import { submitProductReview } from "@/components/admin/products/ProductReviewService";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleStarClick = (value: number) => {
    setRating(value);
  };
  
  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };
  
  const resetForm = () => {
    setName("");
    setEmail("");
    setRating(0);
    setComment("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const reviewData: ProductReviewFormData = {
      name,
      email,
      rating,
      comment
    };
    
    const success = await submitProductReview(productId, reviewData);
    
    if (success) {
      toast({
        title: "Review Submitted",
        description: "Thank you for your review! It will be visible after approval.",
      });
      resetForm();
      onReviewSubmitted();
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Write a Review</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="john@example.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleStarClick(value)}
              onMouseEnter={() => handleStarHover(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                fill={(hoverRating || rating) >= value ? "currentColor" : "none"}
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || rating) >= value 
                    ? "text-yellow-500" 
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea 
          id="comment" 
          value={comment} 
          onChange={(e) => setComment(e.target.value)} 
          required 
          placeholder="Share your experience with this product..."
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        type="submit" 
        className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
      
      <p className="text-sm text-gray-500">
        Your review will be visible after approval. Thank you for your feedback!
      </p>
    </form>
  );
};

export default ReviewForm;
