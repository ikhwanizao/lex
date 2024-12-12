import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg text-gray-400 animate-pulse">Loading your vocabulary...</p>
        </div>
    );
};

export default LoadingSpinner;