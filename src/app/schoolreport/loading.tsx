// src/app/schoolreport/loading.tsx
import Loader from '@/components/ui/Loader';

export default function SchoolReportLoading() {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
      <Loader
        message="Fetching School Reports..."
        subMessage="Compiling latest field submissions and staff/student rosters"
      />
    </div>
  );
}