
import { Button } from "@/components/ui/button";

const ReportsTab = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-500 mb-2">Reports Module</h3>
        <p className="text-gray-400">Sales and inventory reports coming soon</p>
        <Button variant="outline" className="mt-4">Generate Sample Report</Button>
      </div>
    </div>
  );
};

export default ReportsTab;
