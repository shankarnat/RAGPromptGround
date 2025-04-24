import { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
}

const NavigationButtons: FC<NavigationButtonsProps> = ({ onPrevious, onNext }) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        className="flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      <Button 
        onClick={onNext}
        className="flex items-center bg-primary-600 hover:bg-primary-700"
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
