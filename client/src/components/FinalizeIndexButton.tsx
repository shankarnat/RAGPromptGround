import React, { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinalizeIndexButtonProps {
  className?: string;
}

const FinalizeIndexButton: FC<FinalizeIndexButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleFinalize = () => {
    setIsProcessing(true);
    
    // Simulate index creation
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "Index Created Successfully",
        description: "Your document index has been finalized and created.",
      });
      
      // Close dialog after success message shown
      setTimeout(() => {
        setIsComplete(false);
        setOpen(false);
      }, 1500);
    }, 2000);
  };

  return (
    <>
      <Button 
        className={`${className || ''}`}
        variant="default"
        onClick={() => setOpen(true)}
      >
        Finalize and Create Index
      </Button>
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Document Index</AlertDialogTitle>
            <AlertDialogDescription>
              This will finalize all your configuration settings and create the document index with the current settings. 
              The index will include your document chunks, metadata, and all configured fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Creating index...</p>
            </div>
          ) : isComplete ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Index created successfully!</p>
            </div>
          ) : (
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleFinalize();
                }}
                disabled={isProcessing}
              >
                Create Index
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FinalizeIndexButton;